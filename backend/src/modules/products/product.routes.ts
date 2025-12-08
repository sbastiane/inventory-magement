import { Router, Request, Response } from 'express';
import { prisma } from '@config/database';
import { authenticate } from '@shared/middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { code: 'asc' },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los productos',
    });
  }
});

export default router;