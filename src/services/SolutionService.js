import BaseService from './baseService.js';
import {SolutionModel}  from '../models/SolutionModel.js';

const genericService = BaseService(SolutionModel);

const create = async (data, user) => {
  // In a real application, you would add permission logic here.
  return SolutionModel.create(data, user.uuid);
};

const getAll = async (user) => {  
  return SolutionModel.findAll();
};

const getByAlarmLogsId = async (user, businessUuid, alarmLogsId) => {
  const allSolutions =  await SolutionModel.findAllByAlarmLogsId(businessUuid, alarmLogsId);  
  //const allSolutions =  await SolutionModel.findAllByBusinessUuid(businessUuid, alarmLogsId);
  //const response = allSolutions.filter(solution => solution.alarms_logs_id === alarmLogsId);
  
  return allSolutions;
};

export const SolutionService = {
  ...genericService,
  create,
  getAll,
  getByAlarmLogsId
};
