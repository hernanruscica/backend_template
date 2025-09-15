import CustomError from '../utils/customError.js';
import { BusinessModel } from '../models/businessModel.js';

const BaseService = (model) => ({
  model,

  async create(data, businessUuid, user) {
    const business = await BusinessModel.findByUuid(businessUuid);
    if (!business) {
      throw new CustomError('Business not found', 404);
    }
    const newData = { ...data, business_uuid: businessUuid };
    return this.model.create(newData, user.uuid);
  },

  async getAll(user, businessUuid) {    
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
    const item = await this.model.findByUuid(uuid);
    if (!item) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }

    const isUserInBusiness = user.roles.some(ur => ur.businessUuid === businessUuid);
    if (!isUserInBusiness) {
      throw new CustomError('User is not authorized to access this business', 403);
    }

    await this.model.update(uuid, updateData, user.uuid);
    return this.model.findByUuid(uuid);
  },

  async deleteByUuid(uuid, user) {
    const item = await this.model.findByUuid(uuid);
    if (!item) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }

    const isUserInBusiness = user.roles.some(ur => ur.businessUuid === businessUuid);
    if (!isUserInBusiness) {
      throw new CustomError('User is not authorized to access this business', 403);
    }

    const result = await this.model.delete(uuid, user.uuid);
    if (result.affectedRows === 0) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }
    return { message: `${this.model.tableName.slice(0, -1)} deleted successfully`, item: {...item, is_active: false} };
  },

  async hardDeleteByUuid(uuid) {
    const item = await this.model.findByUuid(uuid);
    if (!item) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }

    // Permission logic here

    const result = await this.model.hardDelete(uuid);
    if (result.affectedRows === 0) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }
    return { message: `${this.model.tableName.slice(0, -1)} permanently deleted successfully`, item };
  },
});

export default BaseService;
