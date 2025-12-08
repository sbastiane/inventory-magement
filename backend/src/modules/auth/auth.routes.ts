import { Router } from 'express';
import { AuthController } from '@modules/auth/auth.controller';
import { authenticate } from '@shared/middlewares/auth';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);

export default router;