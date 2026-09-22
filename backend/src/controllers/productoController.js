const { sql, dbConfig } = require('../config/db');

// 1. Obtener todos los productos con sus descripciones de catálogo
const getProductos = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
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
      ORDER BY p.IdProducto DESC
    `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('---> ERROR EN T-SQL (getProductos):', error);
    res.status(500).json({ mensaje: 'Error al consultar productos', error: error.message });
  }
};

// 2. Crear producto
const createProducto = async (req, res) => {
  const { nombreProducto, precioVentaBase, manejaLote, idMarca, idPresentacion, idCategoria } = req.body;

  if (!nombreProducto || precioVentaBase === undefined) {
    return res.status(400).json({ mensaje: 'El nombre y precio base del producto son obligatorios.' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('nombreProducto', sql.VarChar(150), nombreProducto.trim())
      .input('precioVentaBase', sql.Decimal(10, 2), parseFloat(precioVentaBase))
      .input('manejaLote', sql.Bit, manejaLote ? 1 : 0)
      .input('idMarca', sql.Int, idMarca ? parseInt(idMarca, 10) : null)
      .input('idPresentacion', sql.Int, idPresentacion ? parseInt(idPresentacion, 10) : null)
      .input('idCategoria', sql.Int, idCategoria ? parseInt(idCategoria, 10) : null)
      .query(`
        INSERT INTO dbo.PRODUCTOS (NombreProducto, PrecioVentaBase, ManejaLote, IdMarca, IdPresentacion, IdCategoria)
        VALUES (@nombreProducto, @precioVentaBase, @manejaLote, @idMarca, @idPresentacion, @idCategoria)
      `);

    res.status(201).json({ ok: true, mensaje: 'Producto registrado exitosamente' });
  } catch (error) {
    console.error('---> ERROR EN T-SQL (createProducto):', error);
    res.status(500).json({ mensaje: 'Error al registrar producto', error: error.message });
  }
};

// 3. Actualizar producto
const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombreProducto, precioVentaBase, manejaLote, idMarca, idPresentacion, idCategoria } = req.body;

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || !nombreProducto || precioVentaBase === undefined) {
    return res.status(400).json({ mensaje: 'ID, Nombre y Precio son obligatorios.' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('idProducto', sql.Int, parsedId)
      .input('nombreProducto', sql.VarChar(150), nombreProducto.trim())
      .input('precioVentaBase', sql.Decimal(10, 2), parseFloat(precioVentaBase))
      .input('manejaLote', sql.Bit, manejaLote ? 1 : 0)
      .input('idMarca', sql.Int, idMarca ? parseInt(idMarca, 10) : null)
      .input('idPresentacion', sql.Int, idPresentacion ? parseInt(idPresentacion, 10) : null)
      .input('idCategoria', sql.Int, idCategoria ? parseInt(idCategoria, 10) : null)
      .query(`
        UPDATE dbo.PRODUCTOS
        SET 
          NombreProducto = @nombreProducto,
          PrecioVentaBase = @precioVentaBase,
          ManejaLote = @manejaLote,
          IdMarca = @idMarca,
          IdPresentacion = @idPresentacion,
          IdCategoria = @idCategoria
        WHERE IdProducto = @idProducto
      `);

    res.json({ ok: true, mensaje: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('---> ERROR EN T-SQL (updateProducto):', error);
    res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
  }
};

// 4. Eliminar producto
const deleteProducto = async (req, res) => {
  const { id } = req.params;

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ mensaje: 'ID de producto inválido.' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('idProducto', sql.Int, parsedId)
      .query('DELETE FROM dbo.PRODUCTOS WHERE IdProducto = @idProducto');

    res.json({ ok: true, mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('---> ERROR EN T-SQL (deleteProducto):', error);
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
};

module.exports = {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto
};