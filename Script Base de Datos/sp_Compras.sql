/* ============================================================================
   OMNI-SAZO — Módulo de Compras e Ingreso a Bodega
   ----------------------------------------------------
   Contiene:
     1. Datos semilla de BODEGAS y UBICACIONES_BODEGA
     2. Los 9 Procedimientos Almacenados del módulo:
        - sp_ObtenerBodegas
        - sp_ObtenerUbicacionesBodega
        - sp_CrearOrdenCompra
        - sp_ActualizarOrdenCompra
        - sp_ObtenerOrdenesCompra
        - sp_ObtenerOrdenCompraDetalle
        - sp_ObtenerOrdenesPendientes
        - sp_ObtenerRecepcionOrden
        - sp_RegistrarRecepcionCompra

   Tablas involucradas:
     ORDENES_COMPRA_ENCABEZADO, ORDENES_COMPRA_DETALLE,
     RECEPCIONES_COMPRA_ENCABEZADO, RECEPCIONES_COMPRA_DETALLE,
     INVENTARIO_LOTES, BODEGAS, UBICACIONES_BODEGA

   Contrato JSON (camelCase):
     Detalle de orden  -> [{ "idProducto": 1, "cantidad": 10 }]
     Detalle recepción -> [{ "idOrdenCompraDetalle": 5, "idProducto": 1,
                             "cantidadRecibida": 10, "idUbicacion": 2,
                             "numeroLote": "L-001", "costoUnitario": 25.50 }]
   ============================================================================ */

USE [OmniSazoBD];
GO

/* ============================================================================
   1. DATOS SEMILLA — Bodegas y Ubicaciones
   ============================================================================ */

IF NOT EXISTS (SELECT 1 FROM dbo.BODEGAS WHERE NombreBodega = 'Bodega Central')
BEGIN
    INSERT INTO dbo.BODEGAS (NombreBodega, Estado) VALUES ('Bodega Central', 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.BODEGAS WHERE NombreBodega = 'Bodega de Repuestos')
BEGIN
    INSERT INTO dbo.BODEGAS (NombreBodega, Estado) VALUES ('Bodega de Repuestos', 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.UBICACIONES_BODEGA)
BEGIN
    INSERT INTO dbo.UBICACIONES_BODEGA (IdBodega, Estante, Nivel)
    SELECT IdBodega, 'E1', 'N1' FROM BODEGAS WHERE NombreBodega = 'Bodega Central';
    INSERT INTO dbo.UBICACIONES_BODEGA (IdBodega, Estante, Nivel)
    SELECT IdBodega, 'E1', 'N2' FROM BODEGAS WHERE NombreBodega = 'Bodega Central';
    INSERT INTO dbo.UBICACIONES_BODEGA (IdBodega, Estante, Nivel)
    SELECT IdBodega, 'E2', 'N1' FROM BODEGAS WHERE NombreBodega = 'Bodega Central';

    INSERT INTO dbo.UBICACIONES_BODEGA (IdBodega, Estante, Nivel)
    SELECT IdBodega, 'E1', 'N1' FROM BODEGAS WHERE NombreBodega = 'Bodega de Repuestos';
    INSERT INTO dbo.UBICACIONES_BODEGA (IdBodega, Estante, Nivel)
    SELECT IdBodega, 'E2', 'N2' FROM BODEGAS WHERE NombreBodega = 'Bodega de Repuestos';
END
GO

/* ============================================================================
   2. PROCEDIMIENTOS ALMACENADOS
   ============================================================================ */

-- =====================================================
-- 1. Listar bodegas activas
-- =====================================================
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerBodegas
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdBodega, NombreBodega
    FROM BODEGAS
    WHERE Estado = 1
    ORDER BY NombreBodega;
END;
GO

-- =====================================================
-- 2. Listar ubicaciones (estante/nivel) por bodega.
--    Si @IdBodega es NULL, trae todas.
-- =====================================================
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerUbicacionesBodega
    @IdBodega INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        ub.IdUbicacion,
        ub.IdBodega,
        b.NombreBodega,
        ub.Estante,
        ub.Nivel
    FROM UBICACIONES_BODEGA ub
    INNER JOIN BODEGAS b ON ub.IdBodega = b.IdBodega
    WHERE (@IdBodega IS NULL OR ub.IdBodega = @IdBodega)
      AND b.Estado = 1
    ORDER BY b.NombreBodega, ub.Estante, ub.Nivel;
END;
GO

