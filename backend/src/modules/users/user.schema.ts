import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  identification: z.string().min(1, 'La identificación es requerida'),
  name: z.string().min(1, 'El nombre es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.nativeEnum(Role),
  warehouseIds: z.array(z.string()).min(1, 'Debe asignar al menos una bodega'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(Role).optional(),
  warehouseIds: z.array(z.string()).optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;