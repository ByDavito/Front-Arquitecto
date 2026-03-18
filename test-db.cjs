const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'C:/Users/david/Desktop/Programacion/Sistema arquitectos/API Sistema Arquitectos/.env' });

async function queryDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_SERVER || '127.0.0.1',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await connection.execute('SELECT id, email, role, dominio, isActive FROM usuarios');
    console.log("Usuarios in DB:");
    console.table(rows);
    await connection.end();
  } catch (error) {
    console.error("DB connection failed:", error.message);
  }
}

queryDB();
