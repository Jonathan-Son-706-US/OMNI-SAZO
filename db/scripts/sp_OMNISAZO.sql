--1 @Abner implementación para Modulo de CajaYImpresión
Create OR ALTER   PROCEDURE dbo.sp_ImpresionDeFacturas
    @IdFactura INT
AS
BEGIN
    SET NOCOUNT ON;

    --formato Normal para la factura
    SELECT 
        fe.IdFactura,
        fe.FechaEmision,
        fe.MontoTotal,
        fe.Estado,
        c.Nombre AS NombreCliente,
        c.NIT AS NITCliente,
        u.NombreUsuario AS Cajero,
        fe.IdCotizacion
    FROM FACTURAS_ENCABEZADO fe
    INNER JOIN CLIENTES c ON fe.IdCliente = c.IdCliente
    INNER JOIN USUARIOS u ON fe.IdUsuario = u.IdUsuario
    WHERE fe.IdFactura = @IdFactura;

    --detalles de lo comprado
    SELECT 
        p.NombreProducto,
        fd.Cantidad,
        fd.PrecioUnitario,
        fd.Subtotal
    FROM FACTURAS_DETALLE fd
    INNER JOIN PRODUCTOS p ON fd.IdProducto = p.IdProducto
    WHERE fd.IdFactura = @IdFactura;

    --forma de pago
    SELECT 
        mp.NombreMedioPago,
        fp.Monto
    FROM FACTURAS_PAGOS fp
    INNER JOIN MEDIOS_PAGO mp ON fp.IdMedioPago = mp.IdMedioPago
    WHERE fp.IdFactura = @IdFactura;
END;
GO

--Obtener Facturas:
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerFacturas
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        fe.IdFactura,
        fe.FechaEmision,
        fe.MontoTotal,
        c.Nombre AS NombreCliente
    FROM FACTURAS_ENCABEZADO fe
    INNER JOIN CLIENTES c ON fe.IdCliente = c.IdCliente
    ORDER BY fe.FechaEmision DESC;
END;
GO
--2 @Abner implementación //MediosDePago
CREATE OR ALTER   PROCEDURE dbo.sp_MediosDePago
    @IdFactura INT,
    @JsonPagos NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        --Insercion de pagos mediante .json
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

        --campo pagado final 
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


--3 @Javier sp_para Modulo de Clientes
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerClientes
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdCliente, Nombre, Nit, EsEmpresa 
    FROM dbo.CLIENTES 
    ORDER BY IdCliente DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_CrearCliente
    @Nombre VARCHAR(150),
    @Nit VARCHAR(20),
    @EsEmpresa BIT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO dbo.CLIENTES (Nombre, Nit, EsEmpresa)
        VALUES (@Nombre, ISNULL(@Nit, 'CF'), @EsEmpresa);

        SELECT 1 AS Exito, 'Cliente registrado exitosamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ActualizarCliente
    @IdCliente INT,
    @Nombre VARCHAR(150),
    @Nit VARCHAR(20),
    @EsEmpresa BIT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE dbo.CLIENTES
        SET Nombre = @Nombre,
            Nit = ISNULL(@Nit, 'CF'),
            EsEmpresa = @EsEmpresa
        WHERE IdCliente = @IdCliente;

        SELECT 1 AS Exito, 'Cliente actualizado correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_EliminarCliente
    @IdCliente INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DELETE FROM dbo.CLIENTES WHERE IdCliente = @IdCliente;
        SELECT 1 AS Exito, 'Cliente eliminado correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO

--3 @Jonas sp_ParaModuloUsuarios
--Actualizar user
CREATE OR ALTER PROCEDURE sp_ActualizarUsuario
    @IdUsuario INT,
    @NombreUsuario VARCHAR(50),
    @IdRol INT,
    @Estado BIT,
    @PasswordOriginal VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF @PasswordOriginal IS NOT NULL AND LEN(@PasswordOriginal) > 0
        BEGIN
            DECLARE @NuevoSalt VARBINARY(32) = CRYPT_GEN_RANDOM(32);
            DECLARE @NuevoHash VARBINARY(64) = HASHBYTES('SHA2_512', CAST(@PasswordOriginal AS VARBINARY(100)) + @NuevoSalt);

            UPDATE dbo.USUARIOS
            SET NombreUsuario = @NombreUsuario,IdRol = @IdRol,Estado = @Estado,Salt = @NuevoSalt,PasswordHash = @NuevoHash
            WHERE IdUsuario = @IdUsuario;
        END
        ELSE
        BEGIN
            UPDATE dbo.USUARIOS
            SET NombreUsuario = @NombreUsuario,IdRol = @IdRol,Estado = @Estado
            WHERE IdUsuario = @IdUsuario;
        END
        SELECT 1 AS Exito, 'Usuario actualizado correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO

-- para eliminar/desactivar el usuario y Login Sesion
CREATE OR ALTER PROCEDURE sp_DesactivarUsuario
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE dbo.USUARIOS SET Estado = 0
        WHERE IdUsuario = @IdUsuario;
        SELECT 1 AS Exito, 'Usuario desactivado correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO
