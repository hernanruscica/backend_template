import {pool, poolData} from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const dataModel = {
    findAllByTimePeriod: async (table, timePeriod) => {
        const queryString = `SELECT * FROM ${table} WHERE fecha >= DATE_SUB(NOW(), INTERVAL ${timePeriod} MINUTE) AND fecha <= NOW() ORDER BY fecha DESC;`;
        const [rows] = await poolData.query(queryString);    
        return rows;
      },
findLastDataFromChannel: async (tableName, columnPrefix, timePeriod) => {

  // Definimos el filtro de fecha una vez para reutilizarlo
  const dateThresholdSql = `DATE_SUB(CONVERT_TZ(NOW(), '+00:00', '-03:00'), INTERVAL ${timePeriod} MINUTE)`;

  const queryString = `
      SELECT 
        -- 1. Agregaciones (Sumas del periodo completo)
        COALESCE(SUM(tiempo_total), 0) as total_time_period, 
        COALESCE(SUM(${columnPrefix}_tiempo), 0) as total_time_on,
        COUNT(*) as registers_quantity,

        -- 2. Datos del último registro (Subconsultas con LIMIT 1)
        (SELECT tiempo_total 
         FROM ${tableName} 
         WHERE fecha >= ${dateThresholdSql} 
         ORDER BY fecha DESC LIMIT 1
        ) as last_record_total,

        (SELECT ${columnPrefix}_tiempo 
         FROM ${tableName} 
         WHERE fecha >= ${dateThresholdSql} 
         ORDER BY fecha DESC LIMIT 1
        ) as last_record_on

      FROM ${tableName}
      WHERE fecha >= ${dateThresholdSql}
  `;
  
  const [rows] = await poolData.query(queryString);      
  
  // Si no hubo registros en el periodo, last_record_total vendrá como NULL.
  // Puedes manejarlo aquí si prefieres ceros:
  const result = rows[0];
  
  /* Opcional: convertir nulls a 0 si prefieres
  if (result.last_record_total === null) result.last_record_total = 0;
  if (result.last_record_on === null) result.last_record_on = 0;
  */
  
  return result; 
},
    
    findTotalOnTimeFromChannel: async (tableName, columnPrefix) => {
      const cleanTableName = poolData.escapeId(tableName);
      const fullColumnName = `${columnPrefix}_tiempo`;
      const cleanColumnName = poolData.escapeId(fullColumnName);
      const queryString = `
        SELECT 
            -- Sumas (lo que ya tenías)
            COALESCE(SUM(tiempo_total), 0) as total_time_period, 
            COALESCE(SUM(${cleanColumnName}), 0) as total_time_on,
            COUNT(*) as registers_quantity,

            -- FECHA DE INICIO (El registro más antiguo)
            MIN(fecha) as first_date,

            -- (Opcional) FECHA FINAL (El registro más nuevo)            
            -- MAX(fecha) as last_date
            MAX(CONVERT_TZ(fecha, '+00:00', '${process.env.UTC_LOCAL}')) AS last_date

        FROM ${cleanTableName};`;
                          
      const [rows] = await poolData.query(queryString);    
      return rows;
    },
    findDataFromAnalogChannel: async (tableName, columnPrefix, timePeriod) => {
      const queryString = `SELECT 
                          CONVERT_TZ(fecha, '+00:00', '${process.env.UTC_LOCAL}') AS fecha,\
                          tiempo_total,\ 
                          ${columnPrefix}_tiempo as tiempo_encendido,\ 
	                        ${columnPrefix}_cantidad as cantidad,\
                          ${columnPrefix}_estado as estado,\
                          ${columnPrefix}_min as min,\
                          ${columnPrefix}_inst as inst,\
                          ${columnPrefix}_max as max,\
                          servicio, energia, texto\
                          FROM ${tableName}
                          WHERE fecha >= DATE_SUB(NOW(), INTERVAL ${timePeriod} MINUTE) AND fecha <= NOW()
                          ORDER BY fecha ASC;`;
      const [rows] = await poolData.query(queryString);    
      return rows;
    },
    findChannelBasicData: async (channelUuid) => {
      const queryString = `
        SELECT dataloggers.table_name, channels.column_name, channels.name
        FROM channels
        INNER JOIN dataloggers ON channels.datalogger_id = dataloggers.uuid
        WHERE channels.uuid = ?;
      `;
      
      // Se pasa channelUuid como un elemento en un array para que el driver lo escape automáticamente
      const [rows] = await pool.query(queryString, [channelUuid]);    
      return rows;
    },
    
    //funciona, pero podria probar de traer tambien el texto y energia para ver los cortes de luz.
    findDataloggerLastConection: async (tableName) => {
      const tableClean = poolData.escapeId(tableName);
      //const queryString = `SELECT CONVERT_TZ(fecha, '+00:00', '${process.env.UTC_LOCAL}') AS data FROM ${tableClean} ORDER BY fecha DESC LIMIT 1;`
      const queryString = `SELECT fecha AS data FROM ${tableClean} ORDER BY fecha DESC LIMIT 1;`
     
      const [rows] = await poolData.query(queryString);
      return rows;
    },

    getRollingAverageData : async (tableName, columnPrefix, timePeriodMinutes) => {
      // Convertimos minutos a segundos para la consulta SQL
      const secondsRange = timePeriodMinutes * 60; 

      const query = `
        SELECT 
            fecha,
            identificador,
            (
                SUM(${columnPrefix}_tiempo) OVER w / 
                NULLIF(SUM(tiempo_total) OVER w, 0)
            ) * 100 AS porcentaje_promedio
        FROM ${tableName}
        WHERE fecha >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
        WINDOW w AS (
            PARTITION BY identificador 
            ORDER BY UNIX_TIMESTAMP(fecha) 
            RANGE BETWEEN ${secondsRange} PRECEDING AND CURRENT ROW
        )
        ORDER BY fecha DESC;
      `;

      const [rows] = await poolData.query(query);
      return rows;
    }

    
}
export default dataModel;