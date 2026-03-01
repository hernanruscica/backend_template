import catchAsync from '../utils/catchAsync.js';
import UserAlarmService from '../services/UserAlarmService.js';
import BaseController from './BaseController.js';

const baseUserAlarmController = BaseController(UserAlarmService);

const UserAlarmController = {
    ...baseUserAlarmController,

    getMyAlarms: catchAsync(async (req, res, next) => {
        const alarms = await UserAlarmService.getAlarmsByUserUuid(req.user);
        res.status(200).json({
            success: true,
            count: alarms.length,
            items: alarms,
        });
    }),

    getAlarmsByUserUuid: catchAsync(async (req, res, next) => {
        const { userUuid } = req.params;
        const alarms = await UserAlarmService.getAlarmsByUserUuid(req.user, userUuid);
        res.status(200).json({
            success: true,
            count: alarms.length,
            items: alarms,
        });
    }),

    create: catchAsync(async (req, res, next) => {
        const { businessUuid } = req.params;
        const { user_uuid } = req.body;
        if (!user_uuid || !businessUuid) {
            return res.status(400).json({
                success: false,
                message: 'user_uuid and businessUuid are required in params',
            });
        }
        const item = await UserAlarmService.create(req.body, businessUuid, req.user);
        res.status(201).json({
            success: true,
            message: `${UserAlarmService.model.tableName.slice(0, -1)} created successfully`,
            item,
        });
    }),

    getAll: catchAsync(async (req, res, next) => {
        const { userUuid, businessUuid } = req.params;
        if (!userUuid || !businessUuid) {
            return res.status(400).json({
                success: false,
                message: 'userUuid and businessUuid are required in params',
            });
        }

        const items = await UserAlarmService.getAll(req.user, businessUuid, userUuid);

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
        const item = await UserAlarmService.getByUuid(uuid, req.user, businessUuid);
        res.status(200).json({
            success: true,
            item,
        });
    }),

    getUsersByAlarmUuid: catchAsync(async (req, res, next) => {
        const { alarmUuid, businessUuid } = req.params;
        if (!alarmUuid || !businessUuid) {
            return res.status(400).json({
                success: false,
                message: 'alarmUuid and businessUuid are required in params',
            });
        }
        const users = await UserAlarmService.getUsersByAlarmUuid(req.user, businessUuid, alarmUuid);
        res.status(200).json({
            success: true,
            count: users.length,
            users,
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
        const updatedItem = await UserAlarmService.updateByUuid(uuid, req.body, req.user, businessUuid);
        res.status(200).json({
            success: true,
            message: `${UserAlarmService.model.tableName.slice(0, -1)} updated successfully`,
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
            response = await UserAlarmService.hardDeleteByUuid(uuid, req.user, businessUuid);
        } else {
            response = await UserAlarmService.deleteByUuid(uuid, req.user, businessUuid);
        }
        res.status(200).json({
            success: true,
            message: response.message,
            item: response.item,
        });
    }),
};

export default UserAlarmController;
