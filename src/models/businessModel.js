import pool from '../config/database.js';
import { randomUUID } from 'crypto';

export const BusinessModel = {
  async create({ name, description, phone, email, street, city, state, country, zip_code }) {
    const uuid = randomUUID();
    const sql = `
      INSERT INTO businesses (uuid, name, description, phone, email, street, city, state, country, zip_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [uuid, name, description, phone, email, street, city, state, country, zip_code]);
    const newBusiness = await this.findById(result.insertId);
    return newBusiness;
  },

  async findById(id) {
    const sql = 'SELECT * FROM businesses WHERE id = ?';
    const [rows] = await pool.query(sql, [id]);
    return rows[0];
  },

  async findByUuid(uuid) {
    const sql = 'SELECT * FROM businesses WHERE uuid = ?';
    const [rows] = await pool.query(sql, [uuid]);
    return rows[0];
  },

  async addUser(businessId, userId, roleId) {
    const sql = 'INSERT INTO business_users (business_id, user_id, role_id) VALUES (?, ?, ?)';
    await pool.query(sql, [businessId, userId, roleId]);
  },

  async findAll() {
    const sql = 'SELECT * FROM businesses';
    const [rows] = await pool.query(sql);
    return rows;
  },

  async update(id, fields) {
    const allowedFields = ['name', 'description', 'phone', 'email', 'street', 'city', 'state', 'country', 'zip_code', 'logo_url'];
    const fieldEntries = Object.entries(fields);
    const validFields = fieldEntries.filter(([key]) => allowedFields.includes(key));

    if (validFields.length === 0) {
      return { affectedRows: 0 };
    }

    const setClause = validFields.map(([key]) => `${key} = ?`).join(', ');
    const values = validFields.map(([, value]) => value);

    const sql = `UPDATE businesses SET ${setClause} WHERE id = ?`;
    const [result] = await pool.query(sql, [...values, id]);
    return result;
  },

  async delete(id) {
    const sql = 'DELETE FROM businesses WHERE id = ?';
    const [result] = await pool.query(sql, [id]);
    return result;
  }
};
