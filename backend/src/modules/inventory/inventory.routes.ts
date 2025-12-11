import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate, requireWarehouseAccess, requireRole } from '../../shared/middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();
const inventoryController = new InventoryController();

router.use(authenticate);

// Rutas para usuarios y admins
router.post('/', requireWarehouseAccess('warehouseId'), inventoryController.create);
router.get('/', inventoryController.getAll);
router.get('/:id', inventoryController.getById);
router.put('/:id', inventoryController.update);
router.delete('/:id', inventoryController.delete);

// Rutas solo para administradores - Workflow de aprobación
router.post('/:id/approve', requireRole(Role.ADMIN), inventoryController.approve);
router.post('/:id/request-recount', requireRole(Role.ADMIN), inventoryController.requestRecount);
router.post('/:id/reject', requireRole(Role.ADMIN), inventoryController.reject);

export default router;