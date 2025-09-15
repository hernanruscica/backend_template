import BaseModel from './BaseModel.js';

const allowedFields = [
  'name',
  'description',
  'alarms_logs_id',
  'user_id',
  'is_active',
];

export const SolutionModel = BaseModel('solutions', allowedFields);
