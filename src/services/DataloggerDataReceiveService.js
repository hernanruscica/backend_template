import DataloggerModel from "../models/DataloggerModel.js";
import ChannelModel from "../models/ChannelModel.js";
import DataloggersDataStore from "../stores/DataloggersDataStore.js";
import DataService from "./DataService.js";
//import dataModel from "../models/dataModel";

const DataloggerDataReceiveService = {
    loadData: async () => {
        console.log('loadData from dataloggers');
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
            return ch;
        })
        const channelsWithAllData = await Promise.all(promises);        
       
        //create promise array of queries for the last conection date for all dataloggers.
        const promisesLastConection = activeDataloggers.map(async (dl) => {
            const responseData = await DataService.getDataloggerLastConection(dl.uuid);
            dl.lastConection = responseData.data;
            return dl;
        })
        const dataloggersWithLastConectionInfo = await Promise.all(promisesLastConection);    

        dataloggersWithLastConectionInfo.forEach(dl => {
            const channelsForCurrentDatalogger = channelsWithAllData.filter(ch => ch.datalogger_id == dl.uuid);
            dl.channels = channelsForCurrentDatalogger;
            DataloggersDataStore.setLoggerData(dl.uuid, dl);   
        });
        
    }
}

export default DataloggerDataReceiveService;