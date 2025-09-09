import { Router } from 'express';
import ProductController from '../controllers/productController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', permissionMiddleware, ProductController.create);
router.get('/', permissionMiddleware, ProductController.getAll);
router.get('/:uuid', permissionMiddleware, ProductController.getByUuid);
router.put('/:uuid', permissionMiddleware, ProductController.updateByUuid);
router.delete('/:uuid', permissionMiddleware, ProductController.deleteByUuid);

export default router;
