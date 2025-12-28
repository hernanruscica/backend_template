import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
//import startAlarmJob from './src/jobs/alarmJob.js';
import startDataloggerDataReceiveJob from './src/jobs/DataloggerDataReceiveJob.js';
//import StartChannelsLongTermDataJob from './src/jobs/ChannelsLongTermDataJob.js';

const PORT = process.env.PORT || 5000;

//console.log('Starting Alarm Monitor...');
//startAlarmJob();
startDataloggerDataReceiveJob();
//StartChannelsLongTermDataJob();

console.log('Starting server...');
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
