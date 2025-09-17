import { BusinessModel } from '../models/businessModel.js';
import CustomError from '../utils/customError.js';

export const getAllBusinessesService = async (user) => {  
  if (user.isOwner) {
    const users = await BusinessModel.findAll();
    return users;
  }else{
    const users = await BusinessModel.findBusinessesByUserId(user.uuid);
    return users;
  }
};

export const getBusinessByUuidService = async (uuid) => {
  const business = await BusinessModel.findByUuid(uuid);
  if (!business) {
    throw new CustomError('Business not found', 404);
  }
  return business;      
};

export const updateBusinessByUuidService = async (uuid, updateData, updatedBy, file) => {
  const business = await BusinessModel.findByUuid(uuid);
  if (!business) {
    throw new CustomError('Business not found', 404);
  }

  const fieldsToUpdate = {};

  //console.log('From businessService', file);

  
  if (updateData !== undefined){  
    // Copy all non-address fields that are not undefined
    for (const key in updateData) {
      if (updateData[key] !== undefined && !['street', 'city', 'state', 'country', 'zip_code'].includes(key)) {
        fieldsToUpdate[key] = updateData[key];
      }
    }

    // Handle address fields
    const addressUpdates = {};
    const addressFields = ['street', 'city', 'state', 'country', 'zip_code'];
    let hasAddressUpdate = false;
    addressFields.forEach(field => {
      if (updateData[field] !== undefined) {
        addressUpdates[field] = updateData[field];
        hasAddressUpdate = true;
      }
    });

    if (hasAddressUpdate) {
      fieldsToUpdate.address = { ...(business.address || {}), ...addressUpdates };
    }
  }

  if (file) {
    fieldsToUpdate.logo_url = file.path;
  }

  if (Object.keys(fieldsToUpdate).length === 0 && !file) {
    return business;
  }

  await BusinessModel.update(uuid, fieldsToUpdate, updatedBy);
  return BusinessModel.findByUuid(uuid);
};

export const deleteBusinessByUuidService = async (uuid, updatedBy) => {
  const business = await BusinessModel.findByUuid(uuid);
  if (!business) {
    throw new CustomError('Business not found', 404);
  }
  const result = await BusinessModel.delete(uuid, updatedBy);
  if (result.affectedRows === 0) {
    throw new CustomError('Business not found', 404);
  }
  return { message: 'Business deleted successfully', business: { ...business, is_active: false } };
};

export const hardDeleteBusinessByUuidService = async (uuid) => {
  const business = await BusinessModel.findByUuid(uuid);
  if (!business) {
    throw new CustomError('Business not found', 404);
  }
  const result = await BusinessModel.hardDelete(uuid);
  if (result.affectedRows === 0) {
    throw new CustomError('Business not found', 404);
  }
  return { message: 'Business permanently deleted successfully' };
};
