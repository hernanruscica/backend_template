import dataModel from "../models/dataModel.js";

const DataService = {

    getLastPorcentageUsageByChannel: async (channelUuid, timeRange ) => {
        try {
            const channelData = await dataModel.findChannelBasicData(channelUuid)
            if (channelData.length === 0){
                return []
            }                      
            
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
    }
}

export default DataService;