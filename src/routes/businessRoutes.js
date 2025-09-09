import { Router } from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import { validateCreateBusiness, validateUpdateBusiness} from '../middlewares/businessValidation.js';
import {
  createBusiness,
  getAllBusinesses,
  getBusinessByUuid,
  updateBusinessByUuid,
  deleteBusinessByUuid,
} from '../controllers/businessController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';


const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply permission middleware to each route individually
router.route('/')
  .post(permissionMiddleware, validateCreateBusiness, createBusiness)
  .get(permissionMiddleware, getAllBusinesses);

router.route('/:uuid')
  .get(permissionMiddleware, getBusinessByUuid)
  .put(permissionMiddleware, validateUpdateBusiness, updateBusinessByUuid)
  .delete(permissionMiddleware, deleteBusinessByUuid);

router.route('/:uuid/image')
  .put(permissionMiddleware, upload.single('image'), updateBusinessByUuid); // For image updates

router.route('/:uuid/hard')
  .delete(permissionMiddleware, (req, res, next) => {
    req.hardDelete = true;
    next();
  }, deleteBusinessByUuid);

export default router;
