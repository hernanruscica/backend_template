import catchAsync from '../utils/catchAsync.js';

const BaseController = (service) => ({
  create: catchAsync(async (req, res, next) => {       
    const { businessUuid } = req.params;
    if (!businessUuid) {
      return res.status(400).json({
        success: false,
        message: 'businessUuid is required',
      });
    }

    if (req.file) {
      req.body.img = req.file.path;
    }
    
    const item = await service.create(req.body, businessUuid, req.user);
    res.status(201).json({
      success: true,
      message: `${service.model.tableName.slice(0, -1)} created successfully`,
      item,
    });
  }),

  getAll: catchAsync(async (req, res, next) => {
    const { businessUuid, userId } = req.params;
    if (!businessUuid) {
      return res.status(400).json({
        success: false,
        message: 'businessUuid is required',
      });
    }
    
    const { user } = req;            
    const items = await service.getAll(user, businessUuid, userId);    
    
    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  }),

  getByUuid: catchAsync(async (req, res, next) => {
    const { uuid, businessUuid } = req.params;    
    const item = await service.getByUuid(uuid, req.user, businessUuid);
    res.status(200).json({
      success: true,
      item,
    });
  }),

  updateByUuid: catchAsync(async (req, res, next) => {
    const { uuid, businessUuid } = req.params;
    req.body.businessUuid = businessUuid;
    if (req.file) {
      req.body.img = req.file.path;
    }

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
