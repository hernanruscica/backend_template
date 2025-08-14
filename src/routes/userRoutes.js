import { Router } from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

const router = Router();

router.route('/')
  .post(createUser)
  .get(getAllUsers);

router.route('/:id')
  .get(getUserById)
  .put(upload.single('image'), updateUser)
  .delete(deleteUser);

export default router;
