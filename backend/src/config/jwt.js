const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('Falta la variable de entorno JWT_SECRET');

module.exports = { JWT_SECRET };