-- =====================================================
-- 3. Crear orden de compra (encabezado + detalle).
--    JsonDetalle: [{ "idProducto": int, "cantidad": int }]
-- =====================================================
CREATE OR ALTER PROCEDURE dbo.sp_CrearOrdenCompra
    @IdProveedor INT,
    @JsonDetalle NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO ORDENES_COMPRA_ENCABEZADO (IdProveedor, FechaEmision, Estado)
        VALUES (@IdProveedor, GETDATE(), 'PENDIENTE');

        DECLARE @IdOrdenCompraCreada INT = SCOPE_IDENTITY();

        INSERT INTO ORDENES_COMPRA_DETALLE (IdOrdenCompra, IdProducto, CantidadSolicitada)
        SELECT
            @IdOrdenCompraCreada,
            COALESCE(j.idProducto, j.IdProducto),
            COALESCE(j.cantidad, j.Cantidad)
        FROM OPENJSON(@JsonDetalle)
        WITH (
            idProducto INT '$.idProducto',
            IdProducto INT '$.IdProducto',
            cantidad   INT '$.cantidad',
            Cantidad   INT '$.Cantidad'
        ) AS j;

        COMMIT TRANSACTION;
        SELECT @IdOrdenCompraCreada AS IdOrdenCompra, 'Orden de compra guardada exitosamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- =====================================================
-- 4. Actualizar orden de compra solo si sigue PENDIENTE.
--    Reemplaza el detalle por completo.
-- =====================================================
CREATE OR ALTER PROCEDURE dbo.sp_ActualizarOrdenCompra
    @IdOrdenCompra INT,
    @IdProveedor INT,
    @JsonDetalle NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM ORDENES_COMPRA_ENCABEZADO
                       WHERE IdOrdenCompra = @IdOrdenCompra AND Estado = 'PENDIENTE')
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, 'La orden no existe o ya fue recibida y no puede modificarse' AS Mensaje;
            RETURN;
        END

        UPDATE ORDENES_COMPRA_ENCABEZADO
        SET IdProveedor = @IdProveedor
        WHERE IdOrdenCompra = @IdOrdenCompra;

        DELETE FROM ORDENES_COMPRA_DETALLE
        WHERE IdOrdenCompra = @IdOrdenCompra;

        INSERT INTO ORDENES_COMPRA_DETALLE (IdOrdenCompra, IdProducto, CantidadSolicitada)
        SELECT
            @IdOrdenCompra,
            COALESCE(j.idProducto, j.IdProducto),
            COALESCE(j.cantidad, j.Cantidad)
        FROM OPENJSON(@JsonDetalle)
        WITH (
            idProducto INT '$.idProducto',
            IdProducto INT '$.IdProducto',
            cantidad   INT '$.cantidad',
            Cantidad   INT '$.Cantidad'
        ) AS j;

        COMMIT TRANSACTION;
        SELECT 1 AS Exito, 'Orden de compra actualizada exitosamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- =====================================================
-- 5. Listar ordenes de compra (historial).
--    MontoTotal se calcula con el costo real de los lotes
--    recibidos (0 mientras la orden siga PENDIENTE).
-- =====================================================
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerOrdenesCompra
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        oce.IdOrdenCompra,
        oce.IdProveedor,
        p.NombreProveedor,
        oce.FechaEmision,
        oce.Estado,
        (SELECT ISNULL(SUM(il.CostoCompraUnitario * rcd.CantidadRecibida), 0)
         FROM RECEPCIONES_COMPRA_DETALLE rcd
         INNER JOIN INVENTARIO_LOTES il ON il.IdLote = rcd.IdLote
         INNER JOIN RECEPCIONES_COMPRA_ENCABEZADO rce ON rce.IdRecepcion = rcd.IdRecepcion
         WHERE rce.IdOrdenCompra = oce.IdOrdenCompra) AS MontoTotal
    FROM ORDENES_COMPRA_ENCABEZADO oce
    INNER JOIN PROVEEDORES p ON oce.IdProveedor = p.IdProveedor
    ORDER BY oce.IdOrdenCompra DESC;
END;
GO

