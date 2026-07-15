import BaseModel from './BaseModel.js';
import { pool } from '../config/database.js';
import { BusinessModel } from './businessModel.js';

const allowedFields = [
  'name',
  'description',
  'mac_address',
  'img',
  'table_name',
  'business_uuid',
  'is_active',
];

const BaseModelInstance = BaseModel('dataloggers', allowedFields);

const DataloggerModel = {
  ...BaseModelInstance,

  findByUuidDirect: async (uuid) => {
    const sql = `
      SELECT t.*, JSON_OBJECT(
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
      FROM dataloggers t
      LEFT JOIN businesses b ON t.business_uuid = b.uuid
      WHERE t.uuid = ?
    `;
    const [rows] = await pool.query(sql, [uuid]);
    if (rows.length === 0) return null;
    const row = rows[0];
    if (typeof row.business === 'string') {
      row.business = JSON.parse(row.business);
    }
    if (row.business && row.business.uuid === null) {
      row.business = null;
    }
    return row;
  }
};

export default DataloggerModel;
