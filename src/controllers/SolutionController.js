import BaseController from './BaseController.js';
import { SolutionService } from '../services/SolutionService.js';
import catchAsync from '../utils/catchAsync.js';

const genericController = BaseController(SolutionService);

const create = catchAsync(async (req, res, next) => {
  const item = await SolutionService.create(req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Solution created successfully',
    item,
  });
});

const getByAlarmLogsId = catchAsync(async (req, res, next) => { 
  const { businessUuid, alarmLogsId } = req.params;
  const items = await SolutionService.getByAlarmLogsId(req.user, businessUuid, alarmLogsId);

  res.status(200).json({
    success: true,
    count: items.length,
    items,
  });
});

export const SolutionController = {
  ...genericController,
  create,
  getByAlarmLogsId,
};
