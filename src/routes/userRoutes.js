import { Router } from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
  createUser,
  getAllUsers,
  getUserByUuid,
  updateUserByUuid,
  deleteUserByUuid,
} from '../controllers/userController.js';
import { validateCreateUser, validateUpdateUser } from '../middlewares/userValidation.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply permission middleware to each route individually
router.route('/businesses/:businessUuid/users/')
  .post(permissionMiddleware, validateCreateUser, createUser)
  .get(permissionMiddleware, getAllUsers);

  
router.route('/businesses/:businessUuid/users/:uuid')
  .get(permissionMiddleware,  getUserByUuid)
  .put(permissionMiddleware,  validateUpdateUser, updateUserByUuid) // For JSON data updates
  .delete(permissionMiddleware, deleteUserByUuid);

router.route('/businesses/:businessUuid/users/:uuid/image')
  .put(permissionMiddleware, upload.single('image'), updateUserByUuid); // For image updates

router.route('/businesses/:businessUuid/users/:uuid/hard')
  .delete(permissionMiddleware, (req, res, next) => {
    req.hardDelete = true;
    next();
  }, deleteUserByUuid);

export default router;
