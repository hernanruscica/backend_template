import { Router } from 'express';
import { getLastPorcentageUsageByChannel, getDataloggerLastData, getDataByTimePeriod, getDataDailyByTimePeriod, getDataWeeklyByTimePeriod, getTotalOnTimeByTimePeriod, getEnergyIncidents } from '../controllers/dataController.js';
//import { protect } from '../middlewares/authMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

//      /api/data
router.route('/data/getLastPorcentageUsageByChannel/businesses/:businessUuid/:dataloggerUuid/:channelUuid')
.get(permissionMiddleware, getLastPorcentageUsageByChannel);

///data/getDataloggerLastData/:dataloggerUuid
router.route('/data/getDataloggerLastData/businesses/:businessUuid/:dataloggerUuid')
.get(permissionMiddleware, getDataloggerLastData);

// required filter queries: 'start' and 'end'. Example: ?start='2025-12-01'&end='2025-12-31'
router.route('/data/allregisters/businesses/:businessUuid/:channelUuid')
.get(permissionMiddleware, getDataByTimePeriod);

// required filter queries: 'start' and 'end'. Example: ?start='2025-12-01'&end='2025-12-31'
router.route('/data/alldaily/businesses/:businessUuid/:channelUuid')
.get(permissionMiddleware, getDataDailyByTimePeriod);

//getDataWeeklyByTimePeriod
router.route('/data/allweekly/businesses/:businessUuid/:channelUuid')
.get(permissionMiddleware, getDataWeeklyByTimePeriod);

// required filter queries: 'start' and 'end'. Example: ?start='2025-12-01'&end='2025-12-31'
router.route('/data/totalontime/businesses/:businessUuid/:channelUuid')
.get(permissionMiddleware, getTotalOnTimeByTimePeriod);

// required filter queries: 'start' and 'end'. Example: ?start='2025-06-01'&end='2025-12-31'
router.route('/data/energyincidents/businesses/:businessUuid/:dataloggerUuid')
.get(permissionMiddleware, getEnergyIncidents);

//router.get('/:table/:period', protect, getDataByTimePeriod);
// router.get('/getanalog/:tableName/:columnPrefix/:timePeriod', protect, getAnalogData);
// router.get('/getLastData', protect, getLastData);

export default router;
