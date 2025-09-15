import BaseModel from './BaseModel.js';

const allowedFields = [
  'name',
  'description',
  'mac_address',
  'img',
  'table_name',
  'business_uuid',
  'is_active',
];

const DataloggerModel = BaseModel('dataloggers', allowedFields);
export default DataloggerModel;
