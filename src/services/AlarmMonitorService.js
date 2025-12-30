import AlarmModel from '../models/AlarmModel.js';
import { getStrategy } from './strategies/StrategyFactory.js';
import AlarmStateService from './AlarmStateService.js';

class AlarmMonitorService {
  async checkAlarms() {
    // 1. Traer SOLO las alarmas activas (Optimización de base de datos)
    // Asumo que tienes un método o filtro para 'is_active = true'
    const alarms = await AlarmModel.findAllActive(); 
    
    if (!alarms || alarms.length === 0) {
      console.log('💤 No hay alarmas activas para evaluar.');
      return;
    }

    console.log(`🔍 Evaluando ${alarms.length} alarmas...`);

    // 2. Ejecución Paralela (Optimización de Node)
    // Promise.all permite que mientras una espera la DB, otra se procese.
    const evaluationPromises = alarms.map(alarm => this.processSingleAlarm(alarm));
    
    await Promise.allSettled(evaluationPromises);
  }

  async processSingleAlarm(alarm) {
    try {
      // A. Obtener estrategia
      const strategy = getStrategy(alarm.alarm_type); // O 'alarm_type' según tu DB
      
      if (!strategy) {
        console.warn(`⚠️ No existe estrategia para el tipo: ${alarm.alarm_type} (ID: ${alarm.uuid})`);
        return;
      }

      // B. Evaluar
      const result = await strategy.evaluate(alarm);
      //console.log('evaluate result: ', result);
      
      // Si hubo un error en la evaluación, no cambiamos estado
      if (result.error) return;

      // C. Delegar cambio de estado (Trigger/Reset)
      // AlarmStateService se encarga de ver si cambió de 0 a 1 o de 1 a 0
      await AlarmStateService.handleStateChange(alarm, result.triggered, result.variables);

    } catch (error) {
      console.error(`❌ Error procesando alarma ${alarm.uuid}:`, error);
    }
  }
}

export default new AlarmMonitorService();