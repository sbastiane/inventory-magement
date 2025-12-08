import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        identification: string;
        role: Role;
        warehouseIds: string[];
      };
    }
  }
}

export {};