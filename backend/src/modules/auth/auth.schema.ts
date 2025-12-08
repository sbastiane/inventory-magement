import { z } from 'zod';

export const loginSchema = z.object({
  identification: z.string().min(1, 'La identificación es requerida'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginDTO = z.infer<typeof loginSchema>;