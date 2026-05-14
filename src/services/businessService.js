import { BusinessModel } from '../models/businessModel.js';
import DataloggerModel from '../models/DataloggerModel.js';
import AlarmModel from '../models/AlarmModel.js';
import ChannelModel from '../models/ChannelModel.js';
import CustomError from '../utils/customError.js';
import logger from './loggerService.js';

export const getAllBusinessesService = async (user) => {  
  if (user.isOwner) {
    const businesses = await BusinessModel.findAll();
    return businesses;
  }else{
    const businesses = await BusinessModel.findBusinessesByUserId(user.uuid);
    return businesses;
  }
};

export const getBusinessByUuidService = async (uuid) => {
  const business = await BusinessModel.findByUuid(uuid);
  const dataloggers = await DataloggerModel.findAllByBusinessUuid(uuid);
  const channels = await ChannelModel.findAllByBusinessUuid(uuid);  
  const alarms = await AlarmModel.findAllByBusinessUuid(uuid);
  //console.log('alarms', alarms);  
    
  dataloggers.forEach(datalogger => {
    datalogger.channels = channels
      .filter(channel => channel.datalogger_id === datalogger.uuid);
    datalogger.alarms = alarms
      .filter(alarm => alarm.channel_uuid && datalogger.channels.some(channel => channel.uuid === alarm.channel_uuid));
  }); 
  if (business) {
    business.dataloggers = dataloggers;    
  }else{
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

  if (updateData !== undefined){  
    for (const key in updateData) {
      if (updateData[key] !== undefined && !['street', 'city', 'state', 'country', 'zip_code'].includes(key)) {
        fieldsToUpdate[key] = updateData[key];
      }
    }

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
  const updatedBusiness = await BusinessModel.findByUuid(uuid);

  await logger.log({
    action: 'update',
    log_type: 'businesses',
    details: `Se actualizó business "${business.name}"`,
    extra_data: {
      entity_uuid: uuid,
      entity_name: business.name,
      changed_fields: Object.keys(fieldsToUpdate),
      updated_by: updatedBy
    },
    log_level: 'info'
  });

  return updatedBusiness;
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

  await logger.log({
    action: 'delete',
    log_type: 'businesses',
    details: `Se eliminó business "${business.name}"`,
    extra_data: {
      entity_uuid: uuid,
      entity_name: business.name,
      updated_by: updatedBy
    },
    log_level: 'info'
  });

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

  await logger.log({
    action: 'delete',
    log_type: 'businesses',
    details: `Se eliminó permanentemente business "${business.name}"`,
    extra_data: {
      entity_uuid: uuid,
      entity_name: business.name
    },
    log_level: 'info'
  });

  return { message: 'Business permanently deleted successfully' };
};
