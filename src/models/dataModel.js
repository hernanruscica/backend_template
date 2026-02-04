import {pool, poolData} from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const dataModel = {
    findAllByTimePeriod: async (table, timePeriod) => {
        // Nota: NOW() en MySQL depende de la config del server. 
        // Si tu server está en UTC, esto está bien para filtrar "hace X minutos", 
        // pero para visualizar, el front recibirá UTC.
        const queryString = `SELECT * FROM ${table} WHERE fecha >= DATE_SUB(NOW(), INTERVAL ${timePeriod} MINUTE) AND fecha <= NOW() ORDER BY fecha DESC;`;
        const [rows] = await poolData.query(queryString);    
        return rows;
    },

    findLastDataFromChannel: async (tableName, columnPrefix, timePeriod) => {
        // 1. CRITERIO UNIFICADO: Usar variable de entorno o default
        const timeZoneOffset = process.env.UTC_LOCAL;

        // 2. CORREGIDO: Usar timeZoneOffset en lugar de hardcode '-03:00'
        const dateThresholdSql = `DATE_SUB(CONVERT_TZ(NOW(), '+00:00', '${timeZoneOffset}'), INTERVAL ${timePeriod} MINUTE)`;

        const queryString = `
            SELECT 
                -- 1. Agregaciones
                COALESCE(SUM(tiempo_total), 0) as total_time_period, 
                COALESCE(SUM(${columnPrefix}_tiempo), 0) as total_time_on,
                COUNT(*) as registers_quantity,

                -- 2. Fecha del ultimo registro (CONVERTIDA)
                -- CONVERT_TZ(MAX(fecha), '+00:00', '${timeZoneOffset}') as last_record_date,
                MAX(fecha) as last_record_date,

                -- 3. Datos del último registro
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
        return rows[0]; 
    },
    
    findTotalOnTimeFromChannel: async (tableName, columnPrefix) => {
        const timeZoneOffset = process.env.UTC_LOCAL || '-03:00';
        const cleanTableName = poolData.escapeId(tableName);
        const fullColumnName = `${columnPrefix}_tiempo`;
        const cleanColumnName = poolData.escapeId(fullColumnName);

        const queryString = `
            SELECT 
                TRUNCATE(AVG(
                    (${cleanColumnName} / NULLIF(tiempo_total, 0)) * 100
                ), 2) as average_usage_percentage,

                TRUNCATE(
                    (TIMESTAMPDIFF(SECOND, MIN(fecha), MAX(fecha)) / 3600.0) * AVG(${cleanColumnName} / NULLIF(tiempo_total, 0)), 
                    0
                ) as total_time_on_hours,

                COUNT(*) as registers_quantity,
                
                -- 3. CORREGIDO: Convertir también la fecha inicial
                 -- CONVERT_TZ(MIN(fecha), '+00:00', '${timeZoneOffset}') as first_date,
                 -- CONVERT_TZ(MAX(fecha), '+00:00', '${timeZoneOffset}') as last_date,
                MIN(fecha) as first_date,
                MAX(fecha) as last_date

            FROM ${cleanTableName};
        `;
                            
        const [rows] = await poolData.query(queryString);    
        return rows;
    },

    findDataFromAnalogChannel: async (tableName, columnPrefix, timePeriod) => {
        const timeZoneOffset = process.env.UTC_LOCAL || '-03:00';
        
        const queryString = `SELECT 
                            CONVERT_TZ(fecha, '+00:00', '${timeZoneOffset}') AS fecha,
                            tiempo_total,
                            ${columnPrefix}_tiempo as tiempo_encendido,
                            ${columnPrefix}_cantidad as cantidad,
                            ${columnPrefix}_estado as estado,
                            ${columnPrefix}_min as min,
                            ${columnPrefix}_inst as inst,
                            ${columnPrefix}_max as max,
                            servicio, energia, texto
                            FROM ${tableName}
                            WHERE fecha >= DATE_SUB(NOW(), INTERVAL ${timePeriod} MINUTE) AND fecha <= NOW()
                            ORDER BY fecha ASC;`;
        const [rows] = await poolData.query(queryString);    
        return rows;
    },

    findChannelBasicData: async (channelUuid) => {
        // Sin cambios (no maneja fechas)
        const queryString = `
            SELECT dataloggers.table_name, channels.column_name, channels.name, channels.averaging_period
            FROM channels
            INNER JOIN dataloggers ON channels.datalogger_id = dataloggers.uuid
            WHERE channels.uuid = ?;
        `;
        const [rows] = await pool.query(queryString, [channelUuid]);    
        return rows;
    },
    
    findDataloggerLastConection: async (tableName) => {
        const timeZoneOffset = process.env.UTC_LOCAL || '-03:00';
        const tableClean = poolData.escapeId(tableName);       
        
        //const queryString = `SELECT CONVERT_TZ(fecha, '+00:00', '${timeZoneOffset}') AS data FROM ${tableClean} ORDER BY fecha DESC LIMIT 1;`
        const queryString = `SELECT fecha AS data FROM ${tableClean} ORDER BY fecha DESC LIMIT 1;`
        
        const [rows] = await poolData.query(queryString);
        return rows;
    },

    findRollingAverageData: async (tableName, columnPrefix, averagingPeriod, startInterval, stopInterval) => {
        const timeZoneOffset = process.env.UTC_LOCAL || '-03:00';
        const averagingPeriodSeconds = averagingPeriod * 60;       
        const tableNameClean = poolData.escapeId(tableName);
        const columnNameClean = poolData.escapeId(`${columnPrefix}_tiempo`);

        let start = startInterval.replace(/['"]/g, ''); 
        let stop = stopInterval.replace(/['"]/g, '');

        if (stop.length <= 10) {
            stop = `${stop} 23:59:59`;
        }

        const query = `
          WITH RollingData AS (
              SELECT 
                  fecha, 
                  -- CONVERT_TZ(fecha, '+00:00', '${timeZoneOffset}') AS fecha_local, 
                  fecha AS fecha_local, 
                  texto, 
                  energia,            
                  ROUND(
                      (
                          SUM(${columnNameClean}) OVER w / 
                          NULLIF(SUM(tiempo_total) OVER w, 0)
                      ) * 100, 
                      2
                  ) AS porcentaje_promedio                
              FROM ${tableNameClean}
              
              WHERE (fecha >= DATE_SUB('${start}', INTERVAL ${averagingPeriodSeconds} SECOND)) 
                AND (fecha <= '${stop}')
              
              WINDOW w AS (
                  PARTITION BY identificador 
                  ORDER BY UNIX_TIMESTAMP(fecha) 
                  RANGE BETWEEN ${averagingPeriodSeconds} PRECEDING AND CURRENT ROW
              )
          )
          SELECT 
             fecha_local as fecha, 
             texto, 
             energia, 
             porcentaje_promedio
          FROM RollingData
          WHERE fecha >= '${start}' 
          ORDER BY fecha DESC;
        `;
        
        const [rows] = await poolData.query(query);
        return rows;
    },

   findDailyAverageByPeriod : async (tableName, columnPrefix, startInterval, stopInterval) => {        
      const timeZoneOffset = process.env.UTC_LOCAL || '-03:00';
      let start = startInterval.replace(/['"]/g, ''); 
      let stop = stopInterval.replace(/['"]/g, '');
      
      if (stop.length <= 10) {
          stop = `${stop} 23:59:59`;
      }

      const query = `
        SELECT 
            -- CORRECCIÓN CRÍTICA: Convertir a local ANTES de agrupar por fecha
            -- Si no hacemos esto, el GROUP BY agrupa por día UTC (cortando a las 21hs de Arg)
            DATE(CONVERT_TZ(fecha, '+00:00', '${timeZoneOffset}')) as dia,            

            ROUND(
                TRUNCATE((SUM(${columnPrefix}_tiempo) / NULLIF(SUM(tiempo_total), 0)) * 100, 2), 
                2
            ) AS porcentaje_uso,

            COALESCE(SUM(CASE 
                WHEN texto IN ('Fallo en transmision de trama', 'Fallo de conexion con el router') THEN 1 
                ELSE 0 
            END), 0) as conection_failures,

            COALESCE(SUM(CASE 
                WHEN texto = 'Iniciando equipo' THEN 1 
                ELSE 0 
            END), 0) as energy_failures,

            COALESCE(SUM(CASE 
                WHEN energia = 1 THEN 1 
                ELSE 0 
            END), 0) as phase_failures

        FROM ${tableName}
        
        -- Nota: Mantenemos el filtro en UTC si 'start' y 'stop' vienen ajustados al string crudo de la BD
        WHERE (fecha >= '${start}') AND (fecha <= '${stop}')
        
        -- Agrupamos por la fecha CONVERTIDA
        GROUP BY DATE(CONVERT_TZ(fecha, '+00:00', '${timeZoneOffset}'))
        
        ORDER BY dia ASC;
      `;

      try {
          const [rows] = await poolData.query(query);
          return rows;
      } catch (error) {
          console.error("Error obteniendo datos diarios por periodo:", error);
          throw error;
      }
    },

    findtWeeklyAverageByPeriod : async (tableName, columnPrefix, startInterval, stopInterval) => {
      const timeZoneOffset = process.env.UTC_LOCAL || '-03:00';
      let start = startInterval.replace(/['"]/g, ''); 
      let stop = stopInterval.replace(/['"]/g, '');
      if (stop.length <= 10) {
          stop = `${stop} 23:59:59`;
      }

      const query = `
            WITH datos_diarios AS (
                SELECT 
                    -- CORRECCIÓN CRÍTICA: Convertir antes de extraer Día y Semana
                    DATE(CONVERT_TZ(fecha, '+00:00', '${timeZoneOffset}')) as dia,
                    YEARWEEK(CONVERT_TZ(fecha, '+00:00', '${timeZoneOffset}'), 1) as numero_semana,
                    
                    SUM(${columnPrefix}_tiempo) as suma_tiempo_on,
                    SUM(tiempo_total) as suma_tiempo_total,
                    (SUM(${columnPrefix}_tiempo) / NULLIF(SUM(tiempo_total), 0)) * 100 as porcentaje_dia
                FROM ${tableName}
                
                WHERE (fecha >= '${start}') AND (fecha <= '${stop}')

                -- Agrupar por fecha CONVERTIDA
                GROUP BY DATE(CONVERT_TZ(fecha, '+00:00', '${timeZoneOffset}')), identificador
            )

            SELECT 
                numero_semana,
                MIN(dia) as inicio_semana,
                MAX(dia) as fin_semana,
                ROUND((SUM(suma_tiempo_on) / NULLIF(SUM(suma_tiempo_total), 0)) * 100, 2) as porcentaje_semanal,
                ROUND(MAX(porcentaje_dia), 2) as max_dia_porcentaje,
                SUBSTRING_INDEX(GROUP_CONCAT(dia ORDER BY porcentaje_dia DESC SEPARATOR ','), ',', 1) as fecha_del_maximo,
                ROUND(MIN(porcentaje_dia), 2) as min_dia_porcentaje,
                SUBSTRING_INDEX(GROUP_CONCAT(dia ORDER BY porcentaje_dia ASC SEPARATOR ','), ',', 1) as fecha_del_minimo
            FROM datos_diarios
            GROUP BY numero_semana
            ORDER BY inicio_semana ASC;
          `;

          const [rows] = await poolData.query(query);
          return rows;
        }
    
}
export default dataModel;