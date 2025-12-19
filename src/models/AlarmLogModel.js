import BaseModel from './BaseModel.js';
import { pool } from '../config/database.js';

const allowedFields = [
  'business_uuid',
  'alarm_uuid',
  'user_uuid',
  'channel_uuid',
  'triggered_at',
  'seen_at',
  'triggered',
  'email_sent',
  'message',
];

export const AlarmLogModel = BaseModel('alarm_logs', allowedFields);

AlarmLogModel.findAllByBusinessUuid = async function(businessUuid) {
      
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
        ) AS business,
        JSON_OBJECT(
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email
        ) AS user
      FROM ${this.tableName} t
      LEFT JOIN businesses b ON t.business_uuid = b.uuid
      LEFT JOIN users u ON t.user_uuid = u.uuid
      WHERE t.business_uuid = ?
    `;
    const [rows] = await pool.query(sql, [businessUuid]);

    return rows.map(row => {
      if (typeof row.business === 'string') {        
        row.business = JSON.parse(row.business);        
      }      
      if (row.business && row.business.uuid === null) {
        row.business = null;
      }
      if (typeof row.user === 'string') {
        row.user = JSON.parse(row.user);
      }
      if (row.user && row.user.first_name === null) {
        row.user = null;
      }
      return row;
    });
  };
