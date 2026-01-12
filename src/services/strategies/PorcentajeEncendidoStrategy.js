import DataloggersDataStore from '../../stores/DataloggersDataStore.js';
import { evaluate } from 'mathjs';

class PorcentajeEncendidoStrategy {
  async evaluate(alarm) {
    const { datalogger_uuid, channel_uuid, condition_logic, name } = alarm;
    
    const currentDatalogger = DataloggersDataStore.getLoggerData(datalogger_uuid);        
    const dataloggersChannels =  currentDatalogger?.channels || [];
    const currentChannel = dataloggersChannels.find(dc => dc.uuid == channel_uuid)

    //console.log('currentChannel',(typeof currentChannel == 'object') ? currentChannel.name : 'no identificado');    
    const channelBelongsToDatalogger = typeof currentChannel == 'object';
    
    if (!channelBelongsToDatalogger) {
      const errorMesagge = "alarm info wrong: Channel dont belongs to the datalogger";      
      return { triggered: false, errorMesagge: errorMesagge };
    };

    const porcentageUsagePeriod = currentChannel.lastData.porcentageUsagePeriod;
    const variables = {value: porcentageUsagePeriod};
    /*
    console.log(`Ultimo porcentaje de uso: ${porcentageUsagePeriod}`);
    console.log('canal:', currentChannel.name);
    console.log('channel uuid:', currentChannel.uuid);       
   */
    try {
      const isTriggered = evaluate(condition_logic, variables);
      console.log(`${name} >>> condicion logica : ${condition_logic} - valor ${variables.value} -  variables: ${JSON.stringify(variables)} - disparada: ${isTriggered}`);      
      return { triggered: isTriggered, variables, message: `Valor registrado: ${variables.value}.` };
    } catch (error) {
      console.error(`Error evaluando condición ${condition_logic}:`, error);
      return { triggered: false, variables, error };
    }
  }
}

export default new PorcentajeEncendidoStrategy();