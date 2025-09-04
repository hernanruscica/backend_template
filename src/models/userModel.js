import pool from '../config/database.js';
import { randomUUID } from 'crypto';
import CustomError from '../utils/customError.js';

export const UserModel = {
  async create({ firstName, lastName, email, password, phone, dni, avatarUrl, address, createdBy }) {
    const { street, city, state, country, zipCode } = address;
    const uuid = randomUUID();
    const sql = `
      INSERT INTO users (uuid, first_name, last_name, email, password, phone, dni, avatar_url, street, city, state, country, zip_code, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    try {
      await pool.query(sql, [uuid, firstName, lastName, email, password, phone, dni, avatarUrl, street, city, state, country, zipCode, createdBy]);
      const newUser = await this.findByUuid(uuid);
      return newUser;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('email')) {
          throw new CustomError(`The email '${email}' is already in use.`, 409);
        } else if (error.message.includes('dni')) {
          throw new CustomError(`The DNI '${dni}' is already in use.`, 409);
        }
        throw new CustomError('A user with the provided information already exists.', 409);
      }
      throw error;
    }
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

  async findAllByBusinessUuid(businessUuid) {
    const sql = `
      SELECT u.*
      FROM users u
      JOIN business_users bu ON u.uuid = bu.user_uuid
      WHERE bu.business_uuid = ?
    `;
    const [rows] = await pool.query(sql, [businessUuid]);
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
    const { address, is_active, ...otherFields } = fields;
    const allowedFields = ['first_name', 'last_name', 'email', 'password', 'phone', 'dni', 'avatar_url'];
    
    const fieldEntries = Object.entries(otherFields);
    const validFields = fieldEntries.filter(([key]) => allowedFields.includes(key));
    
    let setClause = validFields.map(([key]) => `${key} = ?`).join(', ');
    const values = validFields.map(([, value]) => value);

    if (typeof is_active === 'boolean') {
      if (setClause) {
        setClause += ', ';
      }
      setClause += 'is_active = ?';
      values.push(is_active);
    }

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

  async delete(uuid, updatedBy) {
    const sql = 'UPDATE users SET is_active = false, updated_by = ? WHERE uuid = ?';
    const [result] = await pool.query(sql, [updatedBy, uuid]);
    return result;
  },

  async hardDelete(uuid) {
    const sql = 'DELETE FROM users WHERE uuid = ?';
    try {
      const [result] = await pool.query(sql, [uuid]);
      return result;
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new CustomError('This user cannot be deleted because they are referenced by other records.', 409);
      }
      throw error;
    }
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
  },
  
};
