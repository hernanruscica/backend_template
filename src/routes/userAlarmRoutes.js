import { Router } from 'express';
import UserAlarmController from '../controllers/UserAlarmController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Route for current user's subscribed alarms (no businessUuid required)
// Validation is done in service, not middleware
router.route('/users/alarms')
    .get(UserAlarmController.getMyAlarms);

router.route('/users/alarms/:userUuid')
    .get(UserAlarmController.getAlarmsByUserUuid);

// Routes for user-alarm associations
router.route('/businesses/:businessUuid/users-alarms')
    .post(permissionMiddleware, UserAlarmController.create);
    //.get(permissionMiddleware, UserAlarmController.getAll); 

router.route('/businesses/:businessUuid/users-alarms/:uuid')
    .get(permissionMiddleware, UserAlarmController.getByUuid)
    .put(permissionMiddleware, UserAlarmController.updateByUuid)
    .delete(permissionMiddleware, UserAlarmController.deleteByUuid);

router.route('/businesses/:businessUuid/users-alarms/alarm/:alarmUuid')
    .get(permissionMiddleware, UserAlarmController.getUsersByAlarmUuid);

router.route('/businesses/:businessUuid/users-alarms/:uuid/hard')
    .delete(permissionMiddleware, (req, res, next) => {
        req.hardDelete = true;
        next();
    }, UserAlarmController.deleteByUuid);

export default router;
