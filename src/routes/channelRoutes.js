import { Router } from 'express';
import { channelController } from '../controllers/ChannelController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply permission middleware to each route individually
router.route('/')
  .post(permissionMiddleware, channelController.create)
  .get(permissionMiddleware, channelController.getAll);

router.route('/:uuid')
  .get(permissionMiddleware, channelController.getByUuid)
  .put(permissionMiddleware, channelController.updateByUuid)
  .delete(permissionMiddleware, channelController.deleteByUuid);

router.route('/:uuid/hard')
  .delete(permissionMiddleware, (req, res, next) => {
    req.hardDelete = true;
    next();
  }, channelController.deleteByUuid);

export default router;
