const { sql, dbConfig } = require('../config/db');

// 1. Obtener proveedores (Consulta T-SQL explícita ajustada a tu esquema)
const getProveedores = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        IdProveedor, 
        NombreProveedor, 
        Nit, 
        Telefono 
      FROM dbo.PROVEEDORES
      ORDER BY IdProveedor DESC
    `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('---> ERROR EN T-SQL (getProveedores):', error);
    res.status(500).json({ mensaje: 'Error al consultar proveedores', error: error.message });
  }
};

// 2. Crear proveedor
const createProveedor = async (req, res) => {
  const { nombreProveedor, nit, telefono } = req.body;

  if (!nombreProveedor) {
    return res.status(400).json({ mensaje: 'El nombre del proveedor es obligatorio.' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('nombreProveedor', sql.VarChar(150), nombreProveedor)
      .input('nit', sql.VarChar(20), nit || 'CF')
      .input('telefono', sql.VarChar(20), telefono || null)
      .query(`
        INSERT INTO dbo.PROVEEDORES (NombreProveedor, Nit, Telefono)
        VALUES (@nombreProveedor, @nit, @telefono)
      `);

    res.status(201).json({ ok: true, mensaje: 'Proveedor registrado exitosamente' });
  } catch (error) {
    console.error('---> ERROR EN T-SQL (createProveedor):', error);
    res.status(500).json({ mensaje: 'Error al registrar proveedor', error: error.message });
  }
};

// 3. Actualizar proveedor (EDITAR)
const updateProveedor = async (req, res) => {
  const { id } = req.params;
  const { nombreProveedor, nit, telefono } = req.body;

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || !nombreProveedor) {
    return res.status(400).json({ mensaje: 'El ID y nombre son obligatorios.' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('idProveedor', sql.Int, parsedId)
      .input('nombreProveedor', sql.VarChar(150), nombreProveedor)
      .input('nit', sql.VarChar(20), nit || 'CF')
      .input('telefono', sql.VarChar(20), telefono || null)
      .query(`
        UPDATE dbo.PROVEEDORES
        SET 
          NombreProveedor = @nombreProveedor,
          Nit = @nit,
          Telefono = @telefono
        WHERE IdProveedor = @idProveedor
      `);

    res.json({ ok: true, mensaje: 'Proveedor actualizado correctamente' });
  } catch (error) {
    console.error('---> ERROR EN T-SQL (updateProveedor):', error);
    res.status(500).json({ mensaje: 'Error al actualizar proveedor', error: error.message });
  }
};

// 4. Eliminar proveedor
const deleteProveedor = async (req, res) => {
  const { id } = req.params;

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ mensaje: 'ID de proveedor inválido.' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('idProveedor', sql.Int, parsedId)
      .query('DELETE FROM dbo.PROVEEDORES WHERE IdProveedor = @idProveedor');

    res.json({ ok: true, mensaje: 'Proveedor eliminado correctamente' });
  } catch (error) {
    console.error('---> ERROR EN T-SQL (deleteProveedor):', error);
    res.status(500).json({ mensaje: 'Error al eliminar proveedor', error: error.message });
  }
};

module.exports = {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor
};