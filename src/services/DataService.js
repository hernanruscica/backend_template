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
                ? parseFloat((( data.total_time_on * 100 ) / data.total_time_period).toFixed(2))
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
            //console.log('lastConection', lastConection);

            return lastConection.length > 0 ? lastConection[0] : null;
            
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
            /*
            data.porcentageUsagePeriod = data.total_time_period !== 0 
                ? (( data.total_time_on * 100 ) / data.total_time_period).toFixed(2)
                : 0; 
            */
            return data;
            
        } catch (error) {
            console.log('error', error);
        }
    },
    getTotalOnTimeFromChannelByPeriod: async (channelUuid, startInterval, stopInterval) => {
        try {
            const channelData = await dataModel.findChannelBasicData(channelUuid)
            if (channelData.length === 0){
                return []
            };
            const { table_name, column_name } = channelData[0];
        
            const responseData = await dataModel.findTotalOnTimeFromChannelByPeriod(table_name, column_name, startInterval, stopInterval);
            
            return responseData[0];
            
        } catch (error) {
            console.log('error', error);
        }
    },
    //findRollingAverageData (tableName, columnPrefix, averagingPeriod, startInterval, stopInterval)
    getAllAverageUsageByChannel: async (channelUuid, startInterval, stopInterval) => {
        try {
            const channelData = await dataModel.findChannelBasicData(channelUuid)
            if (channelData.length === 0){
                return []
            };
            const { table_name, column_name, averaging_period } = channelData[0];
            const data = await dataModel.findRollingAverageData(table_name, column_name, averaging_period, startInterval, stopInterval );
            //console.log('data from getAllAverageUsageByChannel service: ',data);
            return data;
        } catch (error) {
            console.log('error', error);            
        }
    },
    //findDailyAverageByPeriod  (tableName, columnPrefix, startInterval, stopInterval)
    getAllDailyUsageByChannel: async (channelUuid, startInterval, stopInterval) => {
        try {
            const channelData = await dataModel.findChannelBasicData(channelUuid)
            if (channelData.length === 0){
                return []
            };
            const { table_name, column_name } = channelData[0];
            const data = await dataModel.findDailyAverageByPeriod(table_name, column_name, startInterval, stopInterval);
            return data;
        } catch (error) {
            console.log('error', error);
            
        }
    },
    // findtWeeklyAverageByPeriod (tableName, columnPrefix, startInterval, stopInterval)
    getAllWeeklyUsageByChannel: async (channelUuid, startInterval, stopInterval) => {
        try {
            const channelData = await dataModel.findChannelBasicData(channelUuid)
            if (channelData.length === 0){
                return []
            };
            const { table_name, column_name } = channelData[0];
            const data = await dataModel.findtWeeklyAverageByPeriod(table_name, column_name, startInterval, stopInterval);
            return data;
        } catch (error) {
            console.error('error', error);
            
        }
    },

    getEnergyIncidents: async (dataloggerUuid, startInterval, stopInterval) => {
        try {
            const dataloggerData = await DataloggerModel.findByUuid(dataloggerUuid);
            if (!dataloggerData || !dataloggerData.table_name) {
                return { success: false, message: 'Datalogger no encontrado o sin tabla asociada', data: [] };
            }

            const incidents = await dataModel.findEnergyIncidents(
                dataloggerData.table_name,
                startInterval,
                stopInterval
            );

            return {
                success: true,
                message: 'Incidentes de energia encontrados',
                datalogger: dataloggerData.name,
                table_name: dataloggerData.table_name,
                count: incidents.length,
                data: incidents
            };
        } catch (error) {
            console.error('error', error);
            return { success: false, message: 'Error al obtener incidentes', data: [] };
        }
    }
}

export default DataService;