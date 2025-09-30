import BaseModel from './BaseModel.js';

const allowedFields = [
    'alarm_uuid',
    'user_uuid',
    'business_uuid'
];

const UserAlarmModel = BaseModel('users_alarms', allowedFields);
export default UserAlarmModel;
