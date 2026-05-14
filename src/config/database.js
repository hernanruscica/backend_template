import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool;
let poolData;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mdv_sensors_v2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    idleTimeout: 60000
  });
  //console.log('Database pool created successfully');
} catch (error) {
  console.error('Error creating database pool:', error);
  process.exit(1);
}

try {
  poolData = mysql.createPool({
      host: process.env.DB_HOST_DATA,
      user: process.env.DB_USER_DATA,
      password: process.env.DB_PASSWORD_DATA,
      database: process.env.DB_NAME_DATA,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      idleTimeout: 60000
  });
  //console.log('Database poolData created successfully');
} catch (error) {
  console.error('Error creating database poolData:', error);
  process.exit(1);
}





export { pool, poolData };
