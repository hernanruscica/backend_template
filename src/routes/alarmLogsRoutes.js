import { Router } from 'express';
import { AlarmLogController } from '../controllers/AlarmLogController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply permission middleware to each route individually
router.route('/businesses/:businessUuid/alarmlogs')
  .post(permissionMiddleware, AlarmLogController.create)
  .get(permissionMiddleware, AlarmLogController.getAll);

router.route('/businesses/:businessUuid/alarmlogs/:uuid')
  .get(permissionMiddleware, AlarmLogController.getByUuid)
  .put(permissionMiddleware, AlarmLogController.updateByUuid)
  .delete(permissionMiddleware, AlarmLogController.deleteByUuid);

router.route('/businesses/:businessUuid/alarmlogs/:uuid/hard')
  .delete(permissionMiddleware, (req, res, next) => {
    req.hardDelete = true;
    next();
  }, AlarmLogController.deleteByUuid);

export default router;
