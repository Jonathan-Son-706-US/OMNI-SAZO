USE [OMNISAZO];
GO

-- procedimiento principal de tu modulo para obtener toda la data lista para el ticket
CREATE OR ALTER PROCEDURE dbo.PROCEDUREIMPRESIONDEFACTURAS
    @IdFactura INT
AS
BEGIN
    SET NOCOUNT ON;

    -- cabecera de la factura
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

    -- detalle de productos
    SELECT 
        p.NombreProducto,
        fd.Cantidad,
        fd.PrecioUnitario,
        fd.Subtotal
    FROM FACTURAS_DETALLE fd
    INNER JOIN PRODUCTOS p ON fd.IdProducto = p.IdProducto
    WHERE fd.IdFactura = @IdFactura;

    -- detalle de pagos
    SELECT 
        mp.NombreMedioPago,
        fp.Monto
    FROM FACTURAS_PAGOS fp
    INNER JOIN MEDIOS_PAGO mp ON fp.IdMedioPago = mp.IdMedioPago
    WHERE fp.IdFactura = @IdFactura;
END;
GO

-- listar el historial de facturas para la pantalla de impresion
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
