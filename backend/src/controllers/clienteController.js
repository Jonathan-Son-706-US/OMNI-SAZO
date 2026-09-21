const { sql, dbConfig } = require('../config/db');

// 1. Obtener todos los clientes (con SELECT * para evitar fallos de columnas)
const getClientes = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        IdCliente, 
        Nombre, 
        Nit, 
        EsEmpresa 
      FROM dbo.CLIENTES 
      ORDER BY IdCliente DESC
    `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al consultar clientes:', error);
    res.status(500).json({ mensaje: 'Error al consultar clientes', error: error.message });
  }
};

// 2. Crear cliente
const createCliente = async (req, res) => {
  const { nombre, nit, esEmpresa } = req.body;

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre del cliente es obligatorio.' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('nombre', sql.VarChar(150), nombre)
      .input('nit', sql.VarChar(20), nit || 'CF')
      .input('esEmpresa', sql.Bit, esEmpresa ? 1 : 0)
      .query(`
        INSERT INTO dbo.CLIENTES (Nombre, Nit, EsEmpresa)
        VALUES (@nombre, @nit, @esEmpresa)
      `);

    res.status(201).json({ ok: true, mensaje: 'Cliente registrado exitosamente' });
  } catch (error) {
    console.error('---> ERROR EXACTO EN BACKEND (createCliente):', error);
    res.status(500).json({ mensaje: 'Error al registrar cliente', error: error.message });
  }
};

// 3. Actualizar cliente
const updateCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, nit, esEmpresa } = req.body;

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || !nombre) {
    return res.status(400).json({ mensaje: 'El ID y nombre son obligatorios.' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('idCliente', sql.Int, parsedId)
      .input('nombre', sql.VarChar(150), nombre)
      .input('nit', sql.VarChar(20), nit || 'CF')
      .input('esEmpresa', sql.Bit, esEmpresa ? 1 : 0)
      .query(`
        UPDATE dbo.CLIENTES
        SET 
          Nombre = @nombre,
          Nit = @nit,
          EsEmpresa = @esEmpresa
        WHERE IdCliente = @idCliente
      `);

    res.json({ ok: true, mensaje: 'Cliente actualizado correctamente' });
  } catch (error) {
    console.error('---> ERROR EXACTO EN BACKEND (updateCliente):', error);
    res.status(500).json({ mensaje: 'Error al actualizar cliente', error: error.message });
  }
};

// 4. Eliminar cliente
const deleteCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('idCliente', sql.Int, id)
      .query('DELETE FROM dbo.CLIENTES WHERE IdCliente = @idCliente');

    res.json({ ok: true, mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('---> ERROR EXACTO EN BACKEND (deleteCliente):', error);
    res.status(500).json({ mensaje: 'Error al eliminar cliente', error: error.message });
  }
};

module.exports = {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente
};