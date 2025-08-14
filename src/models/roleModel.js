import pool from '../config/database.js';

export const RoleModel = {
  async create({ name }) {
    const sql = 'INSERT INTO roles (name) VALUES (?)';
    const [result] = await pool.query(sql, [name]);
    return { id: result.insertId };
  },

  async findById(id) {
    const sql = 'SELECT * FROM roles WHERE id = ?';
    const [rows] = await pool.query(sql, [id]);
    return rows[0];
  },

  async findByName(name) {
    const sql = 'SELECT * FROM roles WHERE name = ?';
    const [rows] = await pool.query(sql, [name]);
    return rows[0];
  },

  async addPermission(roleId, permissionId) {
    const sql = 'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)';
    await pool.query(sql, [roleId, permissionId]);
  }
};
