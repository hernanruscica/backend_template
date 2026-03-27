import { Router } from 'express';
import MaintenanceLogController from '../controllers/MaintenanceLogController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.route('/businesses/:businessUuid/dataloggers/:dataloggerUuid/maintenance-logs')
    .post(permissionMiddleware, MaintenanceLogController.create)
    .get(permissionMiddleware, MaintenanceLogController.getAll);

router.route('/businesses/:businessUuid/dataloggers/:dataloggerUuid/maintenance-logs/:uuid')
    .get(permissionMiddleware, MaintenanceLogController.getByUuid)
    .put(permissionMiddleware, MaintenanceLogController.updateByUuid)
    .delete(permissionMiddleware, MaintenanceLogController.deleteByUuid);

router.route('/businesses/:businessUuid/dataloggers/:dataloggerUuid/maintenance-logs/:uuid/complete')
    .put(permissionMiddleware, MaintenanceLogController.complete);

router.route('/businesses/:businessUuid/dataloggers/:dataloggerUuid/maintenance-logs/:uuid/hard')
    .delete(permissionMiddleware, (req, res, next) => {
        req.hardDelete = true;
        next();
    }, MaintenanceLogController.deleteByUuid);

router.route('/businesses/:businessUuid/dataloggers/:dataloggerUuid/channels/:channelUuid/maintenance-logs')
    .post(permissionMiddleware, MaintenanceLogController.create)
    .get(permissionMiddleware, MaintenanceLogController.getAll);

router.route('/businesses/:businessUuid/dataloggers/:dataloggerUuid/channels/:channelUuid/maintenance-logs/:uuid')
    .get(permissionMiddleware, MaintenanceLogController.getByUuid)
    .put(permissionMiddleware, MaintenanceLogController.updateByUuid)
    .delete(permissionMiddleware, MaintenanceLogController.deleteByUuid);

router.route('/businesses/:businessUuid/dataloggers/:dataloggerUuid/channels/:channelUuid/maintenance-logs/:uuid/complete')
    .put(permissionMiddleware, MaintenanceLogController.complete);

router.route('/businesses/:businessUuid/dataloggers/:dataloggerUuid/channels/:channelUuid/maintenance-logs/:uuid/hard')
    .delete(permissionMiddleware, (req, res, next) => {
        req.hardDelete = true;
        next();
    }, MaintenanceLogController.deleteByUuid);

export default router;
