const {
  obtenerRolesBD,
  obtenerMarcasBD,
  obtenerCategoriasBD,
  obtenerPresentacionesBD,
  obtenerBodegasBD,
  obtenerUbicacionesBD
} = require('../services/catalogoService');

const getRoles = async (req, res) => {
  try {
    const roles = await obtenerRolesBD();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar roles', error: error.message });
  }
};

const getMarcas = async (req, res) => {
  try {
    const marcas = await obtenerMarcasBD();
    res.json(marcas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar marcas', error: error.message });
  }
};

const getCategorias = async (req, res) => {
  try {
    const categorias = await obtenerCategoriasBD();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar categorías', error: error.message });
  }
};

const getPresentaciones = async (req, res) => {
  try {
    const presentaciones = await obtenerPresentacionesBD();
    res.json(presentaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar presentaciones', error: error.message });
  }
};

// @Javier: bodegas y ubicaciones
const getBodegas = async (req, res) => {
  try {
    const bodegas = await obtenerBodegasBD();
    res.json(bodegas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar bodegas', error: error.message });
  }
};

const getUbicaciones = async (req, res) => {
  const { idBodega } = req.query;
  try {
    const ubicaciones = await obtenerUbicacionesBD(idBodega);
    res.json(ubicaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar ubicaciones', error: error.message });
  }
};

module.exports = { getRoles, getMarcas, getCategorias, getPresentaciones, getBodegas, getUbicaciones };