--para obtener la lista usuarios generales activos:
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerUsuarios
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        u.IdUsuario,
        u.NombreUsuario,
        u.IdRol,
        r.NombreRol,
        u.Estado
    FROM dbo.USUARIOS u
    LEFT JOIN dbo.ROLES r ON u.IdRol = r.IdRol
    ORDER BY u.IdUsuario DESC;
END;
GO
--registrar un usuario
Create OR ALTER PROCEDURE dbo.sp_RegistrarUsuario
    @IdRol INT,
    @NombreUsuario VARCHAR(50),
    @PasswordOriginal VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    -- esto para validar si ya existe el master usuario
    IF EXISTS (SELECT 1 FROM [USUARIOS] WHERE [NombreUsuario] = @NombreUsuario)
    BEGIN
        SELECT 0 AS Creado, 'El nombre de usuario ya está registrado' AS Mensaje;
        RETURN;
    END

    DECLARE @Salt VARBINARY(32) = CRYPT_GEN_RANDOM(32);
    DECLARE @PasswordConHash VARBINARY(64);

    SET @PasswordConHash = HASHBYTES('SHA2_512', CAST(@PasswordOriginal AS VARBINARY(100)) + @Salt);

    INSERT INTO [USUARIOS] ([IdRol], [NombreUsuario], [PasswordHash], [Salt], [Estado])
    VALUES (@IdRol, @NombreUsuario, @PasswordConHash, @Salt, 1);

    SELECT 1 AS Creado, 'Usuario registrado con éxito' AS Mensaje;
END;
GO
-- Validacion de Login
create or Alter PROCEDURE sp_ValidarLogin
    @NombreUsuario VARCHAR(50),
    @PasswordClon VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Salt VARBINARY(32);
    DECLARE @HashGuardado VARBINARY(64);
    DECLARE @HashCalculado VARBINARY(64);
    DECLARE @IdRol INT;
    DECLARE @NombreRol VARCHAR(50);
    DECLARE @IdUsuario INT;

    -- para obtener los datos vista previa en sql
    SELECT 
        @IdUsuario = u.[IdUsuario],
        @Salt = u.[Salt],
        @HashGuardado = u.[PasswordHash],
        @IdRol = u.[IdRol],
        @NombreRol = r.[NombreRol]
    FROM [USUARIOS] u
    INNER JOIN [ROLES] r ON u.[IdRol] = r.[IdRol]
    WHERE u.[NombreUsuario] = @NombreUsuario AND u.[Estado] = 1;

    -- Validar si existe el usuario
    IF @Salt IS NULL
    BEGIN
        SELECT 0 AS Autenticado, 'Usuario no encontrado o inactivo' AS Mensaje;
        RETURN;
    END

    -- Recomputar el Hash con la clave dada y el Salt guardado
    SET @HashCalculado = HASHBYTES('SHA2_512', CAST(@PasswordClon AS VARBINARY(100)) + @Salt);

    -- metodo de comparacion mediante hashbinario
    IF @HashCalculado = @HashGuardado
    BEGIN
        SELECT 
            1 AS Autenticado, 
            @IdUsuario AS IdUsuario, 
            @NombreUsuario AS NombreUsuario, 
            @IdRol AS IdRol, 
            @NombreRol AS NombreRol;
    END
    ELSE
    BEGIN
        SELECT 0 AS Autenticado, 'Contraseña incorrecta' AS Mensaje;
    END
END;
GO

--@Javier sp_ParaModuloProductos:
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerProductos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.IdProducto, 
        p.NombreProducto, 
        p.PrecioVentaBase, 
        p.ManejaLote, 
        p.IdMarca, 
        m.NombreMarca AS Marca,
        p.IdPresentacion, 
        pr.NombrePresentacion AS Presentacion,
        p.IdCategoria, 
        c.NombreCategoria AS Categoria
    FROM dbo.PRODUCTOS p
    LEFT JOIN dbo.MARCAS m ON p.IdMarca = m.IdMarca
    LEFT JOIN dbo.PRESENTACIONES pr ON p.IdPresentacion = pr.IdPresentacion
    LEFT JOIN dbo.CATEGORIAS c ON p.IdCategoria = c.IdCategoria
    ORDER BY p.IdProducto DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_CrearProducto
    @NombreProducto VARCHAR(150),
    @PrecioVentaBase DECIMAL(10,2),
    @ManejaLote BIT,
    @IdMarca INT = NULL,
    @IdPresentacion INT = NULL,
    @IdCategoria INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO dbo.PRODUCTOS (NombreProducto, PrecioVentaBase, ManejaLote, IdMarca, IdPresentacion, IdCategoria)
        VALUES (@NombreProducto, @PrecioVentaBase, @ManejaLote, @IdMarca, @IdPresentacion, @IdCategoria);

        SELECT 1 AS Exito, 'Producto registrado exitosamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ActualizarProducto
    @IdProducto INT,
    @NombreProducto VARCHAR(150),
    @PrecioVentaBase DECIMAL(10,2),
    @ManejaLote BIT,
    @IdMarca INT = NULL,
    @IdPresentacion INT = NULL,
    @IdCategoria INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE dbo.PRODUCTOS
        SET NombreProducto = @NombreProducto,
            PrecioVentaBase = @PrecioVentaBase,
            ManejaLote = @ManejaLote,
            IdMarca = @IdMarca,
            IdPresentacion = @IdPresentacion,
            IdCategoria = @IdCategoria
        WHERE IdProducto = @IdProducto;

        SELECT 1 AS Exito, 'Producto actualizado correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_EliminarProducto
    @IdProducto INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DELETE FROM dbo.PRODUCTOS WHERE IdProducto = @IdProducto;
        SELECT 1 AS Exito, 'Producto eliminado correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO
