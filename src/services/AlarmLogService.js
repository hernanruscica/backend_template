import BaseService from './baseService.js';
import { AlarmLogModel } from '../models/AlarmLogModel.js';

const genericService = BaseService(AlarmLogModel);

const create = async (data, user) => {
  // In a real application, you would add permission logic here.
  return AlarmLogModel.create(data, user.uuid);
};

const getAll = async (user, businessUuid) => {
  // In a real application, you would add permission logic here.
  //console.log('businessUuid', businessUuid);
  
  return AlarmLogModel.findAllByBusinessUuid(businessUuid);
};

const getByAlarmUuid = async (user, businessUuid, alarmUuid) => {
  const alarmLogsByBusiness = await AlarmLogModel.findAllByBusinessUuid(businessUuid); 
  
  return alarmLogsByBusiness.filter(log => log.alarm_uuid === alarmUuid);
}

export const AlarmLogService = {
  ...genericService,
  create,
  getAll,
  getByAlarmUuid
};
