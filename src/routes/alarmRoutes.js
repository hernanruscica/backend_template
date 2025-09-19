import { Router } from 'express';
import AlarmController from '../controllers/AlarmController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply permission middleware to each route individually
router.route('/')
  .post(permissionMiddleware, AlarmController.create)
  .get(permissionMiddleware, AlarmController.getAll);

router.route('/:uuid')
  .get(permissionMiddleware, AlarmController.getByUuid)
  .put(permissionMiddleware, AlarmController.updateByUuid)
  .delete(permissionMiddleware, AlarmController.deleteByUuid);

router.route('/:uuid/hard')
  .delete(permissionMiddleware, (req, res, next) => {
    req.hardDelete = true;
    next();
  }, AlarmController.deleteByUuid);

export default router;
