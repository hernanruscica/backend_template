import { Router } from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
  createBusiness,
  getAllBusinesses,
  getBusinessByUuid,
  updateBusinessByUuid,
  deleteBusinessByUuid,
} from '../controllers/businessController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';
import { verifyBusinessAccess } from '../middlewares/businessVerificationMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply permission middleware to each route individually
router.route('/')
  .post(permissionMiddleware, createBusiness)
  .get(permissionMiddleware, getAllBusinesses);

router.route('/:uuid')
  .get(permissionMiddleware, /*verifyBusinessAccess('Technician'), getBusinessByUuid*/)
  .put(permissionMiddleware, /*verifyBusinessAccess('Administrator'), upload.single('image'), updateBusinessByUuid*/)
  .delete(permissionMiddleware, /*verifyBusinessAccess('Administrator'), deleteBusinessByUuid*/);

router.route('/:uuid/hard')
  .delete(permissionMiddleware, /*verifyBusinessAccess('Administrator'), deleteBusinessByUuid*/);

export default router;
