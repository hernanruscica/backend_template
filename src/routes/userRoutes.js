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
import { verifySameBusiness } from '../middlewares/businessVerificationMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply permission middleware to each route individually
router.route('/')
  .post(permissionMiddleware, validateCreateUser, createUser)
  .get(permissionMiddleware, getAllUsers);

  
router.route('/:uuid')
  .get(permissionMiddleware,  getUserByUuid)
  .put(permissionMiddleware,  validateUpdateUser, updateUserByUuid) // For JSON data updates
  .delete(permissionMiddleware, deleteUserByUuid);

router.route('/:uuid/image')
  .put(permissionMiddleware, upload.single('image'), updateUserByUuid); // For image updates

router.route('/:uuid/hard')
  .delete(permissionMiddleware, deleteUserByUuid);

export default router;
