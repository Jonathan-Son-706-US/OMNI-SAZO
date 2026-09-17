--registro de usuario
create PROCEDURE sp_RegistrarUsuario
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
-- 2. Validacion de Login
create PROCEDURE sp_ValidarLogin
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

    -- @jonas: para obtener los datos vista previa en sql recuerden usar exec igual les voy a dejar un ejemplo para añadir un usuario y validarlo tambien usen postman :>
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