import { Router } from 'express';
import UserBusinessController from '../controllers/UserBusinessController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes for user-businesses associations
router.route('/businesses/:businessUuid/user-businesses')
    .post(permissionMiddleware, UserBusinessController.create)//ok
    .get(permissionMiddleware, UserBusinessController.getAll);//ok

router.route('/businesses/:businessUuid/user-businesses/:uuid')
    .get(permissionMiddleware, UserBusinessController.getByUuid)//ok
    .put(permissionMiddleware, UserBusinessController.updateByUuid)
    .delete(permissionMiddleware, UserBusinessController.deleteByUuid);

router.route('/businesses/:businessUuid/user-businesses/:uuid/hard')
    .delete(permissionMiddleware, (req, res, next) => {
        req.hardDelete = true;
        next();
    }, UserBusinessController.deleteByUuid);

export default router;
