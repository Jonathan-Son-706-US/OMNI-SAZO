USE [OMNISAZO];
GO

-- creamos una nueva cotizacion con sus productos recibiendo un json
CREATE OR ALTER PROCEDURE dbo.PROCEDURECREARCOTIZACION
    @IdCliente INT,
    @JsonDetalle NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @IdCotizacion INT;

        -- insertamos el encabezado principal
        INSERT INTO COTIZACIONES_ENCABEZADO (IdCliente, Fecha, Estado)
        VALUES (@IdCliente, GETDATE(), 'PENDIENTE');

        SET @IdCotizacion = SCOPE_IDENTITY();

        -- leemos el json y lo metemos en el detalle
        INSERT INTO COTIZACIONES_DETALLE (IdCotizacion, IdProducto, Cantidad, PrecioUnitario)
        SELECT @IdCotizacion, IdProducto, Cantidad, PrecioUnitario
        FROM OPENJSON(@JsonDetalle)
        WITH (
            IdProducto INT '$.idProducto',
            Cantidad INT '$.cantidad',
            PrecioUnitario DECIMAL(10,2) '$.precioUnitario'
        );

        COMMIT TRANSACTION;
        SELECT 1 AS Exito, 'Cotizacion creada exitosamente' AS Mensaje, @IdCotizacion AS IdCotizacion;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje, NULL AS IdCotizacion;
    END CATCH
END;
GO

-- devolvemos todas las cotizaciones con su total calculado para mostrarlas en la tabla
CREATE OR ALTER PROCEDURE dbo.PROCEDUREOBTENERCOTIZACIONES
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        ce.IdCotizacion,
        ce.IdCliente,
        c.Nombre AS NombreCliente,
        ce.Fecha,
        ce.Estado,
        (SELECT ISNULL(SUM(cd.Cantidad * cd.PrecioUnitario), 0) 
         FROM COTIZACIONES_DETALLE cd 
         WHERE cd.IdCotizacion = ce.IdCotizacion) AS MontoTotal
    FROM COTIZACIONES_ENCABEZADO ce
    INNER JOIN CLIENTES c ON ce.IdCliente = c.IdCliente
    ORDER BY ce.IdCotizacion DESC;
END;
GO

-- mostramos exactamente que productos tiene adentro una cotizacion
CREATE OR ALTER PROCEDURE dbo.PROCEDUREOBTENERCOTIZACIONDETALLE
    @IdCotizacion INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- cabecera de la cotizacion
    SELECT 
        ce.IdCotizacion,
        ce.IdCliente,
        c.Nombre AS NombreCliente,
        c.NIT AS NITCliente,
        ce.Fecha,
        ce.Estado
    FROM COTIZACIONES_ENCABEZADO ce
    INNER JOIN CLIENTES c ON ce.IdCliente = c.IdCliente
    WHERE ce.IdCotizacion = @IdCotizacion;

    -- productos cotizados
    SELECT 
        cd.IdCotizacionDetalle,
        cd.IdProducto,
        p.NombreProducto,
        cd.Cantidad,
        cd.PrecioUnitario,
        (cd.Cantidad * cd.PrecioUnitario) AS Subtotal
    FROM COTIZACIONES_DETALLE cd
    INNER JOIN PRODUCTOS p ON cd.IdProducto = p.IdProducto
    WHERE cd.IdCotizacion = @IdCotizacion;
END;
GO

-- pasamos una cotizacion a estado confirmada cuando ya estan seguros de facturarla
CREATE OR ALTER PROCEDURE dbo.PROCEDURECONFIRMARCOTIZACION
    @IdCotizacion INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM COTIZACIONES_ENCABEZADO 
                       WHERE IdCotizacion = @IdCotizacion AND Estado = 'PENDIENTE')
        BEGIN
            SELECT 0 AS Exito, 'La cotizacion no existe o ya fue procesada' AS Mensaje;
            RETURN;
        END

        UPDATE COTIZACIONES_ENCABEZADO
        SET Estado = 'CONFIRMADA'
        WHERE IdCotizacion = @IdCotizacion;

        SELECT 1 AS Exito, 'Cotizacion confirmada' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO
