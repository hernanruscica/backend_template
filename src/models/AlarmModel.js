import BaseModel from './BaseModel.js';

const allowedFields = [
    'channel_uuid',
    'business_uuid',
    'table_name',
    'column_name',
    'name',
    'description',
    'time_range',
    'is_active',
    'condition_logic',
    'condition_show',
    'triggered',
    'alarm_type',
    'var01',
    'var02',
    'var03',
    'var04',
    'var05',
    'var06'
];

const AlarmModel = BaseModel('alarms', allowedFields);
export default AlarmModel;
