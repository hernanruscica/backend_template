import { Router } from 'express';
import { getLastPorcentageUsageByChannel, getDataloggerLastData, getDataByTimePeriod, getDataDailyByTimePeriod, getDataWeeklyByTimePeriod } from '../controllers/dataController.js';
//import { protect } from '../middlewares/authMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

//      /api/data
router.route('/data/getLastPorcentageUsageByChannel/:dataloggerUuid/:channelUuid')
.get(permissionMiddleware, getLastPorcentageUsageByChannel);

///data/getDataloggerLastData/:dataloggerUuid
router.route('/data/getDataloggerLastData/:dataloggerUuid')
.get(permissionMiddleware, getDataloggerLastData);

// required filter queries: 'start' and 'end'. Example: ?start='2025-12-01'&end='2025-12-31'
router.route('/data/allregisters/:channelUuid')
.get(permissionMiddleware, getDataByTimePeriod);

// required filter queries: 'start' and 'end'. Example: ?start='2025-12-01'&end='2025-12-31'
router.route('/data/alldaily/:channelUuid')
.get(permissionMiddleware, getDataDailyByTimePeriod);

//getDataWeeklyByTimePeriod
router.route('/data/allweekly/:channelUuid')
.get(permissionMiddleware, getDataWeeklyByTimePeriod);

//router.get('/:table/:period', protect, getDataByTimePeriod);
// router.get('/getanalog/:tableName/:columnPrefix/:timePeriod', protect, getAnalogData);
// router.get('/getLastData', protect, getLastData);

export default router;
