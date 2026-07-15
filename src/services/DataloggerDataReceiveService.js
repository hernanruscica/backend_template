import DataloggerModel from "../models/DataloggerModel.js";
import ChannelModel from "../models/ChannelModel.js";
import DataloggersDataStore from "../stores/DataloggersDataStore.js";
import ChannelMetadataStore from "../stores/ChannelMetadataStore.js";
import DataService from "./DataService.js";
import logger from "./loggerService.js";

const BATCH_SIZE = 3;

const processChannel = async (ch) => {
    const responseData = await DataService.getLastPorcentageUsageByChannel(ch.uuid, ch.averaging_period);
    ch.lastData = responseData;
    
    const dataloggerData = DataloggersDataStore.getLoggerData(ch.datalogger_id);
    const totalDataExists = Object.keys(dataloggerData).length !== 0;            

    const shouldReload = DataloggersDataStore.shouldReloadTotalData(24);
    
    if (!totalDataExists || shouldReload) {
        const responseDataTotalData = await DataService.getTotalOnTimeFromChannel(ch.uuid);
        ch.totalData = responseDataTotalData;
        if (shouldReload) {
            DataloggersDataStore.setLastTotalDataLoad(Date.now());
        }
    } else {
        ch.totalData = DataloggersDataStore.getLoggerData(ch.datalogger_id).channels.find(c => c.uuid == ch.uuid).totalData;            
    }  

    return ch;
};

const processDatalogger = async (dl) => {
    const responseData = await DataService.getDataloggerLastConection(dl.uuid);
    dl.lastConection = responseData !== null ? responseData.data : null;
    return dl;
};

const processBatches = async (items, processFn) => {
    const allResults = [];
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.allSettled(batch.map(processFn));
        allResults.push(...batchResults);
    }
    return allResults;
};

const DataloggerDataReceiveService = {
    loadData: async () => {
        const responseDls = await DataloggerModel.findAll();
        const activeDataloggers = responseDls.filter(dl => dl.is_active == true);        
        const responseChannels = await ChannelModel.findAll();
        const activeChannels = responseChannels.filter(ch => ch.is_active == true);    

        ChannelMetadataStore.loadAll(activeChannels.map(ch => ({
            uuid: ch.uuid,
            table_name: ch.datalogger?.table_name,
            column_name: ch.column_name,
            name: ch.name,
            averaging_period: ch.averaging_period
        })));

        const channelsWithAllData = await processBatches(activeChannels, processChannel);
        const rejectedChannels = channelsWithAllData.filter(r => r.status === 'rejected');
        if (rejectedChannels.length > 0) {
            logger.log({ action: null, log_type: 'data', details: `${rejectedChannels.length} canal(es) fallaron al cargar datos`, extra_data: { errors: rejectedChannels.map(r => r.reason?.message || r.reason) }, log_level: 'warn' });
        }
        const successfulChannels = channelsWithAllData.filter(r => r.status === 'fulfilled').map(r => r.value);
        
        const dataloggersWithLastConectionInfo = await processBatches(activeDataloggers, processDatalogger);
        const rejectedDataloggers = dataloggersWithLastConectionInfo.filter(r => r.status === 'rejected');
        if (rejectedDataloggers.length > 0) {
            logger.log({ action: null, log_type: 'data', details: `${rejectedDataloggers.length} datalogger(s) fallaron al cargar última conexión`, extra_data: { errors: rejectedDataloggers.map(r => r.reason?.message || r.reason) }, log_level: 'warn' });
        }
        const successfulDataloggers = dataloggersWithLastConectionInfo.filter(r => r.status === 'fulfilled').map(r => r.value);

        successfulDataloggers.forEach(dl => {
            const channelsForCurrentDatalogger = successfulChannels.filter(ch => ch.datalogger_id == dl.uuid);
            dl.channels = channelsForCurrentDatalogger;            
            DataloggersDataStore.setLoggerData(dl.uuid, dl);   
        });

        return {
            successfulDataloggers,
            rejectedDataloggers,
            rejectedChannels
        };
    }
}

export default DataloggerDataReceiveService;