//import DataModel from '../../models/dataModel.js';
import { evaluate } from 'mathjs';
import DataloggersDataStore from '../../stores/DataloggersDataStore.js';
import { getSecondsSince } from '../../utils/dateUtils.js';

class FalloComunicacionStrategy {
  async evaluate(alarm) {
    const { datalogger_uuid, condition_logic, name } = alarm;
    //console.log('FalloComunicacionStrategy - channelUuid:', alarm.channel_uuid);
    
    //para las alarmas de desconexion, guardo en datalogger_uuid el dataloggerUuid para poder consultar en el dataloggerStore
    const currentDatalogger = DataloggersDataStore.getLoggerData(datalogger_uuid);
    const secondsFromLastConection = getSecondsSince(currentDatalogger.lastConection);
    const variables = {value: parseFloat(secondsFromLastConection / 60).toFixed(2)};
    /* 
    console.log(`Nombre del datalogger ${currentDatalogger.name}`);    
    console.log(`Segundos desde la ultima conexion: ${secondsFromLastConection}`);
    console.log('condition logic:', condition_logic);
    console.log('Variables:', variables);      
    ejemplos de datos reales
    Nombre del datalogger Cocina MDV srl
    Segundos desde la ultima conexion: 257333
    condition logic: value < 5
    Variables: { value: 4288.883333333333 }
    */

    // Evaluar
    try {
      const isTriggered = evaluate(condition_logic, variables);
      console.log(`${name} >>> condicion logica : ${condition_logic} - variables: ${JSON.stringify(variables)} - disparada: ${isTriggered}`);
      return { triggered: isTriggered, variables };
    } catch (error) {
      console.error(`Error evaluando fallo comunicación:`, error);
      return { triggered: false, variables, error };
    }
  }
}

export default new FalloComunicacionStrategy();