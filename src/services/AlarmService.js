import BaseService from './baseService.js';
import AlarmModel from '../models/AlarmModel.js';
import UserAlarmModel from '../models/UserAlarmModel.js'
import {UserModel} from '../models/userModel.js'
import CustomError from '../utils/customError.js';

const baseAlarmService = BaseService(AlarmModel);

const AlarmService = {
    ...baseAlarmService,
    async getAll(user, businessUuid, userId) {    

    if (!businessUuid) {
      throw new CustomError('Business UUID is required', 400);
    } 

    if (user.isOwner) {
      //If not owner and receive userId
      if (userId){
          //console.log('userId en AlarmService: ', userId);
          const userAlarms = await UserAlarmModel.findAllByBusinessUuid(businessUuid);
          const alarmsAll = await AlarmModel.findAll();
          const currentUser = await UserModel.findByUuid(userId);
          //console.log(currentUser)
          const filteredUserAlarms = userAlarms.filter(ua => ua.user_uuid === userId);
          const filteredAlarmUuids = filteredUserAlarms.map(ua => ua.alarm_uuid);
          
          const finalAlarms = alarmsAll.filter(alarm => filteredAlarmUuids.includes(alarm.uuid));

          const alarmsWithUsername = finalAlarms.map(alarm => ({
              ...alarm,
              username: `${currentUser.first_name} ${currentUser.last_name}`
          }));          
          return alarmsWithUsername;
      }
      const items = await this.model.findAllByBusinessUuid(businessUuid);
      return items;
    }
    
    const isUserInBusiness = user.roles.some(ur => ur.businessUuid === businessUuid);
    if (!isUserInBusiness) {
      throw new CustomError(`User is not authorized to access this ${this.model.tableName.slice(0, -1)}`, 403);
    }

    const items = await this.model.findAllByBusinessUuid(businessUuid);    
    return items;
  },
  async getAllByUser(user, businessUuid, userId) {    

    if (!businessUuid) {
      throw new CustomError('Business UUID is required', 400);
    } 

    if (!userId) {
      throw new CustomError('User ID is required', 400);
    }
    //console.log('user', user);
    
    const isUserInBusiness = user?.roles.some(ur => ur.businessUuid === businessUuid);
    const isUserOwner = user?.roles.some(ur => ur.role === 'Owner');
    //console.log('isOwner', isUserOwner);
    if (!isUserInBusiness && !isUserOwner) {
      throw new CustomError(`User is not authorized to access this ${this.model.tableName.slice(0, -1)}`, 403);
    }

    return await this.model.findAllByUserUuid(businessUuid, userId);

  }
}

export default AlarmService;
