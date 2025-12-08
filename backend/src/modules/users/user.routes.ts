import { Router } from 'express';
import { UserController } from '@modules/users/user.controller';
import { authenticate, requireRole } from '@shared/middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();
const userController = new UserController();

router.use(authenticate);
router.use(requireRole(Role.ADMIN));

router.post('/', userController.create);
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

export default router;