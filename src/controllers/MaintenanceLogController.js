import BaseController from './BaseController.js';
import MaintenanceLogService from '../services/MaintenanceLogService.js';

const MaintenanceLogController = BaseController(MaintenanceLogService);

const getAll = async (req, res, next) => {
    try {
        const { businessUuid, dataloggerUuid, channelUuid } = req.params;
        const user = req.user;        
        const items = await MaintenanceLogService.getAll(user, businessUuid, dataloggerUuid, channelUuid);

        res.status(200).json({
            success: true,
            count: items.length,
            items,
        });
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const { businessUuid, dataloggerUuid, channelUuid } = req.params;
        const user = req.user;

        const item = await MaintenanceLogService.create(req.body, businessUuid, dataloggerUuid, channelUuid, user);

        res.status(201).json({
            success: true,
            message: 'Maintenance log created successfully',
            item,
        });
    } catch (error) {
        next(error);
    }
};

const getByUuid = async (req, res, next) => {
    try {
        const { uuid, businessUuid } = req.params;
        const user = req.user;

        const item = await MaintenanceLogService.getByUuid(uuid, user, businessUuid);

        res.status(200).json({
            success: true,
            item,
        });
    } catch (error) {
        next(error);
    }
};

const updateByUuid = async (req, res, next) => {
    try {
        const { uuid, businessUuid } = req.params;
        const user = req.user;

        const updatedItem = await MaintenanceLogService.updateByUuid(uuid, req.body, user, businessUuid);

        res.status(200).json({
            success: true,
            message: 'Maintenance log updated successfully',
            item: updatedItem,
        });
    } catch (error) {
        next(error);
    }
};

const deleteByUuid = async (req, res, next) => {
    try {
        const { uuid } = req.params;
        const user = req.user;
        let response;

        if (req.hardDelete) {
            response = await MaintenanceLogService.hardDeleteByUuid(uuid, user);
        } else {
            response = await MaintenanceLogService.deleteByUuid(uuid, user);
        }

        res.status(200).json({
            success: true,
            message: response.message,
            item: response.item,
        });
    } catch (error) {
        next(error);
    }
};

const complete = async (req, res, next) => {
    try {
        const { uuid } = req.params;
        const user = req.user;

        const item = await MaintenanceLogService.complete(uuid, user);

        res.status(200).json({
            success: true,
            message: 'Maintenance log completed successfully',
            item,
        });
    } catch (error) {
        next(error);
    }
};

const runCheck = async (req, res, next) => {
    try {
        const { checkMaintenanceAlerts } = await import('../jobs/MaintenanceAlertJob.js');
        const result = await checkMaintenanceAlerts();

        res.status(200).json({
            success: true,
            message: 'Chequeo de mantenimiento ejecutado',
            result,
        });
    } catch (error) {
        next(error);
    }
};

MaintenanceLogController.getAll = getAll;
MaintenanceLogController.create = create;
MaintenanceLogController.getByUuid = getByUuid;
MaintenanceLogController.updateByUuid = updateByUuid;
MaintenanceLogController.deleteByUuid = deleteByUuid;
MaintenanceLogController.complete = complete;
MaintenanceLogController.runCheck = runCheck;

export default MaintenanceLogController;
