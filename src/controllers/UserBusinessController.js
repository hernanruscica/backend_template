import catchAsync from '../utils/catchAsync.js';
import UserBusinessService from '../services/UserBusinessService.js';
import BaseController from './BaseController.js';

const baseUserBusinessController = BaseController(UserBusinessService);

const UserBusinessController = {
    ...baseUserBusinessController,

    create: catchAsync(async (req, res, next) => {
        const { businessUuid } = req.params;
        //console.log('req.body', req.body);
        
        if (!businessUuid) {
            return res.status(400).json({
                success: false,
                message: 'businessUuid is required in params',
            });
        }
        const item = await UserBusinessService.create(req.body, req.user);
        res.status(201).json({
            success: true,
            message: `${UserBusinessService.model.tableName.slice(0, -1)} created successfully`,
            item,
        });
    }),

    getAll: catchAsync(async (req, res, next) => {
        const { businessUuid } = req.params;
        if (!businessUuid) {
            return res.status(400).json({
                success: false,
                message: 'businessUuid are required in params',
            });
        }

        const items = await UserBusinessService.getAll(req.user, businessUuid);

        res.status(200).json({
            success: true,
            count: items.length,
            items,
        });
    }),

    getByUuid: catchAsync(async (req, res, next) => {
        const { uuid, businessUuid } = req.params;
        if (!businessUuid) {
            return res.status(400).json({
                success: false,
                message: 'businessUuid is required in params',
            });
        }
        const item = await UserBusinessService.getByUuid(uuid, req.user, businessUuid);
        res.status(200).json({
            success: true,
            item,
        });
    }),

    updateByUuid: catchAsync(async (req, res, next) => {
        const { uuid, businessUuid } = req.params;
        if (!businessUuid) {
            return res.status(400).json({
                success: false,
                message: 'businessUuid is required in params',
            });
        }
        const updatedItem = await UserBusinessService.updateByUuid(uuid, req.body, req.user, businessUuid);
        res.status(200).json({
            success: true,
            message: `${UserBusinessService.model.tableName.slice(0, -1)} updated successfully`,
            item: updatedItem,
        });
    }),

    deleteByUuid: catchAsync(async (req, res, next) => {
        const { uuid, businessUuid } = req.params;
        if (!businessUuid) {
            return res.status(400).json({
                success: false,
                message: 'businessUuid is required in params',
            });
        }
        let response;
        if (req.hardDelete) {
            response = await UserBusinessService.hardDeleteByUuid(uuid, req.user, businessUuid);
        } else {
            response = await UserBusinessService.deleteByUuid(uuid, req.user, businessUuid);
        }
        res.status(200).json({
            success: true,
            message: response.message,
            item: response.item,
        });
    }),
};

export default UserBusinessController;
