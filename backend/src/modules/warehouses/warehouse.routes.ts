import { Router, Request, Response } from 'express';
import { prisma } from '@config/database';
import { authenticate } from '@shared/middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { code: 'asc' },
    });

    res.json({
      success: true,
      data: warehouses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las bodegas',
    });
  }
});

export default router;