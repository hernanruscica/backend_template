import pool from '../config/database.js';
import { randomUUID } from 'crypto';
import CustomError from '../utils/customError.js';
import { BusinessModel } from './businessModel.js';

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
    const allItems = await this.findAll();
    const item = allItems.find(item => item.uuid === uuid);
    return item;
  },

  async findAll() {
    // NOTE: This implementation assumes the table has a 'business_uuid' column.
    const sql = `
      SELECT
        t.*,
        JSON_OBJECT(
          'uuid', b.uuid,
          'name', b.name,
          'description', b.description,
          'email', b.email,
          'phone', b.phone,
          'logo_url', b.logo_url,
          'street', b.street,
          'city', b.city,
          'state', b.state,
          'country', b.country,
          'zip_code', b.zip_code,
          'is_active', b.is_active,
          'created_at', b.created_at,
          'updated_at', b.updated_at,
          'created_by', b.created_by,
          'updated_by', b.updated_by
        ) AS business
      FROM ${this.tableName} t
      LEFT JOIN businesses b ON t.business_uuid = b.uuid
    `;
    const [rows] = await pool.query(sql);

    return rows.map(row => {
      if (typeof row.business === 'string') {        
        row.business = JSON.parse(row.business);        
      }      
      if (row.business && row.business.uuid === null) {
        row.business = null;
      }      
      return row;
    });
  },

  async findAllByBusinessUuid(businessUuid) {
    const allItems = await this.findAll();
    const itemsForBusiness = allItems.filter(item => item.business_uuid === businessUuid);

    if (itemsForBusiness.length === 0) {
      const business = await BusinessModel.findByUuid(businessUuid);
      if (!business) {
        throw new CustomError('Business not found', 404);
      }
      // If the business exists but has no items, return an empty array.
      // This is a valid scenario.
    }

    return itemsForBusiness;
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
