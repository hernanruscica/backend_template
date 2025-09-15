import BaseController from './BaseController.js';
import { ChannelService } from '../services/ChannelService.js';
import catchAsync from '../utils/catchAsync.js';

const genericController = BaseController(ChannelService);

const create = catchAsync(async (req, res, next) => {
  const item = await ChannelService.create(req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Channel created successfully',
    item,
  });
});

export const channelController = {
  ...genericController,
  create,
};
