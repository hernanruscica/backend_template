import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import startAlarmJob from './src/jobs/alarmJob.js';

const PORT = process.env.PORT || 5000;

console.log('Starting Alarm Monitor...');
startAlarmJob();

console.log('Starting server...');
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
