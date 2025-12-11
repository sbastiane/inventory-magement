import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service';
import { createInventoryCountSchema, queryInventoryCountSchema } from './inventory.schema';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createInventoryCountSchema.parse(req.body);
      const inventoryCount = await this.inventoryService.createInventoryCount(
        data,
        req.user!.id,
        req.user!.role
      );

      res.status(201).json({
        success: true,
        data: inventoryCount,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = queryInventoryCountSchema.parse(req.query);
      const inventoryCounts = await this.inventoryService.getInventoryCounts(filters);

      res.json({
        success: true,
        data: inventoryCounts,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inventoryCount = await this.inventoryService.getInventoryCountById(
        req.params.id
      );

      res.json({
        success: true,
        data: inventoryCount,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { packageQuantity } = req.body;
      
      if (typeof packageQuantity !== 'number' || packageQuantity < 0) {
        throw new Error('La cantidad de empaques debe ser un número mayor o igual a 0');
      }

      const inventoryCount = await this.inventoryService.updateInventoryCount(
        req.params.id,
        packageQuantity,
        req.user!.id
      );

      res.json({
        success: true,
        data: inventoryCount,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.inventoryService.deleteInventoryCount(req.params.id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // Nuevo endpoint: Aprobar conteo (solo admin)
  approve = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notes } = req.body;
      const inventoryCount = await this.inventoryService.approveCount(
        req.params.id,
        req.user!.id,
        notes
      );

      res.json({
        success: true,
        data: inventoryCount,
        message: 'Conteo aprobado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  // Nuevo endpoint: Solicitar recontar (solo admin)
  requestRecount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notes } = req.body;
      const inventoryCount = await this.inventoryService.requestRecount(
        req.params.id,
        req.user!.id,
        notes
      );

      res.json({
        success: true,
        data: inventoryCount,
        message: `Recontar solicitado. El usuario debe registrar el conteo ${inventoryCount.countNumber + 1}`,
      });
    } catch (error) {
      next(error);
    }
  };

  // Nuevo endpoint: Rechazar conteo (solo admin)
  reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notes } = req.body;
      
      if (!notes || notes.trim() === '') {
        throw new Error('Las notas de rechazo son obligatorias');
      }

      const inventoryCount = await this.inventoryService.rejectCount(
        req.params.id,
        req.user!.id,
        notes
      );

      res.json({
        success: true,
        data: inventoryCount,
        message: 'Conteo rechazado',
      });
    } catch (error) {
      next(error);
    }
  };
}