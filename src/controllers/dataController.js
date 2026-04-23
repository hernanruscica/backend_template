import DataloggersDataStore from "../stores/DataloggersDataStore.js";
import DataService from "../services/DataService.js";

//It uses DataloggersDataStore
export const getLastPorcentageUsageByChannel =  (req, res, next) => {
    try {
        const { dataloggerUuid, channelUuid } = req.params;            
        const dataloggerData = DataloggersDataStore.getLoggerData(dataloggerUuid);      
        const currentChannelData = dataloggerData?.channels?.find(ch => ch.uuid == channelUuid) || undefined;
        
        if (currentChannelData ) {
            return res.status(200).json({success: true, message: 'ok', data: currentChannelData});
        }
        return res.status(404).json({success: false, message: 'not found', data: null});     
    
    } catch (error) {
        next(error);
    }
}
//It uses DataloggersDataStore
export const getDataloggerLastData = (req, res, next) => {
    try {
        const { dataloggerUuid } = req.params;            
        const dataloggerData = DataloggersDataStore.getLoggerData(dataloggerUuid);    
        if (dataloggerData.length == 0){
            return res.status(404).json({success: false, message: 'not found', data: null}); 
        }
        
        if (dataloggerData) {
            return res.status(200).json({success: true, message: 'ok', data: dataloggerData});
        }
        return res.status(404).json({success: false, message: 'not found', data: null});     
    
    } catch (error) {
        next(error);
    }
}

//It uses DataService
export const getDataByTimePeriod = async (req, res, next) => {    
    try {
        const { channelUuid } = req.params;
        const { start, end} = req.query;
        //OK console.log(` requiryng channelUuid: ${channelUuid} start: ${start} and end: ${end}`) 
        const  responseData = await DataService.getAllAverageUsageByChannel(channelUuid, start, end);

        if (responseData?.length > 0){
            return res.status(200).json({success: true, message: 'Data Founded', count: responseData.length, data: responseData});
        }else{
            return res.status(400).json({success: false, message: 'Data Not Found', count: 0, data : [] });
        }
    } catch (error) {
        next(error);
    }
}

//It uses DataService
export const getDataDailyByTimePeriod = async (req, res, next) => {    
    try {
        const { channelUuid } = req.params;
        const { start, end} = req.query;
        
        const responseData = await DataService.getAllDailyUsageByChannel(channelUuid, start, end);
        //console.log(responseData);
        if (responseData?.length > 0){            
            return res.status(200).json({success: true, message: 'Data Founded', count: responseData.length, data: responseData});
        }else{
            return res.status(200).json({success: false, message: 'Data Not Found', count: 0, data: []});
        }
    } catch (error) {
        next(error); 
    }
}

////It uses DataService 
export const getDataWeeklyByTimePeriod = async (req, res, next) => {    
    try {
        const { channelUuid } = req.params;
        const { start, end} = req.query;
        
        const responseData = await DataService.getAllWeeklyUsageByChannel(channelUuid, start, end);
        //console.log(responseData);
        if (responseData?.length > 0){            
            return res.status(200).json({success: true, message: 'Data Founded', count: responseData.length, data: responseData});
        }else{
            return res.status(200).json({success: false, message: 'Data Not Found', count: 0, data: []});
        }
    } catch (error) {
        next(error); 
    }
}

export const getTotalOnTimeByTimePeriod = async (req, res, next) => {    
    try {
        const { channelUuid } = req.params;
        const { start, end } = req.query;
        
        const responseData = await DataService.getTotalOnTimeFromChannelByPeriod(channelUuid, start, end);
        
        if (responseData){            
            return res.status(200).json({success: true, message: 'Data Founded', data: responseData});
        }else{
            return res.status(200).json({success: false, message: 'Data Not Found', data: null});
        }
    } catch (error) {
        next(error); 
    }
}

export const getEnergyIncidents = async (req, res, next) => {    
    try {
        const { businessUuid, dataloggerUuid } = req.params;
        const { start, end } = req.query;
        
        if (!start || !end) {
            return res.status(400).json({
                success: false,
                message: 'Parametros start y end son requeridos. Ejemplo: ?start=2025-06-01&end=2025-12-31'
            });
        }

        const responseData = await DataService.getEnergyIncidents(dataloggerUuid, start, end);
        
        if (responseData.success){            
            return res.status(200).json({
                success: true,
                message: responseData.message,
                datalogger: responseData.datalogger,
                table_name: responseData.table_name,
                count: responseData.count,
                data: responseData.data
            });
        }else{
            return res.status(404).json({
                success: false,
                message: responseData.message,
                data: []
            });
        }
    } catch (error) {
        next(error); 
    }
}

/*
export const getAnalogData = async (req, res, next) => {
    try {
        const {tableName, columnPrefix, timePeriod } = req.params;     
        const currentData = await dataModel.findDataFromAnalogChannel(tableName, columnPrefix, timePeriod)
        if (currentData?.length > 0){
            return res.status(200).json({success: true, message: 'Data Founded', count: currentData.length, data: currentData});
        }else{
            return res.status(200).json({success: false, message: 'Data Not Found'});
        }
    } catch (error) {
        next(error);
    }
}
export const getLastData = async (req, res, next) => {    

    try {
        const {tableName } = req.body;
        const currentData = await dataModel.findLastDataFromTable(tableName);
        if (currentData?.length > 0){
            return res.status(200).json({message: 'Data Founded', data: currentData});
        }else{
            return res.status(400).json({message: 'Data Not Found'});
        }
    } catch (error) {
        next(error);
    }      
}
*/