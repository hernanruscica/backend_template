import { Router } from 'express';
import { SolutionController } from '../controllers/SolutionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply permission middleware to each route individually
router.route('/businesses/:businessUuid/solutions')
  .post(permissionMiddleware, SolutionController.create)
  .get(permissionMiddleware, SolutionController.getAll);

router.route('/businesses/:businessUuid/solutions/:uuid')
  .get(permissionMiddleware, SolutionController.getByUuid)
  .put(permissionMiddleware, SolutionController.updateByUuid)
  .delete(permissionMiddleware, SolutionController.deleteByUuid); //NOT WORKING 18 DEC 2025

router.route('/businesses/:businessUuid/solutions/:uuid/hard')
  .delete(permissionMiddleware, (req, res, next) => {
    req.hardDelete = true;
    next();
  }, SolutionController.deleteByUuid); //NOT WORKING 18 DEC 2025

export default router;
