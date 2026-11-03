USE [OMNISAZO];
GO

-- ============================================================================
-- MODULO DE ANULACION TRANSACCIONAL DE FACTURAS
-- Ferreteria y Pinturas OMNI-SAZO
-- Basado estrictamente en el esquema de PFBD2Script.sql
-- ============================================================================

-- Stored Procedure: Consultar datos completos de una factura para validar su anulacion
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerFacturaParaAnulacion
    @IdFactura INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Encabezado de la factura con cliente y cajero
    SELECT 
        f.[IdFactura],
        f.[FechaEmision],
        f.[MontoTotal],
        f.[Estado],
        c.[IdCliente],
        c.[Nombre] AS [NombreCliente],
        c.[NIT],
        c.[EsEmpresa],
        u.[IdUsuario],
        u.[NombreUsuario] AS [CajeroEmisor]
    FROM [FACTURAS_ENCABEZADO] f
    INNER JOIN [CLIENTES] c ON f.[IdCliente] = c.[IdCliente]
    INNER JOIN [USUARIOS] u ON f.[IdUsuario] = u.[IdUsuario]
    WHERE f.[IdFactura] = @IdFactura;

    -- 2. Detalle de articulos facturados y lotes afectados
    SELECT 
        fd.[IdFacturaDetalle],
        p.[IdProducto],
        'P-' + CAST(p.[IdProducto] AS VARCHAR(10)) AS [CodigoProducto],
        p.[NombreProducto],
        fd.[Cantidad],
        fd.[PrecioUnitario],
        fd.[Subtotal],
        l.[IdLote],
        l.[NumeroLote],
        b.[NombreBodega],
        (ub.[Estante] + '-' + ub.[Nivel]) AS [CodigoUbicacion]
    FROM [FACTURAS_DETALLE] fd
    INNER JOIN [PRODUCTOS] p ON fd.[IdProducto] = p.[IdProducto]
    INNER JOIN [INVENTARIO_LOTES] l ON fd.[IdLote] = l.[IdLote]
    INNER JOIN [UBICACIONES_BODEGA] ub ON l.[IdUbicacion] = ub.[IdUbicacion]
    INNER JOIN [BODEGAS] b ON ub.[IdBodega] = b.[IdBodega]
    WHERE fd.[IdFactura] = @IdFactura;

    -- 3. Desglose de pagos registrados
    SELECT 
        fp.[IdFacturaPago],
        mp.[IdMedioPago],
        mp.[NombreMedioPago] AS [NombreMedio],
        fp.[Monto]
    FROM [FACTURAS_PAGOS] fp
    INNER JOIN [MEDIOS_PAGO] mp ON fp.[IdMedioPago] = mp.[IdMedioPago]
    WHERE fp.[IdFactura] = @IdFactura;

    -- 4. Registro de auditoria si ya fue anulada previamente
    SELECT 
        d.[IdDevolucion],
        d.[Fecha],
        d.[Motivo],
        u.[NombreUsuario] AS [UsuarioAnulo]
    FROM [DEVOLUCIONES_ENCABEZADO] d
    INNER JOIN [USUARIOS] u ON d.[IdUsuario] = u.[IdUsuario]
    WHERE d.[IdFactura] = @IdFactura;
END;
GO

