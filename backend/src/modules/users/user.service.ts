import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { NotFoundError, ValidationError } from '../../shared/errors/CustomError';
import { CreateUserDTO, UpdateUserDTO } from './user.schema';

export class UserService {
  async createUser(data: CreateUserDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { identification: data.identification },
    });

    if (existingUser) {
      throw new ValidationError('Ya existe un usuario con esta identificación');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        identification: data.identification,
        name: data.name,
        password: hashedPassword,
        role: data.role,
        userWarehouses: {
          create: data.warehouseIds.map((warehouseId) => ({
            warehouseId,
          })),
        },
      },
      include: {
        userWarehouses: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    return this.formatUserResponse(user);
  }

  async getAllUsers() {
    const users = await prisma.user.findMany({
      include: {
        userWarehouses: {
          include: {
            warehouse: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.formatUserResponse(user));
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userWarehouses: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return this.formatUserResponse(user);
  }

  async updateUser(id: string, data: UpdateUserDTO) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const updateData: any = {
      name: data.name,
      role: data.role,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    if (data.warehouseIds) {
      await prisma.userWarehouse.deleteMany({
        where: { userId: id },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        ...(data.warehouseIds && {
          userWarehouses: {
            create: data.warehouseIds.map((warehouseId) => ({
              warehouseId,
            })),
          },
        }),
      },
      include: {
        userWarehouses: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    return this.formatUserResponse(updatedUser);
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    await prisma.user.delete({ where: { id } });

    return { message: 'Usuario eliminado correctamente' };
  }

  private formatUserResponse(user: any) {
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      warehouses: user.userWarehouses?.map((uw: any) => ({
        code: uw.warehouse.code,
        description: uw.warehouse.description,
        status: uw.warehouse.status,
      })),
      userWarehouses: undefined,
    };
  }
}