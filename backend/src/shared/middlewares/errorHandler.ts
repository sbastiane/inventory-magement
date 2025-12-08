import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/CustomError';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  console.error('Error no manejado:', err);

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
};