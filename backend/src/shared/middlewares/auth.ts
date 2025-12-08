import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@config/env';
import { AuthenticationError, AuthorizationError } from '../errors/CustomError';
import { Role } from '@prisma/client';
import { prisma } from '@config/database';

interface JwtPayload {
  userId: string;
  identification: string;
  role: Role;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AuthenticationError('Token no proporcionado');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userWarehouses: {
          select: { warehouseId: true },
        },
      },
    });

    if (!user) {
      throw new AuthenticationError('Usuario no encontrado');
    }

    req.user = {
      id: user.id,
      identification: user.identification,
      role: user.role,
      warehouseIds: user.userWarehouses.map((uw: { warehouseId: string }) => uw.warehouseId),
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Token inválido'));
    } else {
      next(error);
    }
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError());
    }

    next();
  };
};

export const requireWarehouseAccess = (warehouseIdParam: string = 'warehouseId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    if (req.user.role === Role.ADMIN) {
      return next();
    }

    const warehouseId = req.body[warehouseIdParam] || req.params[warehouseIdParam] || req.query[warehouseIdParam];

    if (!warehouseId) {
      return next(new AuthorizationError('ID de bodega no especificado'));
    }

    if (!req.user.warehouseIds.includes(warehouseId)) {
      return next(new AuthorizationError('No tiene acceso a esta bodega'));
    }

    next();
  };
};