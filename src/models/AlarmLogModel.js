import BaseModel from './BaseModel.js';
import { pool } from '../config/database.js';

const allowedFields = [
  'business_uuid',
  'alarm_uuid',
  'user_uuid',
  'event_uuid',
  'channel_uuid',
  'triggered_at',
  'seen_at',
  'triggered',
  'triggered_value',
  'email_sent',
  'message',
];

const findLogsByAlarmUuid = async (businessUuid, alarmUuid) => {
  const query = `
        SELECT 
            al.event_uuid,
            al.triggered,
            al.message,
            al.email_sent,
            MAX(al.triggered_at) as triggered_at,
            al.triggered_value,
            
            -- 1. Array de usuarios (Agregación directa)
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'email', u.email, 
                    'first_name', u.first_name,
                    'last_name', u.last_name,
                    'seen_at', al.seen_at
                )
            ) as notified_users,

            -- 2. Array de soluciones (Viene del LEFT JOIN de abajo)
            -- Usamos COALESCE para que si es null devuelva '[]'
            -- Usamos MAX() truco para evitar errores de 'ONLY_FULL_GROUP_BY', 
            -- aunque el valor es único por evento.
            COALESCE(MAX(sol_grouped.solutions_json), JSON_ARRAY()) as solutions

        FROM ${AlarmLogGenericModel.tableName} al
        JOIN users u ON al.user_uuid = u.uuid
        
        -- AQUÍ ESTÁ LA MAGIA: Pre-calculamos las soluciones por evento
        LEFT JOIN (
            SELECT 
                s.event_uuid,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'title', s.name, 
                        'solver', us.email,
                        'description', s.description, 
                        'created_at', s.created_at
                    )
                ) as solutions_json
            FROM solutions s
            JOIN users us ON s.user_id = us.uuid
            GROUP BY s.event_uuid
        ) sol_grouped ON al.event_uuid = sol_grouped.event_uuid

        WHERE al.alarm_uuid = ? AND al.triggered = true 
        GROUP BY al.event_uuid
        ORDER BY triggered_at DESC
    `;

    // Solo pasamos alarmUuid ya que quitaste businessUuid del WHERE
    const [rows] = await pool.execute(query, [alarmUuid]);
    
    return rows.map(row => ({
        ...row,
        notified_users: typeof row.notified_users === 'string' ? JSON.parse(row.notified_users) : (row.notified_users || []),
        solutions: typeof row.solutions === 'string' ? JSON.parse(row.solutions) : (row.solutions || [])
    }));
};

const AlarmLogGenericModel = BaseModel('alarm_logs', allowedFields);

export const AlarmLogModel = {
  ...AlarmLogGenericModel,
  findLogsByAlarmUuid,
};

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


