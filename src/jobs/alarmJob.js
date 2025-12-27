import cron from 'node-cron';
import AlarmMonitorService from '../services/AlarmMonitorService.js';

let isRunning = false;

const startAlarmJob = () => {
  // Ejecutar cada 5 minutos: '*/5 * * * *' o 30 segundos: '*/30 * * * * *'
  cron.schedule('*/30 * * * * *', async () => {
    if (isRunning) {
      console.log('⚠️ El job anterior de alarmas sigue corriendo. Saltando esta ejecución.');
      return;
    }

    isRunning = true;
    try {
      console.log('⏰ Iniciando chequeo de alarmas...');
      await AlarmMonitorService.checkAlarms();
    } catch (error) {
      console.error('❌ Error crítico en el job de alarmas:', error);
    } finally {
      isRunning = false;
      console.log('🏁 Chequeo de alarmas finalizado.');
    }
  });
};

export default startAlarmJob;