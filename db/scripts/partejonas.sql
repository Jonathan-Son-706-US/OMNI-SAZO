--como crear los usuarios con los procedures del login
--1 Digitador
--2 Cajero
--3 Gerente
EXEC sp_RegistrarUsuario
    @IdRol = 0,                       
    @NombreUsuario = '',         
    @PasswordOriginal = '';    
GO

EXEC sp_ValidarLogin @NombreUsuario = '', @PasswordClon = '';