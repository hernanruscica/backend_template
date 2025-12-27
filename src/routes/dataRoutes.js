import { Router } from 'express';
import { getLastPorcentageUsageByChannel, getDataByTimePeriod, getPorcentagesOn, getAnalogData, getLastData } from '../controllers/dataController.js';
//import { protect } from '../middlewares/authMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

//      /api/data
/*
findPorcentageUsageByChannel/:channelUuid?timeRange=15&lastRegister=true : 
Devuelve el porcentaje de uso del canal, si se envia el lastRegister en true, devuelve solo el ultimo dato. 
timeRange, es el tiempo en minutos del intervalo a consultar.
*/

router.route('/data/getLastPorcentageUsageByChannel/:channelUuid/:timeRange')
.get(permissionMiddleware, getLastPorcentageUsageByChannel);

/* BACKUP
router.route('/data/getporcentages/:tableName/:columnPrefix/:timePeriod/:rangePorcentage')
.get(permissionMiddleware, getPorcentagesOn);
*/

// router.get('/:table/:period', protect, getDataByTimePeriod);
// router.get('/getanalog/:tableName/:columnPrefix/:timePeriod', protect, getAnalogData);
// router.get('/getLastData', protect, getLastData);

export default router;
