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
  // Calculamos la fecha de corte UNA sola vez
  // Nota: Asumo que tus datos en BD están en UTC-3. Si están en UTC, ajusta los timezone.
  const dateThresholdSql = `DATE_SUB(CONVERT_TZ(NOW(), '+00:00', '-03:00'), INTERVAL ${timePeriod} MINUTE)`;

  const queryString = `
          SELECT 
            -- Sumamos todo el tiempo disponible en ese periodo
            COALESCE(SUM(tiempo_total), 0) as total_time_period, 
            
            -- Sumamos todo el tiempo que estuvo encendido
            COALESCE(SUM(${columnPrefix}_tiempo), 0) as total_time_on,

            -- Opcional: Contamos registros para saber si hubo datos
            COUNT(*) as registers_quantity
          FROM ${tableName}
          WHERE fecha >= ${dateThresholdSql}
      `;      
      const [rows] = await poolData.query(queryString);      
      
      // MySQL siempre devuelve un array, pero como es una agregación, 
      // siempre vendrá 1 sola fila (o fila con ceros si usamos COALESCE)
      const result = rows[0];     
      
      return result; 
    },
    
    findTotalOnTimeFromColumn: async (tableName, columnName) => {
      const queryString = `SELECT 
                          CONVERT_TZ(min(fecha), '+00:00', '${process.env.UTC_LOCAL}') AS fecha_inicio,\
                          CONVERT_TZ(max(fecha), '+00:00', '${process.env.UTC_LOCAL}') AS fecha_final,\
                          DATEDIFF(max(fecha), min(fecha)) AS dias_uso,\
                          SUM(${columnName}_tiempo) / 60 / 60 AS horas_uso\
                          FROM ${tableName};`;
                          
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
      const queryString = `SELECT CONVERT_TZ(fecha, '+00:00', '${process.env.UTC_LOCAL}') AS data FROM ${tableClean} ORDER BY fecha DESC LIMIT 1;`
     
      const [rows] = await poolData.query(queryString);
      return rows;
    }

    
}
export default dataModel;