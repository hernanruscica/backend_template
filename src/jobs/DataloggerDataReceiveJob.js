import cron from 'node-cron';
import DataloggerDataReceiveService from '../services/DataloggerDataReceiveService.js';
import AlarmMonitorService from '../services/AlarmMonitorService.js';
import logger from '../services/loggerService.js';

let isRunning = false;

const startDataloggerDataReceiveJob = () => {
  // Ejecutar cada 5 minutos: '*/5 * * * *' o 30 segundos: '*/30 * * * * *'
  cron.schedule('*/5 * * * *', async () => {
    if (isRunning) {
      // console.log('⚠️ El job anterior de DataloggersDataReceive sigue corriendo. Saltando esta ejecución.');
      await logger.warn('cronjob', 'Job anterior de dataloggers ejecutándose, saltando esta ejecución');
      return;
    }

    isRunning = true;
    try {

      // console.log('⏰ Iniciando recepcion de datos de la BD de Hostinger...');
      await logger.info('cronjob', 'Iniciando recepción de datos de dataloggers desde Hostinger');
      const result = await DataloggerDataReceiveService.loadData();

      const successCount = result.successfulDataloggers.length;
      const rejectedDlCount = result.rejectedDataloggers.length;
      const rejectedChCount = result.rejectedChannels.length;

      const details = `Se procesaron ${successCount} dataloggers: ${successCount - rejectedDlCount} exitosos, ${rejectedDlCount} fallaron en conexión, ${rejectedChCount} canales fallaron al cargar datos`;

      const extraData = {
        dataloggers: result.successfulDataloggers.map(dl => ({
          uuid: dl.uuid,
          name: dl.name,
          last_conection_value: dl.lastConection?.value || null,
          last_conection_date: dl.lastConection?.fecha_hora || null,
          channels: dl.channels.map(ch => ({
            uuid: ch.uuid,
            name: ch.name,
            averaging_period: ch.averaging_period,
            last_percentage: ch.lastData?.value || null,
            total_time_on_hours: ch.totalData?.total_time_on_hours || null
          }))
        })),
        rejected_dataloggers: result.rejectedDataloggers.map(r => r.reason?.message || r.reason),
        rejected_channels: result.rejectedChannels.map(r => r.reason?.message || r.reason)
      };

      await logger.info('cronjob', details, extraData);

      // console.log('⏰ Iniciando chequeo de alarmas...');
      await logger.info('cronjob', 'Iniciando chequeo de alarmas');
      const alarmResult = await AlarmMonitorService.checkAlarms();

      const alarmDetails = `Se evaluaron ${alarmResult.total} alarmas activas: ${alarmResult.triggered} disparadas, ${alarmResult.reset} reseteadas, ${alarmResult.no_strategy} sin estrategia, ${alarmResult.errors} con errores`;

      const alarmExtraData = {
        triggered: alarmResult.details.filter(a => a.status === 'triggered').map(a => ({
          uuid: a.uuid, name: a.name, alarm_type: a.alarm_type, value: a.value
        })),
        reset: alarmResult.details.filter(a => a.status === 'reset').map(a => ({
          uuid: a.uuid, name: a.name
        })),
        no_strategy: alarmResult.details.filter(a => a.status === 'no_strategy').map(a => ({
          uuid: a.uuid, name: a.name
        })),
        errors: alarmResult.details.filter(a => a.status === 'exception' || a.status === 'evaluation_error').map(a => ({
          uuid: a.uuid, name: a.name, error: a.error
        }))
      };

      await logger.info('cronjob', alarmDetails, alarmExtraData);

    } catch (error) {
      // console.error('❌ Error crítico en el job de Recepcion de datos de dataloggers de hostingers:', error);
      await logger.error('cronjob', 'Error crítico en job de dataloggers', { error: error.message });
    } finally {
      isRunning = false;
    }
  });
};

export default startDataloggerDataReceiveJob;