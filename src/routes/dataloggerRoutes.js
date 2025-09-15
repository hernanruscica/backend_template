import { Router } from 'express';
import DataloggerController  from '../controllers/DataloggerController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply permission middleware to each route individually
router.route('/')
  .post(permissionMiddleware, DataloggerController.create)
  .get(permissionMiddleware, DataloggerController.getAll);

router.route('/:uuid')
  .get(permissionMiddleware, DataloggerController.getByUuid)
  .put(permissionMiddleware, DataloggerController.updateByUuid)
  .delete(permissionMiddleware, DataloggerController.deleteByUuid);

router.route('/:uuid/hard')
  .delete(permissionMiddleware, (req, res, next) => {
    req.hardDelete = true;
    next();
  }, DataloggerController.deleteByUuid);

export default router;