-- Stored Procedure: Anulacion transaccional atomica con devolucion estricta a lotes
CREATE OR ALTER PROCEDURE dbo.sp_AnularFactura
    @IdFactura INT,
    @IdUsuario INT,
    @Motivo    VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @IdDevolucion INT;
    DECLARE @EstadoActual VARCHAR(20);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Validaciones
        IF NOT EXISTS (SELECT 1 FROM [FACTURAS_ENCABEZADO] WHERE [IdFactura] = @IdFactura)
            RAISERROR('La factura especificada no existe.', 16, 1);

        SELECT @EstadoActual = [Estado] 
        FROM [FACTURAS_ENCABEZADO] 
        WHERE [IdFactura] = @IdFactura;

        IF @EstadoActual = 'ANULADA'
            RAISERROR('La factura ya se encuentra anulada en el sistema.', 16, 1);

        IF NOT EXISTS (SELECT 1 FROM [USUARIOS] WHERE [IdUsuario] = @IdUsuario AND [Estado] = 1)
            RAISERROR('El usuario que autoriza la anulación no existe o está inactivo.', 16, 1);

        IF @Motivo IS NULL OR LTRIM(RTRIM(@Motivo)) = ''
            RAISERROR('Debe indicar un motivo justificado para anular la factura.', 16, 1);

        -- 2. Restituir existencias a cada lote exacto de donde salieron
        UPDATE il
        SET il.[CantidadDisponible] = il.[CantidadDisponible] + fd.[Cantidad]
        FROM [INVENTARIO_LOTES] il
        INNER JOIN [FACTURAS_DETALLE] fd ON il.[IdLote] = fd.[IdLote]
        WHERE fd.[IdFactura] = @IdFactura;

        -- 3. Registrar auditoria en DEVOLUCIONES_ENCABEZADO
        INSERT INTO [DEVOLUCIONES_ENCABEZADO]
            ([IdFactura], [IdUsuario], [Fecha], [Motivo])
        VALUES
            (@IdFactura, @IdUsuario, GETDATE(), @Motivo);

        SET @IdDevolucion = SCOPE_IDENTITY();

        -- 4. Registrar partidas devueltas en DEVOLUCIONES_DETALLE
        INSERT INTO [DEVOLUCIONES_DETALLE]
            ([IdDevolucion], [IdFacturaDetalle], [CantidadDevuelta])
        SELECT 
            @IdDevolucion,
            [IdFacturaDetalle],
            [Cantidad]
        FROM [FACTURAS_DETALLE]
        WHERE [IdFactura] = @IdFactura;

        -- 5. Anular factura: monto total a CERO y estado ANULADA
        UPDATE [FACTURAS_ENCABEZADO]
        SET [MontoTotal] = 0.00,
            [Estado] = 'ANULADA'
        WHERE [IdFactura] = @IdFactura;

        -- 6. Revertir montos de pagos en caja a CERO
        UPDATE [FACTURAS_PAGOS]
        SET [Monto] = 0.00
        WHERE [IdFactura] = @IdFactura;

        COMMIT TRANSACTION;

        SELECT 
            1 AS [Exito],
            @IdFactura AS [IdFactura],
            'Factura anulada exitosamente. Monto reseteado a 0.00 y stock devuelto a sus lotes originales.' AS [Mensaje];
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SELECT 
            0 AS [Exito],
            ERROR_MESSAGE() AS [Mensaje],
            ERROR_NUMBER() AS [ErrorNumero];
    END CATCH
END;
GO


-- ============================================================================
-- MODULO DE REPORTES GERENCIALES Y ANALITICA
-- Ferreteria y Pinturas OMNI-SAZO
-- ============================================================================

