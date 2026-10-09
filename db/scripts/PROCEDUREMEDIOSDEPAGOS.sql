USE [OMNISAZO];
GO

-- listar todos los metodos de pago configurados
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerMediosPago
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdMedioPago, NombreMedioPago 
    FROM dbo.MEDIOS_PAGO 
    ORDER BY IdMedioPago;
END;
GO

-- agregar un nuevo metodo de pago
CREATE OR ALTER PROCEDURE dbo.sp_CrearMedioPago
    @NombreMedioPago VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO dbo.MEDIOS_PAGO (NombreMedioPago) 
        VALUES (@NombreMedioPago);
        SELECT 1 AS Exito, 'Medio de pago registrado exitosamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO

-- actualizar el nombre de un metodo de pago
CREATE OR ALTER PROCEDURE dbo.sp_ActualizarMedioPago
    @IdMedioPago INT,
    @NombreMedioPago VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE dbo.MEDIOS_PAGO 
        SET NombreMedioPago = @NombreMedioPago 
        WHERE IdMedioPago = @IdMedioPago;
        SELECT 1 AS Exito, 'Medio de pago actualizado' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO

-- borrar un metodo de pago
CREATE OR ALTER PROCEDURE dbo.sp_EliminarMedioPago
    @IdMedioPago INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DELETE FROM dbo.MEDIOS_PAGO WHERE IdMedioPago = @IdMedioPago;
        SELECT 1 AS Exito, 'Medio de pago eliminado' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO

-- procedimiento principal de tu modulo para registrar los pagos de una factura ya existente
CREATE OR ALTER PROCEDURE dbo.PROCEDUREMEDIOSDEPAGOS
    @IdFactura INT,
    @JsonPagos NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- insertamos los pagos leyendo el json
        INSERT INTO FACTURAS_PAGOS (IdFactura, IdMedioPago, Monto)
        SELECT 
            @IdFactura,
            IdMedioPago,
            Monto
        FROM OPENJSON(@JsonPagos)
        WITH (
            IdMedioPago INT '$.idMedioPago',
            Monto DECIMAL(10,2) '$.monto'
        );

        -- marcamos la factura oficial como pagada
        UPDATE FACTURAS_ENCABEZADO
        SET Estado = 'PAGADA'
        WHERE IdFactura = @IdFactura;

        COMMIT TRANSACTION;
        SELECT 1 AS Exito, 'Pagos registrados exitosamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO
