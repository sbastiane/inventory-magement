import { prisma } from '../../config/database';
import { NotFoundError, ValidationError } from '../../shared/errors/CustomError';
import { UnitConverter } from '../../shared/utils/unitConverter';
import { CreateInventoryCountDTO, QueryInventoryCountDTO } from './inventory.schema';
import { WarehouseStatus } from '@prisma/client';

export class InventoryService {
  async createInventoryCount(data: CreateInventoryCountDTO, userId: string) {
    const product = await prisma.product.findUnique({
      where: { code: data.productId },
    });

    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { code: data.warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundError('Bodega no encontrada');
    }

    if (warehouse.status !== WarehouseStatus.ACTIVE) {
      throw new ValidationError('La bodega no está activa');
    }

    const existingCount = await prisma.inventoryCount.findUnique({
      where: {
        productId_warehouseId_cutoffDate_countNumber: {
          productId: data.productId,
          warehouseId: data.warehouseId,
          cutoffDate: new Date(data.cutoffDate),
          countNumber: data.countNumber,
        },
      },
    });

    if (existingCount) {
      throw new ValidationError(
        `Ya existe un registro para el conteo ${data.countNumber} de este producto en esta bodega y fecha`
      );
    }

    const unitQuantity = UnitConverter.convertPackageToUnits(
      data.packageQuantity,
      product.conversionFactor
    );

    const inventoryCount = await prisma.inventoryCount.create({
      data: {
        countNumber: data.countNumber,
        cutoffDate: new Date(data.cutoffDate),
        warehouseId: data.warehouseId,
        productId: data.productId,
        packageQuantity: data.packageQuantity,
        unitQuantity,
        userId,
      },
      include: {
        product: true,
        warehouse: true,
        user: {
          select: {
            id: true,
            identification: true,
            name: true,
          },
        },
      },
    });

    return inventoryCount;
  }

  async getInventoryCounts(filters: QueryInventoryCountDTO) {
    const where: any = {};

    if (filters.countNumber) {
      where.countNumber = filters.countNumber;
    }

    if (filters.cutoffDate) {
      where.cutoffDate = new Date(filters.cutoffDate);
    }

    if (filters.warehouseId) {
      where.warehouseId = filters.warehouseId;
    }

    if (filters.productId) {
      where.productId = filters.productId;
    }

    const inventoryCounts = await prisma.inventoryCount.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
        user: {
          select: {
            id: true,
            identification: true,
            name: true,
          },
        },
      },
      orderBy: [
        { cutoffDate: 'desc' },
        { countNumber: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return inventoryCounts;
  }

  async getInventoryCountById(id: string) {
    const inventoryCount = await prisma.inventoryCount.findUnique({
      where: { id },
      include: {
        product: true,
        warehouse: true,
        user: {
          select: {
            id: true,
            identification: true,
            name: true,
          },
        },
      },
    });

    if (!inventoryCount) {
      throw new NotFoundError('Registro de inventario no encontrado');
    }

    return inventoryCount;
  }

  async updateInventoryCount(id: string, packageQuantity: number, userId: string) {
    const inventoryCount = await prisma.inventoryCount.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!inventoryCount) {
      throw new NotFoundError('Registro de inventario no encontrado');
    }

    const unitQuantity = UnitConverter.convertPackageToUnits(
      packageQuantity,
      inventoryCount.product.conversionFactor
    );

    const updated = await prisma.inventoryCount.update({
      where: { id },
      data: {
        packageQuantity,
        unitQuantity,
        userId,
      },
      include: {
        product: true,
        warehouse: true,
        user: {
          select: {
            id: true,
            identification: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteInventoryCount(id: string) {
    const inventoryCount = await prisma.inventoryCount.findUnique({
      where: { id },
    });

    if (!inventoryCount) {
      throw new NotFoundError('Registro de inventario no encontrado');
    }

    await prisma.inventoryCount.delete({ where: { id } });

    return { message: 'Registro de inventario eliminado correctamente' };
  }
}