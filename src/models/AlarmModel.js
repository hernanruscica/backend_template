import BaseModel from './BaseModel.js';
import {pool} from '../config/database.js';
import ChannelModel from './ChannelModel.js';
import DataloggerModel from './DataloggerModel.js';

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

const AlarmModel = {
  ...BaseModel('alarms', allowedFields),

  async findAll() {
    const alarms = await BaseModel('alarms', allowedFields).findAll();

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
};

export default AlarmModel;
