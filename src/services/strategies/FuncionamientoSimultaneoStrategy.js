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

    // --- CORRECCIÓN DEL ERROR DE TIPOS ---
    // 1. Obtenemos el valor crudo (puede ser null, array, string o numero)
    let rawVal01 = channel01?.lastData?.last_record_on;
    let rawVal02 = channel02?.lastData?.last_record_on;

    // 2. Si por error llega como Array [valor], extraemos el primer elemento
    if (Array.isArray(rawVal01)) rawVal01 = rawVal01[0];
    if (Array.isArray(rawVal02)) rawVal02 = rawVal02[0];

    // 3. Forzamos la conversión a Número. Si es null/undefined/NaN, usamos 0.
    const val01 = Number(rawVal01) || 0;
    const val02 = Number(rawVal02) || 0;

    // Ahora 'variables' tiene números puros garantizados (ej: 45.4 y 0)
    const variables = { value01: val01, value02: val02 };
    
    //console.log(`Ultimo registro de uso de canal 01: ${val01}`);
    //console.log(`Ultimo registro de uso de canal 02: ${val02}`);
  
    try {
      const isTriggered = evaluate(condition_logic, variables);
      
      // Solo loguear si se dispara para no llenar la consola
      if (isTriggered) {
          console.log(`${name} >>> DISPARADA - lógica: ${condition_logic} - vars: ${JSON.stringify(variables)}`);      
      }

      return { 
        triggered: isTriggered, 
        variables, 
        message: `${name} >>> condicion logica : ${condition_logic} - variables: ${JSON.stringify(variables)} - disparada: ${isTriggered}`
      };

    } catch (error) {
      console.error(`Error evaluando condición ${condition_logic} con vars ${JSON.stringify(variables)}:`, error);
      // Retornamos false para no romper el flujo del backend
      return { triggered: false, variables, error };
    }
  }
}

export default new FuncionamientoSimultaneoStrategy();