-- =====================================================
-- 6. Detalle completo de una orden (encabezado + detalle).
--    Devuelve 2 recordsets.
-- =====================================================
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerOrdenCompraDetalle
    @IdOrdenCompra INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Cabecera
    SELECT
        oce.IdOrdenCompra,
        oce.IdProveedor,
        p.NombreProveedor,
        p.NIT AS NITProveedor,
        oce.FechaEmision,
        oce.Estado
    FROM ORDENES_COMPRA_ENCABEZADO oce
    INNER JOIN PROVEEDORES p ON oce.IdProveedor = p.IdProveedor
    WHERE oce.IdOrdenCompra = @IdOrdenCompra;

    -- Detalle
    SELECT
        ocd.IdOrdenCompraDetalle,
        ocd.IdProducto,
        pr.NombreProducto,
        ocd.CantidadSolicitada,
        pr.ManejaLote
    FROM ORDENES_COMPRA_DETALLE ocd
    INNER JOIN PRODUCTOS pr ON ocd.IdProducto = pr.IdProducto
    WHERE ocd.IdOrdenCompra = @IdOrdenCompra;
END;
GO

-- =====================================================
-- 7. Ordenes PENDIENTES para la pantalla de recepcion.
-- =====================================================
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerOrdenesPendientes
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        oce.IdOrdenCompra,
        oce.IdProveedor,
        p.NombreProveedor,
        oce.FechaEmision,
        oce.Estado
    FROM ORDENES_COMPRA_ENCABEZADO oce
    INNER JOIN PROVEEDORES p ON oce.IdProveedor = p.IdProveedor
    WHERE oce.Estado = 'PENDIENTE'
    ORDER BY oce.IdOrdenCompra DESC;
END;
GO

-- =====================================================
-- 8. Cargar el detalle de una orden para armar el
--    formulario de recepcion (lo pedido vs lo ya recibido).
-- =====================================================
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerRecepcionOrden
    @IdOrdenCompra INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        ocd.IdOrdenCompraDetalle,
        ocd.IdProducto,
        pr.NombreProducto,
        ocd.CantidadSolicitada,
        ISNULL((
            SELECT SUM(rcd.CantidadRecibida)
            FROM RECEPCIONES_COMPRA_DETALLE rcd
            WHERE rcd.IdOrdenCompraDetalle = ocd.IdOrdenCompraDetalle
        ), 0) AS CantidadRecibida,
        pr.ManejaLote
    FROM ORDENES_COMPRA_DETALLE ocd
    INNER JOIN PRODUCTOS pr ON ocd.IdProducto = pr.IdProducto
    WHERE ocd.IdOrdenCompra = @IdOrdenCompra
    ORDER BY ocd.IdOrdenCompraDetalle;
END;
GO

