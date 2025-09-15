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

export const SolutionController = {
  ...genericController,
  create,
};
