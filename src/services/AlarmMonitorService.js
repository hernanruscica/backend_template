import AlarmModel from '../models/AlarmModel.js';
import { getStrategy } from './strategies/StrategyFactory.js';
import AlarmStateService from './AlarmStateService.js';

class AlarmMonitorService {
  async checkAlarms() {
    const alarms = await AlarmModel.findAllActive(); 
    
    if (!alarms || alarms.length === 0) {
      // console.log('💤 No hay alarmas activas para evaluar.');
      return { total: 0, triggered: 0, reset: 0, no_strategy: 0, errors: 0, details: [] };
    }

    // console.log(`🔍 Evaluando ${alarms.length} alarmas...`);

    const evaluationPromises = alarms.map(alarm => this.processSingleAlarm(alarm));
    
    const settled = await Promise.allSettled(evaluationPromises);
    const details = settled.filter(r => r.status === 'fulfilled').map(r => r.value);

    return {
      total: alarms.length,
      triggered: details.filter(a => a.status === 'triggered').length,
      reset: details.filter(a => a.status === 'reset').length,
      no_strategy: details.filter(a => a.status === 'no_strategy').length,
      errors: details.filter(a => a.status === 'exception' || a.status === 'evaluation_error').length,
      details
    };
  }

  async processSingleAlarm(alarm) {
    try {
      const strategy = getStrategy(alarm.alarm_type);
      
      if (!strategy) {
        // console.warn(`⚠️ No existe estrategia para el tipo: ${alarm.alarm_type} (ID: ${alarm.uuid})`);
        return { uuid: alarm.uuid, name: alarm.name, status: 'no_strategy' };
      }

      const result = await strategy.evaluate(alarm);
      
      if (result.error) {
        return { uuid: alarm.uuid, name: alarm.name, status: 'evaluation_error', error: result.error };
      }

      const stateResult = await AlarmStateService.handleStateChange(alarm, result.triggered, result.variables, result.message);

      return {
        uuid: alarm.uuid,
        name: alarm.name,
        alarm_type: alarm.alarm_type,
        channel_uuid: alarm.channel_uuid,
        status: stateResult.changed ? stateResult.newState : 'no_change',
        value: result.variables?.value || null
      };

    } catch (error) {
      // console.error(`❌ Error procesando alarma ${alarm.uuid}:`, error);
      return { uuid: alarm.uuid, name: alarm.name, status: 'exception', error: error.message };
    }
  }
}

export default new AlarmMonitorService();