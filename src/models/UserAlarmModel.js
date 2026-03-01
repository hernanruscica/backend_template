import BaseModel from './BaseModel.js';
import {pool} from '../config/database.js';

const allowedFields = [
    'alarm_uuid',
    'user_uuid',
    'business_uuid'
];

const userAlarmsBaseModel = BaseModel('users_alarms', allowedFields);

const findUsersByAlarmUuid = async (alarmUuid) => {
    //console.log('Buscando usuarios asociados con la alarma con uuid: ', alarmUuid); 
    //SELECT * FROM `users_alarms` WHERE alarm_uuid = 'a1b2c3d4-0001-4a7b-8c9d-0e1f2a3b4c5d'; 
    const query = `
        SELECT  users_alarms.uuid as user_alarm_uuid, 
                users_alarms.alarm_uuid, 
                users_alarms.user_uuid, 
                users_alarms.business_uuid,
                users.first_name, 
                users.last_name, 
                users.dni, 
                users.email, 
                users.phone 
        FROM ${UserAlarmModel.tableName} 
        INNER JOIN users ON users_alarms.user_uuid = users.uuid
        WHERE users_alarms.alarm_uuid = '${alarmUuid}';
    `;
    const [rows] = await pool.query(query);
    //console.log('rows en findUsersByAlarmUuid', rows);
    
    return rows;   
}

const findAlarmsByUserUuid = async (userUuid) => {
    const [rows] = await pool.query(
        `SELECT 
            ua.uuid as user_alarm_uuid,
            ua.alarm_uuid,
            ua.user_uuid,
            ua.business_uuid,
            a.channel_uuid,
            a.datalogger_uuid,
            a.business_uuid,
            a.name,
            a.description,
            a.time_range,
            a.is_active,
            a.condition_logic,
            a.condition_show,
            a.triggered,
            a.alarm_type,
            a.var01,
            a.var02,
            a.var03,
            a.var04,
            a.var05,
            a.var06,
            a.created_at,
            a.updated_at
        FROM users_alarms ua
        JOIN alarms a ON ua.alarm_uuid = a.uuid
        WHERE ua.user_uuid = ?`,
        [userUuid]
    );
    return rows;
}

const findAlarmsByUserUuidInBusinesses = async (userUuid, businessUuids) => {
    if (!businessUuids || businessUuids.length === 0) {
        return [];
    }
    const placeholders = businessUuids.map(() => '?').join(',');
    const [rows] = await pool.query(
        `SELECT 
            ua.uuid as user_alarm_uuid,
            ua.alarm_uuid,
            ua.user_uuid,
            ua.business_uuid,
            a.channel_uuid,
            a.datalogger_uuid,
            a.business_uuid,
            a.name,
            a.description,
            a.time_range,
            a.is_active,
            a.condition_logic,
            a.condition_show,
            a.triggered,
            a.alarm_type,
            a.var01,
            a.var02,
            a.var03,
            a.var04,
            a.var05,
            a.var06,
            a.created_at,
            a.updated_at
        FROM users_alarms ua
        JOIN alarms a ON ua.alarm_uuid = a.uuid
        WHERE ua.user_uuid = ? AND ua.business_uuid IN (${placeholders})`,
        [userUuid, ...businessUuids]
    );
    return rows;
}

const findBusinessesByUserUuid = async (userUuid) => {
    const [rows] = await pool.query(
        `SELECT DISTINCT business_uuid FROM users_alarms WHERE user_uuid = ?`,
        [userUuid]
    );
    return rows;
}

const UserAlarmModel = {
    ...userAlarmsBaseModel,
    findUsersByAlarmUuid,
    findAlarmsByUserUuid,
    findAlarmsByUserUuidInBusinesses,
    findBusinessesByUserUuid
}


export default UserAlarmModel;
