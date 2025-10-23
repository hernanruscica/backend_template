import { Router } from 'express';
import { getDataByTimePeriod, getPorcentagesOn, getAnalogData, getLastData } from '../controllers/dataController.js';
//import { protect } from '../middlewares/authMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

//      /api/data
router.route('/data/getporcentages/:tableName/:columnPrefix/:timePeriod/:rangePorcentage')
.get(permissionMiddleware, getPorcentagesOn);
// router.get('/:table/:period', protect, getDataByTimePeriod);
// router.get('/getanalog/:tableName/:columnPrefix/:timePeriod', protect, getAnalogData);
// router.get('/getLastData', protect, getLastData);

export default router;
