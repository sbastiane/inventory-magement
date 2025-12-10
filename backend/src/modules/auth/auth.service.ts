import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { prisma } from '@config/database';
import { config } from '@config/env';
import { AuthenticationError } from '@shared/errors/CustomError';
import { LoginDTO } from './auth.schema';
import { Role } from '@prisma/client';

interface TokenPayload {
  userId: string;
  identification: string;
  role: Role;
}

export class AuthService {
  async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { identification: data.identification },
      include: {
        userWarehouses: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!user) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    const payload: TokenPayload = {
      userId: user.id,
      identification: user.identification,
      role: user.role,
    };

    const token = jwt.sign(payload as any, config.jwt.secret as any, { expiresIn: config.jwt.expiresIn } as any);
    
    return {
      token,
      user: {
        id: user.id,
        identification: user.identification,
        name: user.name,
        role: user.role,
        warehouses: user.userWarehouses.map((uw) => ({
          code: uw.warehouse.code,
          description: uw.warehouse.description,
          status: uw.warehouse.status,
        })),
      },
    };
  }

  async validateToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      throw new AuthenticationError('Token inválido o expirado');
    }
  }
}