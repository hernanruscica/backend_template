import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import startDataloggerDataReceiveJob from './src/jobs/DataloggerDataReceiveJob.js';
import startMaintenanceAlertJob, { checkMaintenanceAlerts } from './src/jobs/MaintenanceAlertJob.js';
import logger from './src/services/loggerService.js';


const PORT = process.env.PORT || 5000;


startDataloggerDataReceiveJob();
startMaintenanceAlertJob();

// console.log('🔧 Ejecutando chequeo de mantenimiento al iniciar servidor...');
logger.info('cronjob', 'Ejecutando chequeo de mantenimiento al iniciar servidor');
checkMaintenanceAlerts().catch(err => {
  // console.error('Error en checkMaintenanceAlerts al inicio:', err);
  logger.error('cronjob', 'Error en chequeo de mantenimiento al inicio', { error: err.message });
});

console.log('Starting server...');
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
