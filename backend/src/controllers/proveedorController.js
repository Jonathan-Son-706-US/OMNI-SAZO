const {
  obtenerProveedoresBD,
  crearProveedorBD,
  actualizarProveedorBD,
  eliminarProveedorBD
} = require('../services/proveedorService');

const getProveedores = async (req, res) => {
  try {
    const proveedores = await obtenerProveedoresBD();
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar proveedores', error: error.message });
  }
};

const createProveedor = async (req, res) => {
  const { nombreProveedor, nit, telefono } = req.body;

  if (!nombreProveedor) {
    return res.status(400).json({ mensaje: 'El nombre del proveedor es obligatorio.' });
  }

  try {
    const data = await crearProveedorBD(nombreProveedor, nit, telefono);
    if (data.Exito === 1) {
      res.status(201).json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar proveedor', error: error.message });
  }
};

const updateProveedor = async (req, res) => {
  const { id } = req.params;
  const { nombreProveedor, nit, telefono } = req.body;

  if (!id || !nombreProveedor) {
    return res.status(400).json({ mensaje: 'El ID y nombre son obligatorios.' });
  }

  try {
    const data = await actualizarProveedorBD(id, nombreProveedor, nit, telefono);
    if (data.Exito === 1) {
      res.json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar proveedor', error: error.message });
  }
};

const deleteProveedor = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await eliminarProveedorBD(id);
    if (data.Exito === 1) {
      res.json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar proveedor', error: error.message });
  }
};

module.exports = { getProveedores, createProveedor, updateProveedor, deleteProveedor };