-- =====================================================
-- 9. Registrar recepcion TOTAL e ingreso a bodega.
--    Transaccion atomica sobre:
--      RECEPCIONES_COMPRA_ENCABEZADO
--      INVENTARIO_LOTES
--      RECEPCIONES_COMPRA_DETALLE
--      ORDENES_COMPRA_ENCABEZADO (Estado -> RECIBIDO)
--
--    JsonRecepcion: [{ "idOrdenCompraDetalle": int, "idProducto": int,
--                      "cantidadRecibida": int, "idUbicacion": int,
--                      "numeroLote": varchar, "costoUnitario": decimal }]
-- =====================================================
CREATE OR ALTER PROCEDURE dbo.sp_RegistrarRecepcionCompra
    @IdOrdenCompra INT,
    @IdUsuario INT,
    @JsonRecepcion NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 0) Bloquear la orden para evitar doble recepcion concurrente
        IF NOT EXISTS (SELECT 1 FROM ORDENES_COMPRA_ENCABEZADO WITH (UPDLOCK, HOLDLOCK)
                       WHERE IdOrdenCompra = @IdOrdenCompra AND Estado = 'PENDIENTE')
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, 'La orden no existe, ya fue recibida o no esta pendiente' AS Mensaje;
            RETURN;
        END

        -- 1) Cargar items del JSON a una tabla en memoria
        DECLARE @Items TABLE (
            RowNum INT IDENTITY(1,1),
            IdOrdenCompraDetalle INT,
            IdProducto INT,
            CantidadRecibida INT,
            IdUbicacion INT,
            NumeroLote VARCHAR(50),
            CostoUnitario DECIMAL(10,2)
        );

        INSERT INTO @Items (IdOrdenCompraDetalle, IdProducto, CantidadRecibida, IdUbicacion, NumeroLote, CostoUnitario)
        SELECT
            IdOrdenCompraDetalle,
            IdProducto,
            CantidadRecibida,
            IdUbicacion,
            NumeroLote,
            ISNULL(CostoUnitario, 0)
        FROM OPENJSON(@JsonRecepcion)
        WITH (
            IdOrdenCompraDetalle INT '$.idOrdenCompraDetalle',
            IdProducto           INT '$.idProducto',
            CantidadRecibida     INT '$.cantidadRecibida',
            IdUbicacion          INT '$.idUbicacion',
            NumeroLote           VARCHAR(50) '$.numeroLote',
            CostoUnitario        DECIMAL(10,2) '$.costoUnitario'
        );

        -- 2) Validar cantidades positivas
        IF EXISTS (SELECT 1 FROM @Items WHERE ISNULL(CantidadRecibida, 0) <= 0)
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, 'Las cantidades recibidas deben ser mayores a cero' AS Mensaje;
            RETURN;
        END

        -- 3) Validar que todos los ítems tengan ubicación (bodega)
        IF EXISTS (SELECT 1 FROM @Items WHERE IdUbicacion IS NULL)
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, 'Debe asignar una ubicación (bodega) a todos los ítems' AS Mensaje;
            RETURN;
        END

        -- 4) Validar recepcion TOTAL: cubre todas las lineas y cantidades exactas
        IF EXISTS (
            SELECT 1
            FROM ORDENES_COMPRA_DETALLE d
            LEFT JOIN @Items i ON i.IdOrdenCompraDetalle = d.IdOrdenCompraDetalle
            WHERE d.IdOrdenCompra = @IdOrdenCompra
              AND (i.IdOrdenCompraDetalle IS NULL OR ISNULL(i.CantidadRecibida, 0) <> d.CantidadSolicitada)
        )
        OR EXISTS (
            SELECT 1
            FROM @Items i
            LEFT JOIN ORDENES_COMPRA_DETALLE d
              ON d.IdOrdenCompraDetalle = i.IdOrdenCompraDetalle
             AND d.IdOrdenCompra = @IdOrdenCompra
            WHERE d.IdOrdenCompraDetalle IS NULL
        )
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, 'Recepcion incompleta: la orden debe recibirse en su totalidad' AS Mensaje;
            RETURN;
        END

        -- 5) Cabecera de recepcion
        INSERT INTO RECEPCIONES_COMPRA_ENCABEZADO (IdOrdenCompra, IdUsuario, FechaRecepcion)
        VALUES (@IdOrdenCompra, @IdUsuario, GETDATE());

        DECLARE @IdRecepcion INT = SCOPE_IDENTITY();

        -- 6) Recorrer items: crear lote + detalle de recepcion
        DECLARE @IdOrdenCompraDetalle INT, @IdProducto INT, @CantidadRecibida INT,
                @IdUbicacion INT, @NumeroLote VARCHAR(50), @CostoUnitario DECIMAL(10,2),
                @IdLote INT;

        DECLARE @i INT = 1;
        DECLARE @total INT = (SELECT COUNT(*) FROM @Items);

        WHILE @i <= @total
        BEGIN
            SELECT
                @IdOrdenCompraDetalle = IdOrdenCompraDetalle,
                @IdProducto = IdProducto,
                @CantidadRecibida = CantidadRecibida,
                @IdUbicacion = IdUbicacion,
                @NumeroLote = NumeroLote,
                @CostoUnitario = CostoUnitario
            FROM @Items
            WHERE RowNum = @i;

            -- Numero de lote por defecto si viene vacio
            SET @NumeroLote = COALESCE(NULLIF(LTRIM(RTRIM(@NumeroLote)), ''),
                                       'LOTE-' + CAST(@IdOrdenCompra AS VARCHAR(20))
                                               + '-' + CAST(@IdOrdenCompraDetalle AS VARCHAR(20)));

            INSERT INTO INVENTARIO_LOTES
                (IdProducto, IdUbicacion, NumeroLote, FechaIngreso,
                 CantidadInicial, CantidadDisponible, CostoCompraUnitario)
            VALUES
                (@IdProducto, @IdUbicacion, @NumeroLote, GETDATE(),
                 @CantidadRecibida, @CantidadRecibida, @CostoUnitario);

            SET @IdLote = SCOPE_IDENTITY();

            INSERT INTO RECEPCIONES_COMPRA_DETALLE
                (IdRecepcion, IdOrdenCompraDetalle, IdLote, CantidadRecibida)
            VALUES
                (@IdRecepcion, @IdOrdenCompraDetalle, @IdLote, @CantidadRecibida);

            SET @i = @i + 1;
        END;

        -- 7) Marcar la orden como RECIBIDO
        UPDATE ORDENES_COMPRA_ENCABEZADO
        SET Estado = 'RECIBIDO'
        WHERE IdOrdenCompra = @IdOrdenCompra;

        COMMIT TRANSACTION;

        SELECT
            1 AS Exito,
            'Ingreso a bodega registrado exitosamente' AS Mensaje,
            @IdRecepcion AS IdRecepcion;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
