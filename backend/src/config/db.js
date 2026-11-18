const sql = require('mssql');

const required = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`Falta la variable de entorno ${name}`);
  return v;
};

const dbConfig = {
  user: required('DB_USER'),
  password: required('DB_PASSWORD'),
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'OMNISAZO',
  options: { encrypt: false, trustServerCertificate: true }
};

module.exports = { sql, dbConfig };