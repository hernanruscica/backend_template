import pool from '../config/database.js';
import { randomUUID } from 'crypto';

export const UserModel = {
  async create({ firstName, lastName, email, password, phone, dni, avatarUrl, street, city, state, country, zipCode }) {
    const uuid = randomUUID();
    const sql = `
      INSERT INTO users (uuid, first_name, last_name, email, password, phone, dni, avatar_url, street, city, state, country, zip_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [uuid, firstName, lastName, email, password, phone, dni, avatarUrl, street, city, state, country, zipCode]);
    const newUser = await this.findById(result.insertId);
    return newUser;
  },

  async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.query(sql, [email]);
    return rows[0];
  },

  async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await pool.query(sql, [id]);
    return rows[0];
  },

  async findByUuid(uuid) {
    const sql = 'SELECT * FROM users WHERE uuid = ?';
    const [rows] = await pool.query(sql, [uuid]);
    return rows[0];
  },

  async findAll() {
    const sql = 'SELECT * FROM users';
    const [rows] = await pool.query(sql);
    return rows;
  },

  async update(id, fields) {
    const allowedFields = ['first_name', 'last_name', 'email', 'password', 'phone', 'dni', 'avatar_url', 'street', 'city', 'state', 'country', 'zip_code'];
    const fieldEntries = Object.entries(fields);
    const validFields = fieldEntries.filter(([key]) => allowedFields.includes(key));
    
    if (validFields.length === 0) {
      return { affectedRows: 0 };
    }

    const setClause = validFields.map(([key]) => `${key} = ?`).join(', ');
    const values = validFields.map(([, value]) => value);

    const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
    const [result] = await pool.query(sql, [...values, id]);
    return result;
  },

  async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const [result] = await pool.query(sql, [id]);
    return result;
  }
};
