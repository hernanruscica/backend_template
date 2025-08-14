import pool from '../config/database.js';

export const PermissionModel = {
  async create({ name, description }) {
    const sql = 'INSERT INTO permissions (name, description) VALUES (?, ?)';
    const [result] = await pool.query(sql, [name, description]);
    return { id: result.insertId };
  },

  async findById(id) {
    const sql = 'SELECT * FROM permissions WHERE id = ?';
    const [rows] = await pool.query(sql, [id]);
    return rows[0];
  },

  async findByName(name) {
    const sql = 'SELECT * FROM permissions WHERE name = ?';
    const [rows] = await pool.query(sql, [name]);
    return rows[0];
  }
};
