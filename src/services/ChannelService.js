import BaseService from './baseService.js';
import ChannelModel from '../models/ChannelModel.js';
import ChannelMetadataStore from '../stores/ChannelMetadataStore.js';

const baseChannelService = BaseService(ChannelModel);

const ChannelService = {
    ...baseChannelService,

    updateByUuid: async (uuid, fields, user) => {
        const result = await baseChannelService.updateByUuid(uuid, fields, user);
        ChannelMetadataStore.invalidate(uuid);
        return result;
    },

    deleteByUuid: async (uuid, user) => {
        const result = await baseChannelService.deleteByUuid(uuid, user);
        ChannelMetadataStore.invalidate(uuid);
        return result;
    },

    hardDeleteByUuid: async (uuid, user) => {
        const result = await baseChannelService.hardDeleteByUuid(uuid, user);
        ChannelMetadataStore.invalidate(uuid);
        return result;
    }
};

export default ChannelService;