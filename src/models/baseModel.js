import pool from '../config/database.js';
import { randomUUID } from 'crypto';
import CustomError from '../utils/customError.js';

const BaseModel = (tableName, allowedFields = []) => ({
  tableName,
  allowedFields,

  async create(data, createdBy) {
    const uuid = randomUUID();
    const fields = ['uuid'];
    const values = [uuid];
    const placeholders = ['?'];

    for (const key in data) {
      if (this.allowedFields.includes(key)) {
        fields.push(key.replace(/([A-Z])/g, '_$1').toLowerCase());
        values.push(data[key]);
        placeholders.push('?');
      }
    }

    if (createdBy) {
      fields.push('created_by');
      values.push(createdBy);
      placeholders.push('?');
    }

    const sql = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;

    try {
      await pool.query(sql, values);
      return this.findByUuid(uuid);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new CustomError(`A record with the provided information already exists.`, 409);
      }
      throw error;
    }
  },

  async findByUuid(uuid) {
    const sql = `SELECT * FROM ${this.tableName} WHERE uuid = ?`;
    const [rows] = await pool.query(sql, [uuid]);
    return rows[0];
  },

  async findAll() {
    const sql = `SELECT * FROM ${this.tableName}`;
    const [rows] = await pool.query(sql);
    return rows;
  },

  async findAllByBusinessUuid(businessUuid) {
    const sql = `
      SELECT t.*
      FROM ${this.tableName} t
      WHERE t.business_uuid = ?
    `;
    const [rows] = await pool.query(sql, [businessUuid]);
    return rows;
  },

  async update(uuid, fields, updatedBy) {
    const fieldEntries = Object.entries(fields);
    const validFields = fieldEntries.filter(([key]) => this.allowedFields.includes(key));

    let setClause = validFields.map(([key]) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`).join(', ');
    const values = validFields.map(([, value]) => value);

    if (updatedBy) {
      if (setClause) {
        setClause += ', ';
      }
      setClause += 'updated_by = ?';
      values.push(updatedBy);
    }

    if (values.length === 0) {
      return { affectedRows: 0 };
    }

    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE uuid = ?`;
    const [result] = await pool.query(sql, [...values, uuid]);
    return result;
  },

  async delete(uuid, updatedBy) {
    const sql = `UPDATE ${this.tableName} SET is_active = false, updated_by = ? WHERE uuid = ?`;
    const [result] = await pool.query(sql, [updatedBy, uuid]);
    return result;
  },

  async hardDelete(uuid) {
    const sql = `DELETE FROM ${this.tableName} WHERE uuid = ?`;
    try {
      const [result] = await pool.query(sql, [uuid]);
      return result;
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new CustomError('This record cannot be deleted because it is referenced by other records.', 409);
      }
      throw error;
    }
  },
});

export default BaseModel;
