import cron from 'node-cron';
import DataloggerDataReceiveService from '../services/DataloggerDataReceiveService.js';
import AlarmMonitorService from '../services/AlarmMonitorService.js';

let isRunning = false;

const startDataloggerDataReceiveJob = () => {
  // Ejecutar cada 5 minutos: '*/5 * * * *' o 30 segundos: '*/30 * * * * *'
  cron.schedule('*/5 * * * *', async () => {
    if (isRunning) {
      console.log('⚠️ El job anterior de DataloggersDataReceive sigue corriendo. Saltando esta ejecución.');
      return;
    }

    isRunning = true;
    try {

      console.log('⏰ Iniciando recepcion de datos de la BD de Hostinger...');
      await DataloggerDataReceiveService.loadData();

      console.log('⏰ Iniciando chequeo de alarmas...');
      await AlarmMonitorService.checkAlarms();

    } catch (error) {
      console.error('❌ Error crítico en el job de Recepcion de datos de dataloggers de hostingers:', error);
    } finally {
      isRunning = false;
      console.log('🏁 Recepcion de datos de los dataloggers y Chequeo de Alarmas finalizado.');
    }
  });
};

export default startDataloggerDataReceiveJob;