USE [OMNISAZO];
GO

-- Datos iniciales de bodegas y ubicaciones
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

-- @Javier: Listar bodegas activas
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

-- @Javier: Listar ubicaciones por bodega
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

-- @Javier: Crear orden de compra
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
            COALESCE(j.cantidad, j.Cantidad, j.cantidadSolicitada, j.CantidadSolicitada)
        FROM OPENJSON(@JsonDetalle)
        WITH (
            idProducto         INT '$.idProducto',
            IdProducto         INT '$.IdProducto',
            cantidad           INT '$.cantidad',
            Cantidad           INT '$.Cantidad',
            cantidadSolicitada INT '$.cantidadSolicitada',
            CantidadSolicitada INT '$.CantidadSolicitada'
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

-- @Javier: Actualizar orden de compra pendiente
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
            COALESCE(j.cantidad, j.Cantidad, j.cantidadSolicitada, j.CantidadSolicitada)
        FROM OPENJSON(@JsonDetalle)
        WITH (
            idProducto         INT '$.idProducto',
            IdProducto         INT '$.IdProducto',
            cantidad           INT '$.cantidad',
            Cantidad           INT '$.Cantidad',
            cantidadSolicitada INT '$.cantidadSolicitada',
            CantidadSolicitada INT '$.CantidadSolicitada'
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

-- @Javier: Listar ordenes de compra (historial)
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

-- @Javier: Detalle completo de una orden de compra
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

-- @Javier: Listar compras pendientes o parciales
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
    WHERE oce.Estado IN ('PENDIENTE', 'PARCIAL')
    ORDER BY oce.IdOrdenCompra DESC;
END;
GO

-- @Javier: Detalle de orden con saldo pendiente para recepcion
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
        (ocd.CantidadSolicitada - ISNULL((
            SELECT SUM(rcd.CantidadRecibida)
            FROM RECEPCIONES_COMPRA_DETALLE rcd
            WHERE rcd.IdOrdenCompraDetalle = ocd.IdOrdenCompraDetalle
        ), 0)) AS CantidadPendiente,
        pr.ManejaLote
    FROM ORDENES_COMPRA_DETALLE ocd
    INNER JOIN PRODUCTOS pr ON ocd.IdProducto = pr.IdProducto
    WHERE ocd.IdOrdenCompra = @IdOrdenCompra
    ORDER BY ocd.IdOrdenCompraDetalle;
END;
GO

-- @Javier: Registrar recepcion de mercaderia e ingreso a bodega
CREATE OR ALTER PROCEDURE dbo.sp_RegistrarRecepcionCompra
    @IdOrdenCompra INT,
    @IdUsuario INT,
    @JsonRecepcion NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Validar orden disponible
        IF NOT EXISTS (SELECT 1 FROM ORDENES_COMPRA_ENCABEZADO WITH (UPDLOCK, HOLDLOCK)
                       WHERE IdOrdenCompra = @IdOrdenCompra AND Estado IN ('PENDIENTE', 'PARCIAL'))
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, 'La orden no existe, ya fue completada o no está disponible para recepción' AS Mensaje;
            RETURN;
        END

        -- Leer items del JSON
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

        -- Validar cantidades
        IF EXISTS (SELECT 1 FROM @Items WHERE ISNULL(CantidadRecibida, 0) <= 0)
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, 'Las cantidades recibidas deben ser mayores a cero' AS Mensaje;
            RETURN;
        END

        -- Validar ubicacion
        IF EXISTS (SELECT 1 FROM @Items WHERE IdUbicacion IS NULL)
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, 'Debe asignar una ubicación (bodega) a todos los ítems' AS Mensaje;
            RETURN;
        END

        -- Validar que pertenezcan a la orden
        IF EXISTS (
            SELECT 1
            FROM @Items i
            LEFT JOIN ORDENES_COMPRA_DETALLE d
              ON d.IdOrdenCompraDetalle = i.IdOrdenCompraDetalle
             AND d.IdOrdenCompra = @IdOrdenCompra
            WHERE d.IdOrdenCompraDetalle IS NULL
        )
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, 'Uno o más productos no pertenecen a la orden de compra especificada' AS Mensaje;
            RETURN;
        END

        -- Validar que no supere el saldo pendiente
        IF EXISTS (
            SELECT 1
            FROM @Items i
            INNER JOIN ORDENES_COMPRA_DETALLE d ON i.IdOrdenCompraDetalle = d.IdOrdenCompraDetalle
            CROSS APPLY (
                SELECT ISNULL(SUM(rcd.CantidadRecibida), 0) AS YaRecibido
                FROM RECEPCIONES_COMPRA_DETALLE rcd
                WHERE rcd.IdOrdenCompraDetalle = d.IdOrdenCompraDetalle
            ) prev
            WHERE d.IdOrdenCompra = @IdOrdenCompra
              AND (i.CantidadRecibida > (d.CantidadSolicitada - prev.YaRecibido))
        )
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, 'La cantidad recibida supera la cantidad pendiente por recibir de la orden' AS Mensaje;
            RETURN;
        END

        -- Cabecera de recepcion
        INSERT INTO RECEPCIONES_COMPRA_ENCABEZADO (IdOrdenCompra, IdUsuario, FechaRecepcion)
        VALUES (@IdOrdenCompra, @IdUsuario, GETDATE());

        DECLARE @IdRecepcion INT = SCOPE_IDENTITY();

        -- Registrar lotes y detalle de recepcion
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

        -- Actualizar estado a PARCIAL o RECIBIDO segun saldo restante
        IF EXISTS (
            SELECT 1
            FROM ORDENES_COMPRA_DETALLE d
            CROSS APPLY (
                SELECT ISNULL(SUM(rcd.CantidadRecibida), 0) AS TotalRecibido
                FROM RECEPCIONES_COMPRA_DETALLE rcd
                WHERE rcd.IdOrdenCompraDetalle = d.IdOrdenCompraDetalle
            ) tot
            WHERE d.IdOrdenCompra = @IdOrdenCompra
              AND tot.TotalRecibido < d.CantidadSolicitada
        )
        BEGIN
            UPDATE ORDENES_COMPRA_ENCABEZADO
            SET Estado = 'PARCIAL'
            WHERE IdOrdenCompra = @IdOrdenCompra;
        END
        ELSE
        BEGIN
            UPDATE ORDENES_COMPRA_ENCABEZADO
            SET Estado = 'RECIBIDO'
            WHERE IdOrdenCompra = @IdOrdenCompra;
        END

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
