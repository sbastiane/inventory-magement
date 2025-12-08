import { z } from 'zod';

export const createInventoryCountSchema = z.object({
  countNumber: z.number().int().min(1).max(3, 'El número de conteo debe estar entre 1 y 3'),
  cutoffDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  warehouseId: z.string().min(1, 'La bodega es requerida'),
  productId: z.string().min(1, 'El producto es requerido'),
  packageQuantity: z.number().int().min(0, 'La cantidad debe ser mayor o igual a 0'),
});

export const queryInventoryCountSchema = z.object({
  countNumber: z.coerce.number().int().min(1).max(3).optional(),
  cutoffDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  warehouseId: z.string().optional(),
  productId: z.string().optional(),
});

export type CreateInventoryCountDTO = z.infer<typeof createInventoryCountSchema>;
export type QueryInventoryCountDTO = z.infer<typeof queryInventoryCountSchema>;