const {
  obtenerProductosBD,
  crearProductoBD,
  actualizarProductoBD,
  eliminarProductoBD
} = require('../services/productoService');

const getProductos = async (req, res) => {
  try {
    const productos = await obtenerProductosBD();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar productos', error: error.message });
  }
};

const createProducto = async (req, res) => {
  const { nombreProducto, precioVentaBase, manejaLote, idMarca, idPresentacion, idCategoria } = req.body;

  if (!nombreProducto || precioVentaBase === undefined) {
    return res.status(400).json({ mensaje: 'El nombre y precio base son obligatorios.' });
  }

  try {
    const data = await crearProductoBD(nombreProducto, precioVentaBase, manejaLote, idMarca, idPresentacion, idCategoria);
    if (data.Exito === 1) {
      res.status(201).json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar producto', error: error.message });
  }
};

const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombreProducto, precioVentaBase, manejaLote, idMarca, idPresentacion, idCategoria } = req.body;

  if (!id || !nombreProducto || precioVentaBase === undefined) {
    return res.status(400).json({ mensaje: 'ID, Nombre y Precio son obligatorios.' });
  }

  try {
    const data = await actualizarProductoBD(id, nombreProducto, precioVentaBase, manejaLote, idMarca, idPresentacion, idCategoria);
    if (data.Exito === 1) {
      res.json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
  }
};

const deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await eliminarProductoBD(id);
    if (data.Exito === 1) {
      res.json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
};

module.exports = { getProductos, createProducto, updateProducto, deleteProducto };