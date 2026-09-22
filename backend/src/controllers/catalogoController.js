// @Javi: Este controlador es para las tablas de Marcas, Presentaciones y Categoria para los desplegables de Inventario
const { sql, dbConfig } = require('../config/db');

// Obtener Marcas
const getMarcas = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT IdMarca, NombreMarca FROM dbo.MARCAS');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar marcas', error: error.message });
  }
};

// Obtener Categorías
const getCategorias = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT IdCategoria, NombreCategoria FROM dbo.CATEGORIAS');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar categorías', error: error.message });
  }
};

// Obtener Presentaciones
const getPresentaciones = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT IdPresentacion, NombrePresentacion FROM dbo.PRESENTACIONES');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar presentaciones', error: error.message });
  }
};

module.exports = {
  getMarcas,
  getCategorias,
  getPresentaciones
};