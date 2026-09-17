const sql = require('mssql');

const dbConfig = {
  user: 'usuarioLejos',
  password: '123',
  server: 'localhost',
  database: 'OMNISAZO',
  options: { encrypt: false, trustServerCertificate: true }
};

module.exports = { sql, dbConfig };
//@jonas: aqui usen la forma local/express si usaron autentificación windows sino lo que hicimos con el inge en las primeras semanas con usuarios en logins remotos
//sino les dejo fotos en la carpeta public del fronted