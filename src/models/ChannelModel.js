import BaseModel from './BaseModel.js';

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

const ChannelModel = BaseModel('channels', allowedFields);
export default ChannelModel;
