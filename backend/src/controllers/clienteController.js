const {
  obtenerClientesBD,
  crearClienteBD,
  actualizarClienteBD,
  eliminarClienteBD
} = require('../services/clienteService');

const getClientes = async (req, res) => {
  try {
    const clientes = await obtenerClientesBD();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar clientes', error: error.message });
  }
};

const createCliente = async (req, res) => {
  const { nombre, nit, esEmpresa } = req.body;
  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre del cliente es obligatorio.' });
  }

  try {
    const data = await crearClienteBD(nombre, nit, esEmpresa);
    if (data.Exito === 1) {
      res.status(201).json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar cliente', error: error.message });
  }
};

const updateCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, nit, esEmpresa } = req.body;

  if (!id || !nombre) {
    return res.status(400).json({ mensaje: 'El ID y nombre son obligatorios.' });
  }

  try {
    const data = await actualizarClienteBD(id, nombre, nit, esEmpresa);
    if (data.Exito === 1) {
      res.json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar cliente', error: error.message });
  }
};

const deleteCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await eliminarClienteBD(id);
    if (data.Exito === 1) {
      res.json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar cliente', error: error.message });
  }
};

module.exports = { getClientes, createCliente, updateCliente, deleteCliente };