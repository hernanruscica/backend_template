import BaseService from './baseService.js';
import MaintenanceLogModel from '../models/MaintenanceLogModel.js';
import CustomError from '../utils/customError.js';

const baseService = BaseService(MaintenanceLogModel);

const MaintenanceLogService = {
    ...baseService,

    async getAll(user, businessUuid, dataloggerUuid, channelUuid = null) {
        if (!businessUuid) {
            throw new CustomError('Business UUID is required', 400);
        }

        if (!dataloggerUuid) {
            throw new CustomError('Datalogger UUID is required', 400);
        }

        const isUserInBusiness = user?.roles?.some(ur => ur.businessUuid === businessUuid);
        const isUserOwner = user?.roles?.some(ur => ur.role === 'Owner');
        
        if (!isUserInBusiness && !isUserOwner) {
            throw new CustomError('User is not authorized to access this resource', 403);
        }

        if (channelUuid) {           
            return await MaintenanceLogModel.findAllByDataloggerAndChannel(dataloggerUuid, channelUuid, businessUuid);
        }

        return await MaintenanceLogModel.findAllByDataloggerUuid(dataloggerUuid, businessUuid);
    },

    async getByUuid(uuid, user, businessUuid) {
        if (!businessUuid) {
            throw new CustomError('Business UUID is required', 400);
        }

        const item = await MaintenanceLogModel.findByUuid(uuid);
        
        if (!item) {
            throw new CustomError('Maintenance log not found', 404);
        }

        if (item.business_uuid !== businessUuid) {
            throw new CustomError('Maintenance log not found in this business', 404);
        }

        return item;
    },

    async create(data, businessUuid, dataloggerUuid, channelUuid, user) {
        if (!businessUuid) {
            throw new CustomError('Business UUID is required', 400);
        }

        if (!dataloggerUuid) {
            throw new CustomError('Datalogger UUID is required', 400);
        }

        const createData = {
            ...data,
            business_uuid: businessUuid,
            datalogger_uuid: dataloggerUuid,
            channel_uuid: channelUuid || null
        };

        return await MaintenanceLogModel.create(createData, user.uuid);
    },

    async updateByUuid(uuid, data, user, businessUuid) {
        if (!businessUuid) {
            throw new CustomError('Business UUID is required', 400);
        }

        const existingItem = await MaintenanceLogModel.findByUuid(uuid);
        
        if (!existingItem) {
            throw new CustomError('Maintenance log not found', 404);
        }

        if (existingItem.business_uuid !== businessUuid) {
            throw new CustomError('Maintenance log not found in this business', 404);
        }

        await MaintenanceLogModel.update(uuid, data, user.uuid);
        return await MaintenanceLogModel.findByUuid(uuid);
    },

    async complete(uuid, user) {
        const existingItem = await MaintenanceLogModel.findByUuid(uuid);
        
        if (!existingItem) {
            throw new CustomError('Maintenance log not found', 404);
        }

        if (existingItem.status === 'completed') {
            throw new CustomError('Maintenance log is already completed', 400);
        }

        await MaintenanceLogModel.complete(uuid, user.uuid);
        return await MaintenanceLogModel.findByUuid(uuid);
    },

    async deleteByUuid(uuid, user) {
        const existingItem = await MaintenanceLogModel.findByUuid(uuid);
        
        if (!existingItem) {
            throw new CustomError('Maintenance log not found', 404);
        }

        const result = await MaintenanceLogModel.delete(uuid, user.uuid);
        if (result.affectedRows === 1) {
            return {
                message: 'Maintenance log deleted successfully',
                item: {...existingItem, is_active: false}
            };
        };
    },

    async hardDeleteByUuid(uuid, user) {
        const existingItem = await MaintenanceLogModel.findByUuid(uuid);
        
        if (!existingItem) {
            throw new CustomError('Maintenance log not found', 404);
        }

        const result = await MaintenanceLogModel.hardDelete(uuid);
        
        return {
            message: 'Maintenance log permanently deleted',
            item: existingItem
        };
    }
};

export default MaintenanceLogService;