-- @Jonas sp_ParaModuloProveedores
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerProveedores
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdProveedor, NombreProveedor, Nit, Telefono 
    FROM dbo.PROVEEDORES
    ORDER BY IdProveedor DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_CrearProveedor
    @NombreProveedor VARCHAR(150),
    @Nit VARCHAR(20),
    @Telefono VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO dbo.PROVEEDORES (NombreProveedor, Nit, Telefono)
        VALUES (@NombreProveedor, ISNULL(@Nit, 'CF'), @Telefono);

        SELECT 1 AS Exito, 'Proveedor registrado exitosamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ActualizarProveedor
    @IdProveedor INT,
    @NombreProveedor VARCHAR(150),
    @Nit VARCHAR(20),
    @Telefono VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE dbo.PROVEEDORES
        SET NombreProveedor = @NombreProveedor,
            Nit = ISNULL(@Nit, 'CF'),
            Telefono = @Telefono
        WHERE IdProveedor = @IdProveedor;

        SELECT 1 AS Exito, 'Proveedor actualizado correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_EliminarProveedor
    @IdProveedor INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DELETE FROM dbo.PROVEEDORES WHERE IdProveedor = @IdProveedor;
        SELECT 1 AS Exito, 'Proveedor eliminado correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO
-- @Jonas llamadas para consultas mediante sp_CONSULTASC/M
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerMediosPago
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdMedioPago, NombreMedioPago 
    FROM dbo.MEDIOS_PAGO 
    ORDER BY IdMedioPago;
END;
GO
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerMarcas
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdMarca, NombreMarca FROM dbo.MARCAS;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ObtenerCategorias
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdCategoria, NombreCategoria FROM dbo.CATEGORIAS;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ObtenerPresentaciones
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdPresentacion, NombrePresentacion FROM dbo.PRESENTACIONES;
END;
GO
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerRoles
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdRol, NombreRol FROM dbo.ROLES;
END;
GO

--@Jonas sp_ParaModuloCotizaciones PD: @abner: Modificacion para algunos sp_ + frontend, PD @Jonas: Modificación extra para evitar ambiguedades entre todos
-- 1. OBTENER LISTADO
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerCotizaciones
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

-- 2. OBTENER DETALLE
CREATE OR ALTER PROCEDURE dbo.sp_ObtenerCotizacionDetalle
    @IdCotizacion INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Cabecera
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

    -- Productos
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

-- 3. CONFIRMAR
CREATE OR ALTER PROCEDURE dbo.sp_ConfirmarCotizacion
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

-- Creaacion Cotizacion mediante Json
CREATE OR ALTER PROCEDURE dbo.sp_CrearCotizacion
    @IdCliente INT,
    @JsonDetalle NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        INSERT INTO COTIZACIONES_ENCABEZADO (IdCliente, Fecha, Estado)
        VALUES (@IdCliente, GETDATE(), 'PENDIENTE');

        DECLARE @IdCotizacionCreada INT = SCOPE_IDENTITY();

        INSERT INTO COTIZACIONES_DETALLE (IdCotizacion, IdProducto, Cantidad, PrecioUnitario)
        SELECT 
            @IdCotizacionCreada,
            COALESCE(j.idProducto, j.IdProducto),
            COALESCE(j.cantidad, j.Cantidad),
            COALESCE(j.precioUnitario, j.PrecioUnitario, j.precio, j.Precio)
        FROM OPENJSON(@JsonDetalle)
        WITH (
            idProducto INT '$.idProducto',
            IdProducto INT '$.IdProducto',
            cantidad INT '$.cantidad',
            Cantidad INT '$.Cantidad',
            precioUnitario DECIMAL(10,2) '$.precioUnitario',
            PrecioUnitario DECIMAL(10,2) '$.PrecioUnitario',
            precio DECIMAL(10,2) '$.precio',
            Precio DECIMAL(10,2) '$.Precio'
        ) AS j;

        COMMIT TRANSACTION;

        SELECT @IdCotizacionCreada AS IdCotizacion, 'Cotización guardada exitosamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END;
GO