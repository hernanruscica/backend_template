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
            -- 1. Porcentaje promedio (Correcto como lo tenías)
            TRUNCATE(AVG(
                (${cleanColumnName} / NULLIF(tiempo_total, 0)) * 100
            ), 2) as average_usage_percentage,

            -- 2. CORREGIDO: Tiempo total encendido estimado (en HORAS)
            -- Hacemos (Horas Totales * Promedio) y AL FINAL truncamos a 2 decimales
            TRUNCATE(
              (TIMESTAMPDIFF(SECOND, MIN(fecha), MAX(fecha)) / 3600.0) * AVG(${cleanColumnName} / NULLIF(tiempo_total, 0)), 
              0
            ) as total_time_on_hours,

            -- 3. Totales informativos
            COUNT(*) as registers_quantity,
            MIN(fecha) as first_date,
            MAX(fecha) as last_date

          FROM ${cleanTableName};
      `;
                          
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
        SELECT dataloggers.table_name, channels.column_name, channels.name, channels.averaging_period
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

    //Enero 2026: devuelve todos los datos por 5 minutos promediados para atras (rollingAverage) por averagingPeriod, dentro de un intervalo de tiempo
    findRollingAverageData: async (tableName, columnPrefix, averagingPeriod, startInterval, stopInterval) => {
    
        const averagingPeriodSeconds = averagingPeriod * 60;       
        const tableNameClean = poolData.escapeId(tableName);
        const columnNameClean = poolData.escapeId(`${columnPrefix}_tiempo`);

        // --- CORRECCIÓN DE FECHAS ---
        // Quitamos comillas si vienen en el string (ej: "'2025-12-01'" -> "2025-12-01")
        let start = startInterval.replace(/['"]/g, ''); 
        let stop = stopInterval.replace(/['"]/g, '');

        // Aseguramos que el FINAL incluya todo el día hasta el último segundo
        // Si el string es corto (ej: "2025-12-31"), le pegamos la hora final.
        if (stop.length <= 10) {
            stop = `${stop} 23:59:59`;
        }
        // -----------------------------

        const query = `
          SELECT 
              CONVERT_TZ(fecha, '+00:00', '${process.env.UTC_LOCAL}') AS fecha,\
              identificador,            
              ROUND(
                  (
                      SUM(${columnNameClean}) OVER w / 
                      NULLIF(SUM(tiempo_total) OVER w, 0)
                  ) * 100, 
                  2
              ) AS porcentaje_promedio                
          FROM ${tableNameClean}
          
          -- CORRECCIÓN DE LÓGICA SQL:
          -- Usamos >= para incluir el inicio exacto
          -- Usamos <= para incluir el final exacto (ahora que stop tiene hora 23:59:59)
          WHERE (fecha >= '${start}') AND (fecha <= '${stop}')
          
          WINDOW w AS (
              PARTITION BY identificador 
              ORDER BY UNIX_TIMESTAMP(fecha) 
              RANGE BETWEEN ${averagingPeriodSeconds} PRECEDING AND CURRENT ROW
          )
          ORDER BY fecha DESC;
        `;
        
        const [rows] = await poolData.query(query);
        return rows;
    },

    findDailyAverageByPeriod : async (tableName, columnPrefix, startInterval, stopInterval) => {  
      
     
      let start = startInterval.replace(/['"]/g, ''); 
      let stop = stopInterval.replace(/['"]/g, '');
      if (stop.length <= 10) {
          stop = `${stop} 23:59:59`;
      }

      const query = `
        SELECT 
            -- Eje X del gráfico: El día (formato YYYY-MM-DD)
            DATE(fecha) as dia,
            identificador,

            -- Eje Y del gráfico: El porcentaje de uso real del día
            -- Formula: (Total Segundos Encendido / Total Segundos Disponibles) * 100
            ROUND(
                TRUNCATE((SUM(${columnPrefix}_tiempo) / NULLIF(SUM(tiempo_total), 0)) * 100, 2), 
                2
            ) AS porcentaje_uso

        FROM ${tableName}
        
        WHERE (fecha >= '${start}') AND (fecha <= '${stop}')
        
        -- Agrupamos por día para tener 1 punto por día
        GROUP BY DATE(fecha), identificador
        
        -- Ordenamos cronológicamente para que el gráfico se dibuje de izq a der
        ORDER BY dia ASC;
      `;

      try {
          const [rows] = await poolData.query(query);
          return rows;
      } catch (error) {
          console.error("Error obteniendo datos mensuales:", error);
          throw error;
      }
    },

    //ByMonth or MonthS
    findtWeeklyAverageByPeriod : async (tableName, columnPrefix, startInterval, stopInterval) => {
  
      let start = startInterval.replace(/['"]/g, ''); 
      let stop = stopInterval.replace(/['"]/g, '');
      if (stop.length <= 10) {
          stop = `${stop} 23:59:59`;
      }

      const query = `
            WITH datos_diarios AS (
                SELECT 
                    DATE(fecha) as dia,
                    YEARWEEK(fecha, 1) as numero_semana,
                    SUM(${columnPrefix}_tiempo) as suma_tiempo_on,
                    SUM(tiempo_total) as suma_tiempo_total,
                    (SUM(${columnPrefix}_tiempo) / NULLIF(SUM(tiempo_total), 0)) * 100 as porcentaje_dia
                FROM ${tableName}
                
                WHERE (fecha >= '${start}') AND (fecha <= '${stop}')

                GROUP BY DATE(fecha), identificador
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