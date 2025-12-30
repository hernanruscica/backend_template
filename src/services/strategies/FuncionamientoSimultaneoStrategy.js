import DataloggersDataStore from '../../stores/DataloggersDataStore.js';
import { evaluate } from 'mathjs';

class FuncionamientoSimultaneoStrategy {
  async evaluate(alarm) {
    const { datalogger_uuid, channel_uuid, var05 : channel02_uuid, condition_logic, name } = alarm;
    
    const currentDatalogger = DataloggersDataStore.getLoggerData(datalogger_uuid);        
    const dataloggersChannels =  currentDatalogger?.channels || [];
    const channel01 = dataloggersChannels.find(dc => dc.uuid == channel_uuid)
    const channel02 = dataloggersChannels.find(dc => dc.uuid == channel02_uuid)
    
    const channelsBelongsToDatalogger = typeof channel01 == 'object' && typeof channel02 == 'object';
    
    if (!channelsBelongsToDatalogger) {
      const errorMesagge = "alarm info wrong: 1 or 2 Channels dont belongs to the datalogger";      
      return { triggered: false, errorMesagge: errorMesagge };
    };

    const lastRecordOn01 = channel01.lastData.last_record_on;
    const lastRecordOn02 = channel02.lastData.last_record_on;
    const variables = {value01: lastRecordOn01, value02: lastRecordOn02};
    
    //console.log(`Ultimo registro de uso de canal 01: ${lastRecordOn01}`);
    //console.log(`Ultimo registro de uso de canal 02: ${lastRecordOn02}`);
  
    try {
      const isTriggered = evaluate(condition_logic, variables);
      console.log(`${name} >>> condicion logica : ${condition_logic} - variables: ${JSON.stringify(variables)} - disparada: ${isTriggered}`);      
      return { triggered: isTriggered, variables };
    } catch (error) {
      console.error(`Error evaluando condición ${condition_logic}:`, error);
      return { triggered: false, variables, error };
    }
  }
}

export default new FuncionamientoSimultaneoStrategy();