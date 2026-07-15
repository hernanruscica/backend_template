const metadataCache = new Map();

const ChannelMetadataStore = {
    get: (channelUuid) => {
        return metadataCache.get(channelUuid) || null;
    },

    set: (channelUuid, data) => {
        metadataCache.set(channelUuid, data);
    },

    loadAll: (channels) => {
        metadataCache.clear();
        channels.forEach(ch => {
            metadataCache.set(ch.uuid, {
                table_name: ch.table_name,
                column_name: ch.column_name,
                name: ch.name,
                averaging_period: ch.averaging_period
            });
        });
    },

    has: (channelUuid) => {
        return metadataCache.has(channelUuid);
    },

    invalidate: (channelUuid) => {
        metadataCache.delete(channelUuid);
    },

    invalidateAll: () => {
        metadataCache.clear();
    },

    size: () => {
        return metadataCache.size;
    }
};

export default ChannelMetadataStore;
