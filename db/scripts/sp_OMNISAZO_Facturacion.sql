-- ============================================================================
-- OMNI-SAZO · Módulo de Facturación e Inventario (Método PEPS)
-- Script: sp_OMNISAZO_Facturacion.sql
-- @Jair: facturación transaccional + descuento de inventario FIFO/PEPS.
--
-- Reglas de integración:
--   1) Cotizaciones: solo se CONSUMEN en modo lectura (GET) para poblar la
--      factura. Se marca Estado = 'FACTURADA' al facturar (coordinado).
--   2) Compras/Bodega: el ingreso de stock lo manejan las recepciones. Aquí
--      SOLO se descuenta de INVENTARIO_LOTES ordenando por FechaIngreso ASC.
--   3) Auditoría: se registra el IdUsuario autenticado que emite la venta.
-- ============================================================================
USE [OMNISAZO];
GO

-- 1. Índice de soporte para la búsqueda PEPS (producto + fecha de ingreso)
IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE name = 'IX_INVENTARIO_LOTES_PEPS'
                 AND object_id = OBJECT_ID('INVENTARIO_LOTES'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_INVENTARIO_LOTES_PEPS
    ON [INVENTARIO_LOTES] ([IdProducto] ASC, [FechaIngreso] ASC, [IdLote] ASC)
    INCLUDE ([CantidadDisponible]);
END;
GO

-- 2. Stock disponible por producto (para el carrito del frontend)
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerStockDisponible
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        [IdProducto],
        SUM([CantidadDisponible]) AS StockDisponible
    FROM [INVENTARIO_LOTES]
    GROUP BY [IdProducto];
END;
GO

-- 3. Creación transaccional de factura con descuento PEPS
CREATE OR ALTER PROCEDURE dbo.sp_CrearFacturaPEPS
    @IdCliente            INT,
    @IdCotizacion         INT = NULL,
    @IdUsuario            INT,
    @DetalleProductosJson NVARCHAR(MAX),
    @MediosPagoJson       NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @IdFactura        INT;
    DECLARE @MontoTotal       DECIMAL(10,2);
    DECLARE @IdProducto       INT,
            @CantidadPedida   INT,
            @PrecioUnitario   DECIMAL(10,2);
    DECLARE @CantidadRestante INT;
    DECLARE @IdLote           INT,
            @LoteDisponible   INT,
            @Tomar            INT;
    DECLARE @TotalPagado      DECIMAL(10,2);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- ---------------------------------------------------------------
        -- Validaciones de encabezado
        -- ---------------------------------------------------------------
        IF NOT EXISTS (SELECT 1 FROM [CLIENTES] WHERE [IdCliente] = @IdCliente)
            RAISERROR('El cliente seleccionado no existe.', 16, 1);

        IF NOT EXISTS (SELECT 1 FROM [USUARIOS] WHERE [IdUsuario] = @IdUsuario AND [Estado] = 1)
            RAISERROR('El usuario emisor no existe o está inactivo.', 16, 1);

        IF @IdCotizacion IS NOT NULL
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM [COTIZACIONES_ENCABEZADO] WHERE [IdCotizacion] = @IdCotizacion)
                RAISERROR('La cotización indicada no existe.', 16, 1);

            IF EXISTS (SELECT 1 FROM [FACTURAS_ENCABEZADO] WHERE [IdCotizacion] = @IdCotizacion)
                RAISERROR('La cotización ya fue facturada anteriormente.', 16, 1);
        END

        IF ISJSON(@DetalleProductosJson) = 0
            RAISERROR('El detalle de productos no es un JSON válido.', 16, 1);

        IF ISJSON(@MediosPagoJson) = 0
            RAISERROR('El desglose de medios de pago no es un JSON válido.', 16, 1);

        -- ---------------------------------------------------------------
        -- Recalcular el MontoTotal desde el detalle (no se confía del cliente)
        -- ---------------------------------------------------------------
        SELECT @MontoTotal = SUM([cantidad] * [precioUnitario])
        FROM OPENJSON(@DetalleProductosJson)
        WITH (
            [cantidad]       INT           '$.cantidad',
            [precioUnitario] DECIMAL(10,2) '$.precioUnitario'
        );

        IF @MontoTotal IS NULL OR @MontoTotal <= 0
            RAISERROR('El detalle está vacío o el total calculado es inválido.', 16, 1);

        -- ---------------------------------------------------------------
        -- Validar medios de pago (existentes y con monto positivo)
        -- ---------------------------------------------------------------
        IF EXISTS (
            SELECT 1
            FROM OPENJSON(@MediosPagoJson)
            WITH ([IdMedioPago] INT '$.idMedioPago', [Monto] DECIMAL(10,2) '$.monto') AS p
            WHERE p.[IdMedioPago] IS NULL
               OR NOT EXISTS (SELECT 1 FROM [MEDIOS_PAGO] m WHERE m.[IdMedioPago] = p.[IdMedioPago])
               OR p.[Monto] IS NULL OR p.[Monto] <= 0
        )
            RAISERROR('Uno o más medios de pago son inválidos.', 16, 1);

        -- ---------------------------------------------------------------
        -- Insertar encabezado de la factura
        -- ---------------------------------------------------------------
        INSERT INTO [FACTURAS_ENCABEZADO]
            ([IdCotizacion], [IdCliente], [IdUsuario], [FechaEmision], [MontoTotal], [Estado])
        VALUES
            (@IdCotizacion, @IdCliente, @IdUsuario, GETDATE(), @MontoTotal, 'PAGADA');

        SET @IdFactura = SCOPE_IDENTITY();

        -- ---------------------------------------------------------------
        -- Procesar detalle aplicando PEPS (una fila por lote afectado)
        -- ---------------------------------------------------------------
        DECLARE detalle_cursor CURSOR LOCAL FAST_FORWARD FOR
            SELECT [idProducto], [cantidad], [precioUnitario]
            FROM OPENJSON(@DetalleProductosJson)
            WITH (
                [idProducto]     INT           '$.idProducto',
                [cantidad]       INT           '$.cantidad',
                [precioUnitario] DECIMAL(10,2) '$.precioUnitario'
            );

        OPEN detalle_cursor;
        FETCH NEXT FROM detalle_cursor INTO @IdProducto, @CantidadPedida, @PrecioUnitario;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM [PRODUCTOS] WHERE [IdProducto] = @IdProducto)
                RAISERROR('Uno de los productos del detalle no existe.', 16, 1);

            IF @CantidadPedida IS NULL OR @CantidadPedida <= 0
                RAISERROR('La cantidad de un producto es inválida.', 16, 1);

            SET @CantidadRestante = @CantidadPedida;

            -- Lotes con stock disponible, ordenados por FechaIngreso ASC (PEPS).
            -- UPDLOCK/ROWLOCK serializa el descuento y evita sobreventa concurrente.
            DECLARE lote_cursor CURSOR LOCAL FAST_FORWARD FOR
                SELECT [IdLote], [CantidadDisponible]
                FROM [INVENTARIO_LOTES] WITH (UPDLOCK, ROWLOCK)
                WHERE [IdProducto] = @IdProducto AND [CantidadDisponible] > 0
                ORDER BY [FechaIngreso] ASC, [IdLote] ASC;

            OPEN lote_cursor;
            FETCH NEXT FROM lote_cursor INTO @IdLote, @LoteDisponible;

            WHILE @@FETCH_STATUS = 0 AND @CantidadRestante > 0
            BEGIN
                IF @LoteDisponible >= @CantidadRestante
                    SET @Tomar = @CantidadRestante;
                ELSE
                    SET @Tomar = @LoteDisponible;

                INSERT INTO [FACTURAS_DETALLE]
                    ([IdFactura], [IdProducto], [IdLote], [Cantidad], [PrecioUnitario], [Subtotal])
                VALUES
                    (@IdFactura, @IdProducto, @IdLote, @Tomar, @PrecioUnitario, @Tomar * @PrecioUnitario);

                UPDATE [INVENTARIO_LOTES]
                SET [CantidadDisponible] = [CantidadDisponible] - @Tomar
                WHERE [IdLote] = @IdLote;

                SET @CantidadRestante = @CantidadRestante - @Tomar;

                FETCH NEXT FROM lote_cursor INTO @IdLote, @LoteDisponible;
            END

            CLOSE lote_cursor;
            DEALLOCATE lote_cursor;

            IF @CantidadRestante > 0
                RAISERROR('Stock insuficiente para el producto IdProducto=%d.', 16, 1, @IdProducto);

            FETCH NEXT FROM detalle_cursor INTO @IdProducto, @CantidadPedida, @PrecioUnitario;
        END

        CLOSE detalle_cursor;
        DEALLOCATE detalle_cursor;

        -- ---------------------------------------------------------------
        -- Insertar medios de pago
        -- ---------------------------------------------------------------
        INSERT INTO [FACTURAS_PAGOS] ([IdFactura], [IdMedioPago], [Monto])
        SELECT @IdFactura, [IdMedioPago], [Monto]
        FROM OPENJSON(@MediosPagoJson)
        WITH ([IdMedioPago] INT '$.idMedioPago', [Monto] DECIMAL(10,2) '$.monto');

        -- ---------------------------------------------------------------
        -- Validar que la suma de pagos coincida con el total
        -- ---------------------------------------------------------------
        SELECT @TotalPagado = SUM([Monto]) FROM [FACTURAS_PAGOS] WHERE [IdFactura] = @IdFactura;

        IF @TotalPagado <> @MontoTotal
            RAISERROR('La suma de los pagos no coincide con el total de la factura.', 16, 1);

        -- ---------------------------------------------------------------
        -- Cerrar el ciclo de la cotización (decisión de coordinación aprobada)
        -- ---------------------------------------------------------------
        IF @IdCotizacion IS NOT NULL
            UPDATE [COTIZACIONES_ENCABEZADO]
            SET [Estado] = 'FACTURADA'
            WHERE [IdCotizacion] = @IdCotizacion;

        COMMIT TRANSACTION;

        SELECT 1 AS Exito, @IdFactura AS IdFactura, 'Factura generada y stock actualizado (PEPS).' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje, ERROR_NUMBER() AS ErrorNumero;
    END CATCH
END;
GO
