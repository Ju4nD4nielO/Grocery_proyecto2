const { Pool } = require('pg');

// Render provee DATABASE_URL como connection string completa.
// En local usamos variables separadas del .env.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }   // requerido por Render
    })
  : new Pool({
      host:     process.env.DB_HOST,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port:     process.env.DB_PORT,
    });

module.exports = pool;