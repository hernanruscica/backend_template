import DataloggerModel from "../models/DataloggerModel.js";
import dataModel from "../models/dataModel.js";

const DataService = {

    getLastPorcentageUsageByChannel: async (channelUuid, timeRange ) => {
        try {
            const channelData = await dataModel.findChannelBasicData(channelUuid)
            if (channelData.length === 0){
                return []
            };                     
            
            const { table_name, column_name } = channelData[0];
            const data = await dataModel.findLastDataFromChannel(table_name, column_name, timeRange);   
            data.channelUuid = channelUuid;
            data.porcentageUsagePeriod = data.total_time_period !== 0 
                ? (( data.total_time_on * 100 ) / data.total_time_period).toFixed(2)
                : 0;   
            data.timeRange = timeRange;     
            
            return data;
        } catch (error) {
            console.log(error);
        }
    },
    getDataloggerLastConection: async (dataloggerUuid) => {
        try {
            const dataloggerData = await DataloggerModel.findByUuid(dataloggerUuid);
            //console.log('dataloggerData.table_name', dataloggerData.table_name);
            if (!dataloggerData)
                return null;            
            const lastConection = await dataModel.findDataloggerLastConection(dataloggerData.table_name)

            return lastConection[0]
            
            //const lastConectionDate = await dataModel.findDataloggerLastConection(dataloggerUuid);
        } catch (error) {
         console.log('error', error);
            
        }
    },    
    getTotalOnTimeFromChannel: async (channelUuid) => {
        try {
            const channelData = await dataModel.findChannelBasicData(channelUuid)
            if (channelData.length === 0){
                return []
            };
            const { table_name, column_name } = channelData[0];
        
            const responseData = await dataModel.findTotalOnTimeFromChannel(table_name, column_name);
            
            const data = responseData[0];
           // console.log('data on getTotalOnTimeFromChannel', data);

            data.porcentageUsagePeriod = data.total_time_period !== 0 
                ? (( data.total_time_on * 100 ) / data.total_time_period).toFixed(2)
                : 0; 
            
            return data;
            
        } catch (error) {
            console.log('error', error);
        }
    }
}

export default DataService;