-- Stored Procedure: Tarjetas de resumen y KPIs gerenciales
CREATE OR ALTER PROCEDURE dbo.sp_ReporteKPIsGerencia
    @FechaInicio DATE = NULL,
    @FechaFin    DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FInicio DATETIME = ISNULL(CAST(@FechaInicio AS DATETIME), '2000-01-01');
    DECLARE @FFin    DATETIME = ISNULL(DATEADD(day, 1, CAST(@FechaFin AS DATETIME)), '2099-12-31');

    SELECT
        -- Ventas totales en dinero (solo facturas activas / pagadas)
        ISNULL(SUM(CASE WHEN f.[Estado] = 'PAGADA' THEN f.[MontoTotal] ELSE 0 END), 0.00) AS [TotalVentas],
        
        -- Cantidad de facturas emitidas activas
        COUNT(CASE WHEN f.[Estado] = 'PAGADA' THEN 1 END) AS [FacturasEmitidas],
        
        -- Cantidad de facturas anuladas
        COUNT(CASE WHEN f.[Estado] = 'ANULADA' THEN 1 END) AS [FacturasAnuladas],
        
        -- Total de clientes distintos atendidos
        COUNT(DISTINCT CASE WHEN f.[Estado] = 'PAGADA' THEN f.[IdCliente] END) AS [TotalClientes],

        -- Productos con stock critico o agotado (<= 10 unidades en bodega)
        (
            SELECT COUNT(*) 
            FROM (
                SELECT p.[IdProducto], ISNULL(SUM(il.[CantidadDisponible]), 0) AS [StockActual]
                FROM [PRODUCTOS] p
                LEFT JOIN [INVENTARIO_LOTES] il ON p.[IdProducto] = il.[IdProducto]
                GROUP BY p.[IdProducto]
                HAVING ISNULL(SUM(il.[CantidadDisponible]), 0) <= 10
            ) AS Alertas
        ) AS [ProductosCriticos]
    FROM [FACTURAS_ENCABEZADO] f
    WHERE f.[FechaEmision] >= @FInicio AND f.[FechaEmision] < @FFin;
END;
GO

-- Stored Procedure: Reporte de ingresos desglosado por medio de pago
CREATE OR ALTER PROCEDURE dbo.sp_ReporteIngresosMedioPago
    @FechaInicio DATE = NULL,
    @FechaFin    DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FInicio DATETIME = ISNULL(CAST(@FechaInicio AS DATETIME), '2000-01-01');
    DECLARE @FFin    DATETIME = ISNULL(DATEADD(day, 1, CAST(@FechaFin AS DATETIME)), '2099-12-31');

    SELECT 
        mp.[IdMedioPago],
        mp.[NombreMedioPago] AS [NombreMedio],
        COUNT(fp.[IdFacturaPago]) AS [CantidadTransacciones],
        ISNULL(SUM(fp.[Monto]), 0.00) AS [TotalRecaudado]
    FROM [MEDIOS_PAGO] mp
    LEFT JOIN [FACTURAS_PAGOS] fp ON mp.[IdMedioPago] = fp.[IdMedioPago]
    LEFT JOIN [FACTURAS_ENCABEZADO] f ON fp.[IdFactura] = f.[IdFactura]
        AND f.[Estado] = 'PAGADA'
        AND f.[FechaEmision] >= @FInicio 
        AND f.[FechaEmision] < @FFin
    GROUP BY mp.[IdMedioPago], mp.[NombreMedioPago]
    ORDER BY [TotalRecaudado] DESC;
END;
GO

-- Stored Procedure: Reporte de rotacion de productos (mas vendidos y menos vendidos)
CREATE OR ALTER PROCEDURE dbo.sp_ReporteRotacionProductos
    @FechaInicio DATE = NULL,
    @FechaFin    DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FInicio DATETIME = ISNULL(CAST(@FechaInicio AS DATETIME), '2000-01-01');
    DECLARE @FFin    DATETIME = ISNULL(DATEADD(day, 1, CAST(@FechaFin AS DATETIME)), '2099-12-31');

    SELECT 
        p.[IdProducto],
        'P-' + CAST(p.[IdProducto] AS VARCHAR(10)) AS [CodigoProducto],
        p.[NombreProducto],
        c.[NombreCategoria],
        ISNULL(SUM(fd.[Cantidad]), 0) AS [UnidadesVendidas],
        ISNULL(SUM(fd.[Subtotal]), 0.00) AS [TotalIngresos]
    FROM [PRODUCTOS] p
    INNER JOIN [CATEGORIAS] c ON p.[IdCategoria] = c.[IdCategoria]
    LEFT JOIN [FACTURAS_DETALLE] fd ON p.[IdProducto] = fd.[IdProducto]
    LEFT JOIN [FACTURAS_ENCABEZADO] f ON fd.[IdFactura] = f.[IdFactura] 
        AND f.[Estado] = 'PAGADA'
        AND f.[FechaEmision] >= @FInicio 
        AND f.[FechaEmision] < @FFin
    GROUP BY p.[IdProducto], p.[NombreProducto], c.[NombreCategoria]
    ORDER BY [UnidadesVendidas] DESC, [TotalIngresos] DESC;
