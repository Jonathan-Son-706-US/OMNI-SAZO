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

-- 5. Insertar Colores
INSERT INTO dbo.COLORES (NombreColor, CodigoHex)
VALUES 
    ('Blanco Ostión', '#FAF0E6'),
    ('Blanco Nieve', '#FFFFFF'),
    ('Negro Mate', '#282828'),
    ('Rojo Teja', '#B22222'),
    ('Azul Naval', '#00205B'),
    ('Azul Caribe', '#007BA7'),
    ('Verde Bosque', '#228B22'),
    ('Amarillo Ocre', '#CC7722'),
    ('Gris Perla', '#D3D3D3'),
    ('Marfil Cálido', '#FFFFF0');
GO

-- 6. Insertar Usuario Administrador de Prueba, un cajero y un digitador
-- (El IdRol 3 corresponde a 'Gerente' según la secuencia del INSERT)
EXEC dbo.sp_RegistrarUsuario 
    @IdRol = 3, 
    @NombreUsuario = 'david', 
    @PasswordOriginal = 'sazo123';
GO

EXEC dbo.sp_RegistrarUsuario @IdRol = 2, @NombreUsuario = 'jonas',   @PasswordOriginal = 'jonas123';
EXEC dbo.sp_RegistrarUsuario @IdRol = 2, @NombreUsuario = 'abner', @PasswordOriginal = 'abner123';
EXEC dbo.sp_RegistrarUsuario @IdRol = 1, @NombreUsuario = 'jair', @PasswordOriginal = 'jair123';
EXEC dbo.sp_RegistrarUsuario @IdRol = 1, @NombreUsuario = 'javier', @PasswordOriginal = 'javier123';


-- 7. Insertar Medios de Pago
IF NOT EXISTS (SELECT 1 FROM dbo.MEDIOS_PAGO)
BEGIN
    INSERT INTO dbo.MEDIOS_PAGO (NombreMedioPago)
    VALUES 
        ('Efectivo'),
        ('Tarjeta'),
        ('Cheque');
END
GO
