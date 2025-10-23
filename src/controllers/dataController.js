import dataModel from "../models/dataModel.js";
import { calculatePorcentageOn } from '../utils/MathUtils.js';

export const getDataByTimePeriod = async (req, res, next) => {    
    try {
        const {table, period} = req.params;
        //console.log(table, timePeriod)
        const currentData = await dataModel.findAllByTimePeriod(table, period)
        if (currentData?.length > 0){
            return res.status(200).json({message: 'Data Founded', count: currentData.length, data: currentData});
        }else{
            return res.status(400).json({message: 'Data Not Found'});
        }
    } catch (error) {
        next(error);
    }
}
/*
getPorcentageOn: returns an array with objets. These are the data from a digital channel
- tableName is the name of the table on DB 
- columnPrefix is the prefix for the channel column
- timePeriod is the quantity of minutes from NOW, to take the data 
- rangePorcentage is the quantity of minutes from NOW, to make the individual porcentage for each register. 
*/
export const getPorcentagesOn = async (req, res, next) => {    
    try {
        const {tableName, columnPrefix, timePeriod, rangePorcentage } = req.params;
        
        const currentData = await dataModel.findDataFromDigitalChannel(tableName, columnPrefix, timePeriod);
        console.log(currentData);
        if (currentData?.length > 0){
            const rangePorcentageSecs = rangePorcentage * 60;
            const dataPorcentagesOn = calculatePorcentageOn(currentData, rangePorcentageSecs)
            return res.status(200).json({success: true, message: 'Data Founded', count: dataPorcentagesOn.length, data: dataPorcentagesOn});
        }else{
            return res.status(200).json({success: false, message: 'Data Not Found'});
        }
    } catch (error) {
        next(error);
    }
}
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
       /* 
      console.log(req.body.tableName) ;*/
}