END;
GO

-- Stored Procedure: Reporte de inventario critico y semaforo de stock
CREATE OR ALTER PROCEDURE dbo.sp_ReporteStockCritico
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        p.[IdProducto],
        'P-' + CAST(p.[IdProducto] AS VARCHAR(10)) AS [CodigoProducto],
        p.[NombreProducto],
        c.[NombreCategoria],
        10 AS [StockMinimo],
        ISNULL(SUM(il.[CantidadDisponible]), 0) AS [StockDisponible],
        CASE 
            WHEN ISNULL(SUM(il.[CantidadDisponible]), 0) <= 0 THEN 'AGOTADO'
            WHEN ISNULL(SUM(il.[CantidadDisponible]), 0) <= 5 THEN 'CRITICO'
            WHEN ISNULL(SUM(il.[CantidadDisponible]), 0) <= 15 THEN 'BAJO'
            ELSE 'OPTIMO'
        END AS [EstadoSemaforo]
    FROM [PRODUCTOS] p
    INNER JOIN [CATEGORIAS] c ON p.[IdCategoria] = c.[IdCategoria]
    LEFT JOIN [INVENTARIO_LOTES] il ON p.[IdProducto] = il.[IdProducto]
    GROUP BY p.[IdProducto], p.[NombreProducto], c.[NombreCategoria]
    ORDER BY 
        CASE 
            WHEN ISNULL(SUM(il.[CantidadDisponible]), 0) <= 0 THEN 1
            WHEN ISNULL(SUM(il.[CantidadDisponible]), 0) <= 5 THEN 2
            WHEN ISNULL(SUM(il.[CantidadDisponible]), 0) <= 15 THEN 3
            ELSE 4
        END ASC,
        [StockDisponible] ASC;
END;
GO

-- Stored Procedure: Reporte de facturacion y trazabilidad por cajero / operador
CREATE OR ALTER PROCEDURE dbo.sp_ReporteVentasPorCajero
    @FechaInicio DATE = NULL,
    @FechaFin    DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FInicio DATETIME = ISNULL(CAST(@FechaInicio AS DATETIME), '2000-01-01');
    DECLARE @FFin    DATETIME = ISNULL(DATEADD(day, 1, CAST(@FechaFin AS DATETIME)), '2099-12-31');

    SELECT 
        u.[IdUsuario],
        u.[NombreUsuario],
        r.[NombreRol],
        COUNT(CASE WHEN f.[Estado] = 'PAGADA' THEN 1 END) AS [FacturasEmitidas],
        COUNT(CASE WHEN f.[Estado] = 'ANULADA' THEN 1 END) AS [FacturasAnuladas],
        ISNULL(SUM(CASE WHEN f.[Estado] = 'PAGADA' THEN f.[MontoTotal] ELSE 0 END), 0.00) AS [TotalFacturado]
    FROM [USUARIOS] u
    INNER JOIN [ROLES] r ON u.[IdRol] = r.[IdRol]
    LEFT JOIN [FACTURAS_ENCABEZADO] f ON u.[IdUsuario] = f.[IdUsuario]
        AND f.[FechaEmision] >= @FInicio 
        AND f.[FechaEmision] < @FFin
    WHERE u.[Estado] = 1
    GROUP BY u.[IdUsuario], u.[NombreUsuario], r.[NombreRol]
    ORDER BY [TotalFacturado] DESC;
END;
GO
