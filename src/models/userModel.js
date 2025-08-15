import pool from '../config/database.js';
import { randomUUID } from 'crypto';

export const UserModel = {
  async create({ firstName, lastName, email, password, phone, dni, avatarUrl, address, createdBy }) {
    const { street, city, state, country, zipCode } = address;
    const uuid = randomUUID();
    const sql = `
      INSERT INTO users (uuid, first_name, last_name, email, password, phone, dni, avatar_url, street, city, state, country, zip_code, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(sql, [uuid, firstName, lastName, email, password, phone, dni, avatarUrl, street, city, state, country, zipCode, createdBy]);
    const newUser = await this.findByUuid(uuid);
    return newUser;
  },

  async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.query(sql, [email]);
    return rows[0];
  },

  async findByDni(dni) {
    const sql = 'SELECT * FROM users WHERE dni = ?';
    const [rows] = await pool.query(sql, [dni]);
    if (rows[0]) {
      const { street, city, state, country, zip_code, ...userData } = rows[0];
      const businesses_roles = await this.findUserBusinessesAndRoles(rows[0].uuid);
      return {
        ...userData,
        address: { street, city, state, country, zip_code },
        businesses_roles
      };
    }
    return undefined;
  },

  async findByUuid(uuid) {
    const sql = 'SELECT * FROM users WHERE uuid = ?';
    const [rows] = await pool.query(sql, [uuid]);
    if (rows[0]) {
      const { street, city, state, country, zip_code, ...userData } = rows[0];
      const businesses_roles = await this.findUserBusinessesAndRoles(rows[0].uuid);
      return {
        ...userData,
        address: { street, city, state, country, zip_code },
        businesses_roles
      };
    }
    return undefined;
  },

  async findAll() {
    const sql = 'SELECT * FROM users';
    const [rows] = await pool.query(sql);
    return Promise.all(rows.map(async row => {
      const { street, city, state, country, zip_code, ...userData } = row;
      const businesses_roles = await this.findUserBusinessesAndRoles(row.uuid);
      return {
        ...userData,
        address: { street, city, state, country, zip_code },
        businesses_roles
      };
    }));
  },

  async update(uuid, fields, updatedBy) {
    const { address, ...otherFields } = fields;
    const allowedFields = ['first_name', 'last_name', 'email', 'password', 'phone', 'dni', 'avatar_url'];
    
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

    const sql = `UPDATE users SET ${setClause} WHERE uuid = ?`;
    const [result] = await pool.query(sql, [...values, uuid]);
    return result;
  },

  async delete(uuid) {
    const sql = 'DELETE FROM users WHERE uuid = ?';
    const [result] = await pool.query(sql, [uuid]);
    return result;
  },

  async findUserBusinessesAndRoles(userUuid) {
    const sql = `
      SELECT
        b.*,
        r.name as role_name
      FROM business_users bu
      JOIN businesses b ON bu.business_uuid = b.uuid
      JOIN roles r ON bu.role_uuid = r.uuid
      WHERE bu.user_uuid = ?
    `;
    const [rows] = await pool.query(sql, [userUuid]);

    return rows.map(row => {
      const { street, city, state, country, zip_code, role_name, ...businessData } = row;
      return {
        ...businessData,
        address: { street, city, state, country, zip_code },
        role: role_name
      };
    });
  }
};
