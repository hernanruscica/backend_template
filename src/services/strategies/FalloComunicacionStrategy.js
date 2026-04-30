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

    try {
      const isTriggered = evaluate(condition_logic, variables);
      return { triggered: isTriggered, variables, message: `Valor registrado: ${variables.value} minutos desde el último dato.` };
    } catch (error) {
      console.error(`Error evaluando fallo comunicación:`, error);
      return { triggered: false, variables, error };
    }
  }
}

export default new FalloComunicacionStrategy();