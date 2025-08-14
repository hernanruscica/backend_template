import { Router } from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
  createBusiness,
  getAllBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
} from '../controllers/businessController.js';

const router = Router();

router.route('/')
  .post(createBusiness)
  .get(getAllBusinesses);

router.route('/:id')
  .get(getBusinessById)
  .put(upload.single('image'), updateBusiness)
  .delete(deleteBusiness);

export default router;
