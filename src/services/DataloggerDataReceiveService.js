import DataloggerModel from "../models/DataloggerModel.js";
import ChannelModel from "../models/ChannelModel.js";
import DataloggersDataStore from "../stores/DataloggersDataStore.js";
import DataService from "./DataService.js";
//import dataModel from "../models/dataModel";

const DataloggerDataReceiveService = {
    loadData: async () => {
        console.log('========================================');
        console.log('🔄 DataloggerDataReceiveJob ejecutandose...');
        console.log('========================================');
        // Get All active dataloggers
        const responseDls = await DataloggerModel.findAll();
        const activeDataloggers = responseDls.filter(dl => dl.is_active == true);        
        // Get All active channels
        const responseChannels = await ChannelModel.findAll();
        const activeChannels = responseChannels.filter(ch => ch.is_active == true);    

        
        //create promise array of queries for the last average usage data for each channel.
        const promises = activeChannels.map(async (ch) => {
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
        })
        const channelsWithAllData = await Promise.allSettled(promises);
        const rejectedChannels = channelsWithAllData.filter(r => r.status === 'rejected');
        if (rejectedChannels.length > 0) {
            console.error(`❌ ${rejectedChannels.length} canal(es) fallaron al cargar datos:`, rejectedChannels.map(r => r.reason?.message || r.reason));
        }
        const successfulChannels = channelsWithAllData.filter(r => r.status === 'fulfilled').map(r => r.value);
        
        //create promise array of queries for the last conection date for all dataloggers.
        const promisesLastConection = activeDataloggers.map(async (dl) => {
            const responseData = await DataService.getDataloggerLastConection(dl.uuid);
            dl.lastConection = responseData !== null ? responseData.data : null;
            return dl;
        })
        const dataloggersWithLastConectionInfo = await Promise.allSettled(promisesLastConection);
        const rejectedDataloggers = dataloggersWithLastConectionInfo.filter(r => r.status === 'rejected');
        if (rejectedDataloggers.length > 0) {
            console.error(`❌ ${rejectedDataloggers.length} datalogger(s) fallaron al cargar última conexión:`, rejectedDataloggers.map(r => r.reason?.message || r.reason));
        }
        const successfulDataloggers = dataloggersWithLastConectionInfo.filter(r => r.status === 'fulfilled').map(r => r.value);

        successfulDataloggers.forEach(dl => {
            const channelsForCurrentDatalogger = successfulChannels.filter(ch => ch.datalogger_id == dl.uuid);
            dl.channels = channelsForCurrentDatalogger;            
            DataloggersDataStore.setLoggerData(dl.uuid, dl);   
        });
        
    }
}

export default DataloggerDataReceiveService;