const {
  obtenerRolesBD,
  obtenerMarcasBD,
  obtenerCategoriasBD,
  obtenerPresentacionesBD
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

module.exports = { getRoles, getMarcas, getCategorias, getPresentaciones };