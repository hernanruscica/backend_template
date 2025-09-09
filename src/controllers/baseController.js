import catchAsync from '../utils/catchAsync.js';

const BaseController = (service) => ({
  create: catchAsync(async (req, res, next) => {
    const { business_uuid } = req.body;
    const item = await service.create(req.body, business_uuid, req.user);
    res.status(201).json({
      success: true,
      message: `${service.model.tableName.slice(0, -1)} created successfully`,
      item,
    });
  }),

  getAll: catchAsync(async (req, res, next) => {
    const items = await service.getAll(req.user);
    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  }),

  getByUuid: catchAsync(async (req, res, next) => {
    const { uuid } = req.params;
    const item = await service.getByUuid(uuid);
    res.status(200).json({
      success: true,
      item,
    });
  }),

  updateByUuid: catchAsync(async (req, res, next) => {
    const { uuid } = req.params;
    const updatedItem = await service.updateByUuid(uuid, req.body, req.user);
    res.status(200).json({
      success: true,
      message: `${service.model.tableName.slice(0, -1)} updated successfully`,
      item: updatedItem,
    });
  }),

  deleteByUuid: catchAsync(async (req, res, next) => {
    const { uuid } = req.params;
    let response;
    if (req.hardDelete) {
      response = await service.hardDeleteByUuid(uuid, req.user);
    } else {
      response = await service.deleteByUuid(uuid, req.user);
    }
    res.status(200).json({
      success: true,
      message: response.message,
      item: response.item,
    });
  }),
});

export default BaseController;
