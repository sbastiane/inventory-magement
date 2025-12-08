import { Router } from 'express';
import { InventoryController } from '@modules/inventory/inventory.controller';
import { authenticate, requireWarehouseAccess } from '@shared/middlewares/auth';

const router = Router();
const inventoryController = new InventoryController();

router.use(authenticate);

router.post('/', requireWarehouseAccess('warehouseId'), inventoryController.create);
router.get('/', inventoryController.getAll);
router.get('/:id', inventoryController.getById);
router.put('/:id', inventoryController.update);
router.delete('/:id', inventoryController.delete);

export default router;