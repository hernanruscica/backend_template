import CustomError from '../utils/customError.js';
import { BusinessModel } from '../models/businessModel.js';

const BaseService = (model) => ({
  model,

  async create(data, businessUuid, user) {
    const business = await BusinessModel.findByUuid(businessUuid);
    if (!business) {
      throw new CustomError('Business not found', 404);
    }

    // Here you can add the permission logic based on the user's role and business.
    // For example, check if the user has permission to create entities in the given business.

    const newData = { ...data, business_uuid: businessUuid };
    return this.model.create(newData, user.uuid);
  },

  async getAll(user) {
    if (user.isOwner) {
      return this.model.findAll();
    }

    const business = await BusinessModel.findBusinessByUserId(user.uuid);
    if (!business) {
      throw new CustomError('User is not associated with any business', 404);
    }

    return this.model.findAllByBusinessUuid(business.uuid);
  },

  async getByUuid(uuid) {
    const item = await this.model.findByUuid(uuid);
    if (!item) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }
    return item;
  },

  async updateByUuid(uuid, updateData, user) {
    const item = await this.model.findByUuid(uuid);
    if (!item) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }

    // Permission logic here

    await this.model.update(uuid, updateData, user.uuid);
    return this.model.findByUuid(uuid);
  },

  async deleteByUuid(uuid, user) {
    const item = await this.model.findByUuid(uuid);
    if (!item) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }

    // Permission logic here

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