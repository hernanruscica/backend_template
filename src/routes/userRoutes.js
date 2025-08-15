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
router.route('/')
  .post(permissionMiddleware, validateCreateUser, createUser)
  .get(permissionMiddleware, getAllUsers);

router.route('/:uuid')
  .get(permissionMiddleware, getUserByUuid)
  .put(permissionMiddleware, upload.single('image'), validateUpdateUser, updateUserByUuid)
  .delete(permissionMiddleware, deleteUserByUuid);

export default router;
