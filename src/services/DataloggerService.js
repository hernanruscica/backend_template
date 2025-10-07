import BaseService from './baseService.js';
import DataloggerModel from '../models/DataloggerModel.js';
import ChannelModel from '../models/ChannelModel.js';
import AlarmModel from '../models/AlarmModel.js';
import CustomError from '../utils/customError.js';

const baseDataloggerService = BaseService(DataloggerModel);

const DataloggerService = {
  ...baseDataloggerService,

  async getAll(user, businessUuid) {
    // Call the original getAll to get dataloggers with business info
    const dataloggers = await baseDataloggerService.getAll(user, businessUuid);    
    const channels = await ChannelModel.findAllByBusinessUuid(businessUuid);  
    const alarms = await AlarmModel.findAllByBusinessUuid(businessUuid);
    
    if (!dataloggers || dataloggers.length === 0) {
      return [];
    }
    dataloggers.forEach(datalogger => {
      datalogger.channels = channels
        .filter(channel => channel.datalogger_id === datalogger.uuid);
      datalogger.alarms = alarms
        .filter(alarm => alarm.channel_uuid && datalogger.channels.some(channel => channel.uuid === alarm.channel_uuid));
  }); 


/*
    // Fetch all channels at once to avoid N+1 query problem
    const allChannels = await ChannelModel.findAll();
    
    const allAlarms = await AlarmModel.findAll();
    
    // Create a map of channels by their datalogger_id for efficient lookup
    const channelsMap = allChannels.reduce((acc, channel) => {
      const dataloggerId = channel.datalogger_id;
      if (!acc[dataloggerId]) {
        acc[dataloggerId] = [];
      }
      // Remove the redundant business object from the channel
      const { business, ...channelWithoutBusiness } = channel;
      acc[dataloggerId].push(channelWithoutBusiness);
      return acc;
    }, {});

    // Attach channels to their respective dataloggers
    const dataloggersWithChannels = dataloggers.map(datalogger => ({
      ...datalogger,
      channels: channelsMap[datalogger.uuid] || [],
    }));
*/
    return dataloggers;
  },

  async getByUuid(uuid, user, businessUuid) {    
    const datalogger = await this.model.findByUuid(uuid);
    if (!datalogger) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} not found`, 404);
    }

    const channels = await ChannelModel.findAllByBusinessUuid(businessUuid);  
    const alarms = await AlarmModel.findAllByBusinessUuid(businessUuid);

    //console.log(channels.some(channel => channel.uuid === alarms[0].channel_uuid))

     if (!datalogger) {
      return [];
    }
    
    datalogger.channels = channels.filter(ch => ch.datalogger_id === uuid);    
    datalogger.alarms = alarms.filter(alarm => alarm.channel_uuid && datalogger.channels.some(channel => channel.uuid === alarm.channel_uuid));   

    if (user.isOwner) {
      return datalogger;
    }

    if (!businessUuid) {
      throw new CustomError('Business UUID is required', 400);
    }
    
    const isUserInBusiness = user.roles.some(ur => ur.businessUuid === businessUuid);
    if (!isUserInBusiness) {
      throw new CustomError('User is not authorized to access this business', 403);
    }

    if (datalogger.business_uuid !== businessUuid) {
      throw new CustomError(`${this.model.tableName.slice(0, -1)} does not belong to the specified business`, 403);
    }

    return datalogger;
  },
};

export default DataloggerService;
