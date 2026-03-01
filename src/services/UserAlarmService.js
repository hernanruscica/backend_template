import BaseService from './baseService.js';
import UserAlarmModel from '../models/UserAlarmModel.js';
import CustomError from '../utils/customError.js';

const baseUserAlarmService = BaseService(UserAlarmModel);

const UserAlarmService = {
    ...baseUserAlarmService,

    async create(data, businessUuid, user) {
        if (!data.user_uuid || !data.alarm_uuid || !businessUuid || !data.business_uuid) {
            throw new CustomError('user_uuid, alarm_uuid, and businessUuid are required', 400);
        }

        // TODO: Add checks to ensure user_uuid, alarm_uuid, and businessUuid actually exist and are consistent.
        // For now, we'll rely on foreign key constraints.        
        
        
        return this.model.create(data, user.uuid);
    },

    async getAlarmsByUserUuid(user, targetUserUuid = null) {
        if (!user || !user.uuid) {
            throw new CustomError('User is required', 400);
        }

        const targetUuid = targetUserUuid || user.uuid;
        const isOwnAlarms = targetUuid === user.uuid;

        // Owner can see all alarms
        if (user.isOwner) {
            return this.model.findAlarmsByUserUuid(targetUuid);
        }

        // Get business UUIDs where the authenticated user has a role
        const userBusinessUuids = user.roles
            .filter(r => r.businessUuid)
            .map(r => r.businessUuid);

        if (userBusinessUuids.length === 0) {
            throw new CustomError('User does not belong to any business', 403);
        }

        // If requesting own alarms, filter by user's businesses
        if (isOwnAlarms) {
            return this.model.findAlarmsByUserUuidInBusinesses(targetUuid, userBusinessUuids);
        }

        // If requesting another user's alarms, verify that user belongs to one of our businesses
        const targetUserBusinesses = await this.model.findBusinessesByUserUuid(targetUuid);
        const targetUserBusinessUuids = targetUserBusinesses.map(ub => ub.business_uuid);
        
        const hasAccess = userBusinessUuids.some(b => targetUserBusinessUuids.includes(b));
        
        if (!hasAccess) {
            throw new CustomError('User does not have access to this user\'s alarms', 403);
        }

        // Return alarms from businesses where both users have access
        const sharedBusinesses = userBusinessUuids.filter(b => targetUserBusinessUuids.includes(b));
        return this.model.findAlarmsByUserUuidInBusinesses(targetUuid, sharedBusinesses);
    },

    async getAll(user, businessUuid, userUuid) {
        if (!businessUuid) {
            throw new CustomError('Business UUID is required', 400);
        }
        if (!userUuid) {
            throw new CustomError('User UUID is required', 400);
        }

        // Authorization check: Ensure the requesting user has access to this business.
        const isUserInBusiness = user.roles.some(ur => ur.businessUuid === businessUuid);
        if (!isUserInBusiness && !user.isOwner) {
            throw new CustomError(`User is not authorized to access this business's user alarms`, 403);
        }

        const allUserAlarms = await this.model.findAll();
        const userSpecificAlarms = allUserAlarms.filter(ua =>
            ua.user_uuid === userUuid && ua.business_uuid === businessUuid
        );
        return userSpecificAlarms;
    },

    async getByUuid(uuid, user, businessUuid) {
        const item = await this.model.findByUuid(uuid);
        if (!item) {
            throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
        }

        if (!businessUuid) {
            throw new CustomError('Business UUID is required', 400);
        }

        // Authorization check: Ensure the requesting user has access to this business.
        const isUserInBusiness = user.roles.some(ur => ur.businessUuid === businessUuid);
        if (!isUserInBusiness && !user.isOwner) {
            throw new CustomError('User is not authorized to access this business', 403);
        }

        // Ensure the user alarm belongs to the specified business
        if (item.business_uuid !== businessUuid) {
            throw new CustomError(`${this.model.tableName.slice(0, -1)} does not belong to the specified business`, 403);
        }

        return item;
    },

    async getUsersByAlarmUuid(user, businessUuid, alarmUuid) {
        if (!alarmUuid) {
            throw new CustomError('Alarm UUID is required', 400);
        }

        if (!businessUuid) {
            throw new CustomError('Business UUID is required', 400);
        }

        // Authorization check: Ensure the requesting user has access to this business.
        const isUserInBusiness = user.roles.some(ur => ur.businessUuid === businessUuid);
        if (!isUserInBusiness && !user.isOwner) {
            throw new CustomError('User is not authorized to access this business', 403);
        }
/*
        const allUserAlarms = await this.model.findAll();
        const userSpecificAlarms = allUserAlarms.filter(ua =>
            ua.alarm_uuid === alarmUuid && ua.business_uuid === businessUuid
        );*/
        return this.model.findUsersByAlarmUuid(alarmUuid, businessUuid);
    },

    async updateByUuid(uuid, updateData, user, businessUuid) {
        const item = await this.model.findByUuid(uuid);
        if (!item) {
            throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
        }

        if (!businessUuid) {
            throw new CustomError('Business UUID is required', 400);
        }

        // Authorization check: Ensure the requesting user has access to this business.
        const isUserInBusiness = user.roles.some(ur => ur.businessUuid === businessUuid);
        if (!isUserInBusiness && !user.isOwner) {
            throw new CustomError('User is not authorized to access this business', 403);
        }

        // Ensure the user alarm belongs to the specified business
        if (item.business_uuid !== businessUuid) {
            throw new CustomError(`${this.model.tableName.slice(0, -1)} does not belong to the specified business`, 403);
        }

        await this.model.update(uuid, updateData, user.uuid);
        return this.model.findByUuid(uuid);
    },

    async deleteByUuid(uuid, user, businessUuid) {
        const item = await this.model.findByUuid(uuid);
        if (!item) {
            throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
        }

        if (!businessUuid) {
            throw new CustomError('Business UUID is required', 400);
        }

        // Authorization check: Ensure the requesting user has access to this business.
        const isUserInBusiness = user.roles.some(ur => ur.businessUuid === businessUuid);
        if (!isUserInBusiness && !user.isOwner) {
            throw new CustomError('User is not authorized to access this business', 403);
        }

        // Ensure the user alarm belongs to the specified business
        if (item.business_uuid !== businessUuid) {
            throw new CustomError(`${this.model.tableName.slice(0, -1)} does not belong to the specified business`, 403);
        }

        const result = await this.model.delete(uuid, user.uuid);
        if (result.affectedRows === 0) {
            throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
        }
        return { message: `${this.model.tableName.slice(0, -1)} deleted successfully`, item: { ...item, is_active: false } };
    },
};

export default UserAlarmService;
