import pool from '../src/config/database.js';
import fs from 'fs/promises';
import path from 'path';

const dbReset = async () => {
  try {
    console.log('Starting database reset...');

    // 1. Get a list of all tables
    const [rows] = await pool.query('SHOW TABLES');
    const tables = rows.map(row => Object.values(row)[0]);

    // 2. Drop all tables
    if (tables.length > 0) {
      console.log('Dropping tables...');
      await pool.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const table of tables) {
        await pool.query(`DROP TABLE IF EXISTS ${table}`);
      }
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('Tables dropped.');
    } else {
      console.log('No tables to drop.');
    }

    // 3. Run all migration files
    console.log('Running migrations...');
    const migrationsPath = path.resolve('src/db/migrations');
    const migrationFiles = await fs.readdir(migrationsPath);
    migrationFiles.sort();
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsPath, file);
      const sql = await fs.readFile(filePath, 'utf-8');
      const statements = sql.split(';').filter(statement => statement.trim() !== '');
      for (const statement of statements) {
        await pool.query(statement);
      }
      console.log(`Executed migration: ${file}`);
    }
    console.log('Migrations finished.');

    // 4. Run all seed files
    console.log('Running seeders...');
    const seedersPath = path.resolve('src/db/seeders');
    const seederFiles = await fs.readdir(seedersPath);
    seederFiles.sort();
    for (const file of seederFiles) {
      const filePath = path.join(seedersPath, file);
      const sql = await fs.readFile(filePath, 'utf-8');
      const statements = sql.split(';').filter(statement => statement.trim() !== '');
      for (const statement of statements) {
        await pool.query(statement);
      }
      console.log(`Executed seeder: ${file}`);
    }
    console.log('Seeders finished.');

    console.log('Database reset complete.');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    pool.end();
  }
};

dbReset();
