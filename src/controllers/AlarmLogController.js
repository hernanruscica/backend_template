import BaseController from './BaseController.js';
import { AlarmLogService } from '../services/AlarmLogService.js';
import catchAsync from '../utils/catchAsync.js';

const genericController = BaseController(AlarmLogService);

const create = catchAsync(async (req, res, next) => {
  
  
  // const { businessUuid } = req.params;
  // req.user.businessUuid = businessUuid;
  const item = await AlarmLogService.create(req.body, req.user);

  res.status(201).json({
    success: true,
    message: 'AlarmLog created successfully',
    item,
  });
});

const getByAlarmUuid = catchAsync(async (req, res, next) => { 
  
  const { businessUuid, alarmUuid } = req.params;
  const items = await AlarmLogService.getByAlarmUuid(businessUuid, alarmUuid);

  res.status(200).json({
    success: true,
    count: items.length,
    items,
  });
});

export const AlarmLogController = {
  ...genericController,
  create,
  getByAlarmUuid
};
