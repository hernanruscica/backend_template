import { Router } from 'express';
import { getLastPorcentageUsageByChannel, getDataloggerLastData, getDataByTimePeriod, getPorcentagesOn, getAnalogData, getLastData } from '../controllers/dataController.js';
//import { protect } from '../middlewares/authMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

//      /api/data
/*
findPorcentageUsageByChannel/:channelUuid : 
Devuelve el porcentaje de uso del canal en el periodo de tiempo para promediar definido en el canal, que es el mismo que el de la alarma.
*/

router.route('/data/getLastPorcentageUsageByChannel/:dataloggerUuid/:channelUuid')
.get(permissionMiddleware, getLastPorcentageUsageByChannel);

///data/getDataloggerLastData/:dataloggerUuid
router.route('/data/getDataloggerLastData/:dataloggerUuid')
.get(permissionMiddleware, getDataloggerLastData);


// router.get('/:table/:period', protect, getDataByTimePeriod);
// router.get('/getanalog/:tableName/:columnPrefix/:timePeriod', protect, getAnalogData);
// router.get('/getLastData', protect, getLastData);

export default router;
