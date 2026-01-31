import BaseModel from './BaseModel.js';
//import {pool} from '../config/database.js';

const allowedFields = [    
    'user_uuid',
    'business_uuid',
    'role_uuid'
];

const UserBusinessModel = BaseModel('business_users', allowedFields);
/*
const findUsersByAlarmUuid = async (alarmUuid) => {
    console.log('Buscando usuarios asociados con la alarma con uuid: ', alarmUuid); 
    //SELECT * FROM `users_alarms` WHERE alarm_uuid = 'a1b2c3d4-0001-4a7b-8c9d-0e1f2a3b4c5d'; 
    const query = `
        SELECT users_alarms.alarm_uuid, users_alarms.user_uuid, users_alarms.business_uuid,
        users.first_name, users.last_name, users.dni, users.email 
        FROM ${UserAlarmModel.tableName} 
        INNER JOIN users ON users_alarms.user_uuid = users.uuid
        WHERE users_alarms.alarm_uuid = '${alarmUuid}';
    `;
    const [rows] = await pool.query(query);
    //console.log('rows en findUsersByAlarmUuid', rows);
    
    return rows;   
}

const UserBusinessModel = {
    ...UserBusinessBaseModel,
    findUsersByAlarmUuid
}
*/

export default UserBusinessModel;
