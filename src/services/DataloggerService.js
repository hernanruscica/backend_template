import BaseService from './baseService.js';
import DataloggerModel from '../models/DataloggerModel.js';
import ChannelModel from '../models/ChannelModel.js';

const baseDataloggerService = BaseService(DataloggerModel);

const DataloggerService = {
  ...baseDataloggerService,

  async getAll(user, businessUuid) {
    // Call the original getAll to get dataloggers with business info
    const dataloggers = await baseDataloggerService.getAll(user, businessUuid);    
    //console.log('Dataloggers fetched:', dataloggers);
    
    if (!dataloggers || dataloggers.length === 0) {
      return [];
    }

    // Fetch all channels at once to avoid N+1 query problem
    const allChannels = await ChannelModel.findAll();
    
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

    return dataloggersWithChannels;
  },
};

export default DataloggerService;
