--le dejamos el script para los inserts primordiales para el uso de OMNI-SAZO
USE [OMNISAZO];
GO

-- 1. Insertar Roles (1: Digitador, 2: Cajero, 3: Gerente)
INSERT INTO dbo.ROLES (NombreRol)
VALUES 
    ('Digitador'),
    ('Cajero'),
    ('Gerente');
GO

-- 2. Insertar Marcas
INSERT INTO dbo.MARCAS (NombreMarca)
VALUES 
    ('Lanco'),
    ('Comex'),
    ('Sika'),
    ('Truper'),
    ('Generico');
GO

-- 3. Insertar Categorías
INSERT INTO dbo.CATEGORIAS (NombreCategoria)
VALUES 
    ('Pinturas y Esmaltes'),
    ('Impermeabilizantes'),
    ('Pegamentos y Adhesivos'),
    ('Herramientas'),
    ('Solventes y Químicos');
GO

-- 4. Insertar Presentaciones
INSERT INTO dbo.PRESENTACIONES (NombrePresentacion)
VALUES 
    ('Galón'),
    ('Cubeta (5 Galones)'),
    ('Litro'),
    ('Unidad'),
    ('Bolsa 1 kg');
GO

-- 5. Insertar Usuario Administrador de Prueba usando tu Procedure
-- (El IdRol 3 corresponde a 'Gerente' según la secuencia del INSERT)
EXEC dbo.sp_RegistrarUsuario 
    @IdRol = 3, 
    @NombreUsuario = 'admin_prueba', 
    @PasswordOriginal = 'Admin123!';
GO