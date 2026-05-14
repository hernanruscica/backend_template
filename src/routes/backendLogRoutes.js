import { Router } from 'express';
import { BackendLogController } from '../controllers/BackendLogController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.route('/backendlogs')
    .get(BackendLogController.getAll)
    .post(BackendLogController.create);

router.route('/backendlogs/:uuid')
    .get(BackendLogController.getByUuid);

export default router;