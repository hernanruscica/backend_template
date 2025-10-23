import {poolData} from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const dataModel = {
    findAllByTimePeriod: async (table, timePeriod) => {
        const queryString = `SELECT * FROM ${table} WHERE fecha >= DATE_SUB(NOW(), INTERVAL ${timePeriod} MINUTE) AND fecha <= NOW() ORDER BY fecha DESC;`;
        const [rows] = await poolData.query(queryString);    
        return rows;
      },
    findDataFromDigitalChannel: async (tableName, columnPrefix, timePeriod) => {
      const queryString = `SELECT 
                          CONVERT_TZ(fecha, '+00:00', '${process.env.UTC_LOCAL}') AS fecha,\
                          tiempo_total,\ 
                          ${columnPrefix}_tiempo as tiempo_encendido,\ 
	                        ${columnPrefix}_cantidad as cantidad,\
                          ${columnPrefix}_estado as estado,\
                          servicio, energia, texto\
                          FROM ${tableName}
                          WHERE fecha >= DATE_SUB(NOW(), INTERVAL ${timePeriod} MINUTE) AND fecha <= NOW()
                          ORDER BY fecha ASC;`;
      const [rows] = await poolData.query(queryString);    
      return rows;
    },
    findLastDataFromTable: async (tableName) => {
      const queryString = `SELECT 
                          CONVERT_TZ(fecha, '+00:00', '${process.env.UTC_LOCAL}') AS fecha,\
                          tiempo_total,\                           
                          servicio, energia, texto\
                          FROM ${tableName}\                          
                          ORDER BY fecha DESC LIMIT 1;`;
      const [rows] = await poolData.query(queryString);    
      return rows;
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
    }
}
export default dataModel;