import CustomError from '../utils/customError.js';
import { BusinessModel } from '../models/businessModel.js';
import logger from './loggerService.js';

const BaseService = (model) => ({
  model,

  async create(data, businessUuid, user) {
    const business = await BusinessModel.findByUuid(businessUuid);
    if (!business) {
      throw new CustomError('Business not found', 404);
    }
    const newData = { ...data, business_uuid: businessUuid };
    const item = await this.model.create(newData, user.uuid);

    const entityName = this.model.tableName.slice(0, -1);
    const itemName = item.name || item.uuid;

    await logger.log({
      action: 'create',
      log_type: this.model.tableName,
      details: `Se creó ${entityName} "${itemName}" en negocio ${businessUuid}`,
      extra_data: {
        entity_uuid: item.uuid,
        entity_name: itemName,
        business_uuid: businessUuid,
        created_by_uuid: user.uuid
      },
      log_level: 'info'
    });

    return item;
  },

  async getAll(user, businessUuid, userId) {    
    if (user.isOwner) {
      const items = await this.model.findAll();
      return items;
    }        
    
    if (!businessUuid) {
      throw new CustomError('Business UUID is required', 400);
    }      
    
    const isUserInBusiness = user.roles.some(ur => ur.businessUuid === businessUuid);
    if (!isUserInBusiness) {
      throw new CustomError(`User is not authorized to access this ${this.model.tableName.slice(0, -1)}`, 403);
    }

    const items = await this.model.findAllByBusinessUuid(businessUuid);    
    return items;
  },

  async getByUuid(uuid, user, businessUuid) {    
    const item = await this.model.findByUuid(uuid);
    if (!item) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }

    if (user.isOwner) {
      return item;
    }

    if (!businessUuid) {
      throw new CustomError('Business UUID is required', 400);
    }
    
    const isUserInBusiness = user.roles.some(ur => ur.businessUuid === businessUuid);
    if (!isUserInBusiness) {
      throw new CustomError('User is not authorized to access this business', 403);
    }

    if (item.business_uuid !== businessUuid) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} does not belong to the specified business`, 403);
    }

    return item;
  },

  async updateByUuid(uuid, updateData, user) {
    const {businessUuid} = updateData;
    const item = await this.model.findByUuid(uuid);
    if (!item) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }

    const isUserInBusiness = !user.isOwner ? user.roles.some(ur => ur?.businessUuid === businessUuid) : user.isOwner;
    if (!isUserInBusiness) {
      throw new CustomError('User is not authorized to access this business', 403);
    }

    await this.model.update(uuid, updateData, user.uuid);
    const updatedItem = await this.model.findByUuid(uuid);

    const entityName = this.model.tableName.slice(0, -1);
    const itemName = updatedItem.name || uuid;
    const changedFields = Object.keys(updateData).filter(k => k !== 'businessUuid');

    await logger.log({
      action: 'update',
      log_type: this.model.tableName,
      details: `Se actualizó ${entityName} "${itemName}"`,
      extra_data: {
        entity_uuid: uuid,
        entity_name: itemName,
        business_uuid: businessUuid,
        updated_by_uuid: user.uuid,
        changed_fields: changedFields
      },
      log_level: 'info'
    });

    return updatedItem;
  },

  async deleteByUuid(uuid, user) {
    const item = await this.model.findByUuid(uuid);
    if (!item) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }

    const businessUuid = item.business_uuid;
    const isUserInBusiness = user.roles.some(ur => ur.businessUuid === businessUuid);
    if (!isUserInBusiness) {
      throw new CustomError('User is not authorized to access this business', 403);
    }

    const result = await this.model.delete(uuid, user.uuid);
    if (result.affectedRows === 0) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }

    const entityName = this.model.tableName.slice(0, -1);
    const itemName = item.name || uuid;

    await logger.log({
      action: 'delete',
      log_type: this.model.tableName,
      details: `Se eliminó ${entityName} "${itemName}"`,
      extra_data: {
        entity_uuid: uuid,
        entity_name: itemName,
        business_uuid: businessUuid,
        updated_by_uuid: user.uuid
      },
      log_level: 'info'
    });

    return { message: `${entityName} deleted successfully`, item: {...item, is_active: false} };
  },

  async hardDeleteByUuid(uuid, user) {
    const item = await this.model.findByUuid(uuid);
    if (!item) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }

    const result = await this.model.hardDelete(uuid);
    if (result.affectedRows === 0) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }

    const entityName = this.model.tableName.slice(0, -1);
    const itemName = item.name || uuid;

    await logger.log({
      action: 'delete',
      log_type: this.model.tableName,
      details: `Se eliminó permanentemente ${entityName} "${itemName}"`,
      extra_data: {
        entity_uuid: uuid,
        entity_name: itemName,
        business_uuid: item.business_uuid,
        updated_by_uuid: user?.uuid
      },
      log_level: 'info'
    });

    return { message: `${this.model.tableName.slice(0, -1)} permanently deleted successfully`, item };
  },
});

export default BaseService;
