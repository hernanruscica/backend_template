import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';

const router = Router();

router.post('/login', AuthController.login);
router.get('/users/activate/:token', AuthController.activateUser); 
router.get('/users/sendactivation/:email', AuthController.sendActivationEmail);

export default router;
