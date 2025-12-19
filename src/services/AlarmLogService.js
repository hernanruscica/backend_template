import BaseService from './baseService.js';
import { AlarmLogModel } from '../models/AlarmLogModel.js';

const genericService = BaseService(AlarmLogModel);

const create = async (data, user) => {
  // In a real application, you would add permission logic here.
  return AlarmLogModel.create(data, user.uuid);
};

const getAll = async (user, businessUuid) => {
  // In a real application, you would add permission logic here.
  console.log('businessUuid', businessUuid);
  
  return AlarmLogModel.findAllByBusinessUuid(businessUuid);
};

export const AlarmLogService = {
  ...genericService,
  create,
  getAll,
};
