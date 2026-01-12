import BaseModel from './BaseModel.js';
import { pool } from '../config/database.js';

const allowedFields = [
  'business_uuid',
  'alarm_uuid',
  'user_uuid',
  'event_uuid',
  'datalogger_uuid',
  'channel_uuid',
  'triggered_at',
  'seen_at',
  'triggered',
  'triggered_value',
  'email_sent',
  'message',
];

const findLogsByAlarmUuid = async (businessUuid, alarmUuid) => {
  // Aseguramos un default por si la variable de entorno no existe
  const timeZoneOffset = process.env.UTC_LOCAL || '-03:00'; 

  const query = `
        SELECT 
            al.event_uuid,
            
            -- CORRECCIÓN 1: Envolver estos campos en MAX para evitar error 'ONLY_FULL_GROUP_BY'
            -- (Como son iguales para todo el evento, MAX nos da el valor correcto)
            MAX(al.triggered) as triggered,
            MAX(al.message) as message,
            MAX(al.email_sent) as email_sent,
            MAX(al.triggered_value) as triggered_value,
            MAX(al.datalogger_uuid) as datalogger_uuid,
            
            -- CORRECCIÓN 2: Quitamos el doble MAX. Primero obtenemos la fecha más reciente y luego convertimos.
            CONVERT_TZ(MAX(al.triggered_at), '+00:00', '${timeZoneOffset}') as triggered_at,             
            
            a.alarm_type, 
            
            -- Array de usuarios
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'email', u.email, 
                    'first_name', u.first_name,
                    'last_name', u.last_name,
                    'seen_at', al.seen_at
                )
            ) as notified_users,

            -- Array de soluciones
            COALESCE(MAX(sol_grouped.solutions_json), JSON_ARRAY()) as solutions

        FROM ${AlarmLogGenericModel.tableName} al
        JOIN users u ON al.user_uuid = u.uuid
        JOIN alarms a ON al.alarm_uuid = a.uuid
        
        -- Pre-calculo de soluciones
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
        
        GROUP BY al.event_uuid, a.alarm_type 
        
        ORDER BY triggered_at DESC
    `;

    const [rows] = await pool.execute(query, [alarmUuid]);
    
    return rows.map(row => ({
        ...row,
        notified_users: typeof row.notified_users === 'string' ? JSON.parse(row.notified_users) : (row.notified_users || []),
        solutions: typeof row.solutions === 'string' ? JSON.parse(row.solutions) : (row.solutions || [])
    }));
};

const findLogsByDataloggerUuid = async (businessUuid, dataloggerUuid) => {
  // Default de timezone
  const timeZoneOffset = process.env.UTC_LOCAL || '-03:00'; 

  const query = `
        SELECT 
            al.event_uuid,
            
            -- DATOS DEL LOG
            MAX(al.triggered) as triggered,
            MAX(al.message) as message,
            MAX(al.email_sent) as email_sent,
            MAX(al.triggered_value) as triggered_value,
            MAX(al.datalogger_uuid) as datalogger_uuid, -- <--- Ahora lo tomamos directo de alarm_logs
            
            -- DATOS DE LA ALARMA (Solo informativos)
            MAX(a.name) as alarm_name, 
            a.alarm_type, 

            -- FECHA AJUSTADA
            CONVERT_TZ(MAX(al.triggered_at), '+00:00', '${timeZoneOffset}') as triggered_at,             
            
            -- 1. Array de usuarios notificados
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'email', u.email, 
                    'first_name', u.first_name,
                    'last_name', u.last_name,
                    'seen_at', al.seen_at
                )
            ) as notified_users,

            -- 2. Array de soluciones (Pre-calculado)
            COALESCE(MAX(sol_grouped.solutions_json), JSON_ARRAY()) as solutions

        FROM ${AlarmLogGenericModel.tableName} al
        JOIN users u ON al.user_uuid = u.uuid
        JOIN alarms a ON al.alarm_uuid = a.uuid 
        
        -- PRE-CALCULO DE SOLUCIONES
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

        -- FILTRO: Usamos la columna directa de alarm_logs
        WHERE al.datalogger_uuid = ? AND al.triggered = true 
        
        -- AGRUPAMIENTO
        GROUP BY al.event_uuid, a.alarm_type 
        
        ORDER BY triggered_at DESC
    `;

    const [rows] = await pool.execute(query, [dataloggerUuid]);
    
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
  findLogsByDataloggerUuid
};

AlarmLogModel.findAllByBusinessUuid = async function(businessUuid) {
    const timeZoneOffset = process.env.UTC_LOCAL || '-03:00';

    const sql = `
      SELECT
        t.event_uuid,
        
        -- Datos del evento (Usamos MAX para cumplir con ONLY_FULL_GROUP_BY)
        MAX(t.triggered) as triggered,
        MAX(t.message) as message,
        MAX(t.email_sent) as email_sent,
        MAX(t.triggered_value) as triggered_value,
        MAX(t.datalogger_uuid) as datalogger_uuid,
        
        -- Corrección de fecha
        CONVERT_TZ(MAX(t.triggered_at), '+00:00', '${timeZoneOffset}') as triggered_at,       
        
        -- Objeto Alarma (Agrupamos por a.uuid abajo)
        JSON_OBJECT(
          'uuid', a.uuid,
          'name', a.name,
          'description', a.description,
          'alarm_type', a.alarm_type, -- Agregué esto que suele ser útil
          'created_at', a.created_at
        ) AS alarm,

        -- Objeto Negocio
        JSON_OBJECT(
          'uuid', b.uuid,
          'name', b.name,
          'email', b.email,
          'logo_url', b.logo_url,
          'city', b.city
          -- Puedes agregar el resto de campos si son estrictamente necesarios
        ) AS business,

        -- LISTA DE USUARIOS (Importante: Array, no objeto único)
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'first_name', u.first_name,
            'last_name', u.last_name,
            'email', u.email,
            'seen_at', t.seen_at
          )
        ) AS users

      FROM ${this.tableName} t
      LEFT JOIN businesses b ON t.business_uuid = b.uuid
      LEFT JOIN users u ON t.user_uuid = u.uuid
      INNER JOIN alarms a ON t.alarm_uuid = a.uuid
      
      WHERE t.business_uuid = ?
      
      -- GRUPO NECESARIO PARA AGREGACIÓN
      GROUP BY t.event_uuid, a.uuid, b.uuid
      
      ORDER BY triggered_at DESC
    `;

    const [rows] = await pool.query(sql, [businessUuid]);

    return rows.map(row => {
      // Parseo seguro de JSONs
      const parseJson = (str) => {
          if (!str) return null;
          if (typeof str === 'object') return str;
          try { return JSON.parse(str); } catch (e) { return null; }
      };

      return {
          ...row,
          business: parseJson(row.business),
          alarm: parseJson(row.alarm),
          users: parseJson(row.users) || [] // Ahora devuelve un array de usuarios
      };
    });
};


