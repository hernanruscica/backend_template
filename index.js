import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import startDataloggerDataReceiveJob from './src/jobs/DataloggerDataReceiveJob.js';
import startMaintenanceAlertJob from './src/jobs/MaintenanceAlertJob.js';


const PORT = process.env.PORT || 5000;


startDataloggerDataReceiveJob();
startMaintenanceAlertJob();


console.log('Starting server...');
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
