import BaseModel from './BaseModel.js';
import {pool} from '../config/database.js';
//import ChannelModel from './ChannelModel.js';
import DataloggerModel from './DataloggerModel.js';

const allowedFields = [
    'channel_uuid',
    'business_uuid',
    'datalogger_uuid',    
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

const AlarmModel = {
  ...BaseModel('alarms', allowedFields),

  async findAllByBusinessUuid(business_uuid) {
    const alarms = await BaseModel('alarms', allowedFields).findAllByBusinessUuid(business_uuid);

    const alarmsWithDatalogger = await Promise.all(alarms.map(async (alarm) => {
      if (!alarm.channel_uuid) {
        return { ...alarm, datalogger: null };
      }

      const [channelRows] = await pool.query(
        `SELECT datalogger_id FROM channels WHERE uuid = ?`,
        [alarm.channel_uuid]
      );

      if (channelRows.length === 0) {
        return { ...alarm, datalogger: null };
      }

      const dataloggerUuid = channelRows[0].datalogger_id;
      const datalogger = await DataloggerModel.findByUuid(dataloggerUuid);

      return { ...alarm, datalogger };
    }));

    return alarmsWithDatalogger;
  },
  async findAllActive() {
    const alarms = await this.findAll();
    const activeAlarms = alarms.filter(al => al.is_active == true);
    return activeAlarms || [];
  },
  async findAllByUserUuid(businessUuid, userUuid) {
    const [rows] = await pool.query(
      `SELECT a.* FROM alarms a
       JOIN users_alarms ua ON a.uuid = ua.alarm_uuid
       WHERE ua.user_uuid = ? AND a.business_uuid = ?`,
      [userUuid, businessUuid]
    );
    return rows;
  }
};

export default AlarmModel;
