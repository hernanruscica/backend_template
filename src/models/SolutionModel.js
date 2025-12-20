import BaseModel from './BaseModel.js';
import { pool } from '../config/database.js';

const allowedFields = [
  'name',
  'description',
  'alarms_logs_id',
  'user_id',
  'is_active',
  'business_uuid',  
];

const SolutionModelBase = BaseModel('solutions', allowedFields);

const findAllByAlarmLogsId = async (businessUuid, alarmLogsId) => {
  const sql = `
    SELECT
        t.*,
        -- Objeto Business existente
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
        -- Nuevo objeto User solicitado
        JSON_OBJECT(
          'uuid', u.uuid,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email
        ) AS user
      FROM ${SolutionModelBase.tableName} t
      LEFT JOIN businesses b ON t.business_uuid = b.uuid
      LEFT JOIN users u ON t.user_id = u.uuid
      WHERE t.business_uuid = ? AND t.alarms_logs_id = ?
      ORDER BY t.created_at DESC
    `;

    // Pasamos los parámetros businessUuid y alarmLogsId al query
    const [rows] = await pool.query(sql, [businessUuid, alarmLogsId]);

    return rows.map(row => {
      // Parsing de Business
      if (typeof row.business === 'string') {        
        row.business = JSON.parse(row.business);        
      }      
      if (row.business && row.business.uuid === null) {
        row.business = null;
      }

      // Parsing de User (Nueva lógica)
      if (typeof row.user === 'string') {        
        row.user = JSON.parse(row.user);        
      }
      // Manejo de nulos para User (si no hay match en el LEFT JOIN)
      if (row.user && row.user.uuid === null) {
        row.user = null;
      }
      
      return row;
    });
  };

export const SolutionModel = { 
  ...SolutionModelBase, 
  findAllByAlarmLogsId 
};