import pool from '../config/database.js';
import { randomUUID } from 'crypto';

export const BusinessModel = {
  async create({ name, description, phone, email, address, createdBy }) {
    const { street, city, state, country, zip_code } = address;
    const uuid = randomUUID();
    const sql = `
      INSERT INTO businesses (uuid, name, description, phone, email, street, city, state, country, zip_code, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(sql, [uuid, name, description, phone, email, street, city, state, country, zip_code, createdBy]);
    const newBusiness = await this.findByUuid(uuid);
    return newBusiness;
  },

  async findByUuid(uuid) {
    const sql = 'SELECT * FROM businesses WHERE uuid = ?';
    const [rows] = await pool.query(sql, [uuid]);
    if (rows[0]) {
      const { street, city, state, country, zip_code, ...businessData } = rows[0];
      return {
        ...businessData,
        address: { street, city, state, country, zip_code }
      };
    }
    return undefined;
  },

  async addUser(businessUuid, userUuid, roleUuid, createdBy) {
    const uuid = randomUUID();
    const sql = 'INSERT INTO business_users (uuid, business_uuid, user_uuid, role_uuid, created_by) VALUES (?, ?, ?, ?, ?)';
    await pool.query(sql, [uuid, businessUuid, userUuid, roleUuid, createdBy]);
  },

  async removeUser(businessUuid, userUuid) {
    const sql = 'DELETE FROM business_users WHERE business_uuid = ? AND user_uuid = ?';
    await pool.query(sql, [businessUuid, userUuid]);
  },

  async findAll() {
    const sql = 'SELECT * FROM businesses';
    const [rows] = await pool.query(sql);
    return rows.map(row => {
      const { street, city, state, country, zip_code, ...businessData } = row;
      return {
        ...businessData,
        address: { street, city, state, country, zip_code }
      };
    });
  },

  async findAllByBusinessUuid(businessUuid) {
    const sql = 'SELECT * FROM businesses WHERE uuid = ?';
    const [rows] = await pool.query(sql, [businessUuid]);
    return rows.map(row => {
      const { street, city, state, country, zip_code, ...businessData } = row;
      return {
        ...businessData,
        address: { street, city, state, country, zip_code }
      };
    });
  },

  async findBusinessByUserId(userUuid) {
    const sql = `
      SELECT b.*
      FROM businesses b
      JOIN business_users bu ON b.uuid = bu.business_uuid
      WHERE bu.user_uuid = ?
    `;
    const [rows] = await pool.query(sql, [userUuid]);
    if (rows[0]) {
      const { street, city, state, country, zip_code, ...businessData } = rows[0];
      return {
        ...businessData,
        address: { street, city, state, country, zip_code }
      };
    }
    return undefined;
  },

  async update(uuid, fields, updatedBy) {
    const { address, ...otherFields } = fields;
    const allowedFields = ['name', 'description', 'phone', 'email', 'logo_url'];
    
    const fieldEntries = Object.entries(otherFields);
    const validFields = fieldEntries.filter(([key]) => allowedFields.includes(key));
    
    let setClause = validFields.map(([key]) => `${key} = ?`).join(', ');
    const values = validFields.map(([, value]) => value);

    if (address) {
      const addressFields = Object.entries(address);
      const validAddressFields = addressFields.filter(([key]) => ['street', 'city', 'state', 'country', 'zip_code'].includes(key));
      if (validAddressFields.length > 0) {
        const addressSetClause = validAddressFields.map(([key]) => `${key} = ?`).join(', ');
        if (setClause) {
          setClause += ', ';
        }
        setClause += addressSetClause;
        values.push(...validAddressFields.map(([, value]) => value));
      }
    }

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

    const sql = `UPDATE businesses SET ${setClause} WHERE uuid = ?`;
    const [result] = await pool.query(sql, [...values, uuid]);
    return result;
  },

  async delete(uuid, updatedBy) {
    const sql = 'UPDATE businesses SET is_active = false, updated_by = ? WHERE uuid = ?';
    const [result] = await pool.query(sql, [updatedBy, uuid]);
    return result;
  },

  async hardDelete(uuid) {
    const sql = 'DELETE FROM businesses WHERE uuid = ?';
    const [result] = await pool.query(sql, [uuid]);
    return result;
  },

  
};
