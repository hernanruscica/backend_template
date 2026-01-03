import BaseModel from './BaseModel.js';
import { pool } from '../config/database.js';

const allowedFields = [
  'name',
  'description',
  'datalogger_id',
  'column_name',
  'averaging_period',
  'factor',
  'img',
  'business_uuid',
  'is_active',
];

const GenericChannelModel = BaseModel('channels', allowedFields);

const findAll = async () => {  
    const sql = `
      SELECT
        t.*,
        -- Objeto Business (existente)
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
        
        -- Objeto Datalogger (NUEVO)
        -- Ajusta estos campos según las columnas reales de tu tabla 'dataloggers'
        JSON_OBJECT(          
          'uuid', d.uuid,
          'name', d.name,
          'description', d.description,
          'mac_address', d.mac_address, 
          'img', d.img,
          'is_active', d.is_active,
          'created_at', d.created_at,
          'table_name', d.table_name
        ) AS datalogger

      FROM ${GenericChannelModel.tableName} t
      LEFT JOIN businesses b ON t.business_uuid = b.uuid
      LEFT JOIN dataloggers d ON t.datalogger_id = d.uuid
    `;

    const [rows] = await pool.query(sql);

    return rows.map(row => {
      // 1. Procesar Business
      if (typeof row.business === 'string') {        
        row.business = JSON.parse(row.business);        
      }      
      // Si el ID es nulo, significa que el LEFT JOIN no encontró nada, devolvemos null
      if (row.business && row.business.uuid === null) {
        row.business = null;
      }

      // 2. Procesar Datalogger (NUEVO)
      if (typeof row.datalogger === 'string') {
        row.datalogger = JSON.parse(row.datalogger);
      }
      // Verificamos si el join trajo datos reales o un objeto lleno de nulls
      if (row.datalogger && row.datalogger.uuid === null) {
        row.datalogger = null;
      }

      return row;
    });
}

const ChannelModel = {
  ...GenericChannelModel,
  findAll
}
export default ChannelModel;
