import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mdv_sensors_v2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('Database pool created successfully');
} catch (error) {
  console.error('Error creating database pool:', error);
  process.exit(1);
}


export default pool;
