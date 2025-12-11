import { prisma } from '../../config/database';
import { NotFoundError, ValidationError } from '../../shared/errors/CustomError';
import { UnitConverter } from '../../shared/utils/unitConverter';
import { CreateInventoryCountDTO, QueryInventoryCountDTO } from './inventory.schema';
import { WarehouseStatus, CountStatus, Role } from '@prisma/client';

export class InventoryService {
  async createInventoryCount(data: CreateInventoryCountDTO, userId: string, userRole: Role) {
    // Validar que siempre se inicie con conteo 1
    if (data.countNumber === 1) {
      // Conteo 1 siempre se puede crear
    } else if (data.countNumber === 2 || data.countNumber === 3) {
      // Para conteo 2 o 3, debe existir el anterior y estar en RECOUNT_REQUESTED
      const previousCount = await prisma.inventoryCount.findFirst({
        where: {
          productId: data.productId,
          warehouseId: data.warehouseId,
          cutoffDate: new Date(data.cutoffDate),
          countNumber: data.countNumber - 1,
        },
      });

      if (!previousCount) {
        throw new ValidationError(
          `Debe existir el conteo ${data.countNumber - 1} antes de registrar el conteo ${data.countNumber}`
        );
      }

      if (previousCount.status !== CountStatus.RECOUNT_REQUESTED) {
        throw new ValidationError(
          `El conteo ${data.countNumber - 1} debe estar marcado como "Recontar Solicitado" por un administrador antes de poder registrar el conteo ${data.countNumber}`
        );
      }
    }
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
        status: CountStatus.PENDING, // Siempre inicia como PENDING
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
      // Filtrar por fecha específica sin considerar la hora
      // Crear rango desde el inicio del día hasta el final del día
      const filterDate = new Date(filters.cutoffDate);
      const startOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
      const endOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate() + 1);

      where.cutoffDate = {
        gte: startOfDay,
        lt: endOfDay,
      };
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

  // Nuevo método: Aprobar conteo
  async approveCount(id: string, adminId: string, notes?: string) {
    const inventoryCount = await prisma.inventoryCount.findUnique({
      where: { id },
    });

    if (!inventoryCount) {
      throw new NotFoundError('Registro de inventario no encontrado');
    }

    if (inventoryCount.status !== CountStatus.PENDING) {
      throw new ValidationError('Solo se pueden aprobar conteos en estado PENDING');
    }

    const updated = await prisma.inventoryCount.update({
      where: { id },
      data: {
        status: CountStatus.APPROVED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: notes,
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

  // Nuevo método: Solicitar recontar
  async requestRecount(id: string, adminId: string, notes?: string) {
    const inventoryCount = await prisma.inventoryCount.findUnique({
      where: { id },
      include: {
        product: true,
        warehouse: true,
      },
    });

    if (!inventoryCount) {
      throw new NotFoundError('Registro de inventario no encontrado');
    }

    if (inventoryCount.status !== CountStatus.PENDING) {
      throw new ValidationError('Solo se puede solicitar recontar de conteos en estado PENDING');
    }

    // Validar que no exista ya un conteo siguiente
    const nextCount = await prisma.inventoryCount.findFirst({
      where: {
        productId: inventoryCount.productId,
        warehouseId: inventoryCount.warehouseId,
        cutoffDate: inventoryCount.cutoffDate,
        countNumber: inventoryCount.countNumber + 1,
      },
    });

    if (nextCount) {
      throw new ValidationError('Ya existe un conteo posterior registrado');
    }

    // Validar que no sea el conteo 3 (no hay conteo 4)
    if (inventoryCount.countNumber >= 3) {
      throw new ValidationError('No se puede solicitar más conteos. Este es el conteo final (3)');
    }

    const updated = await prisma.inventoryCount.update({
      where: { id },
      data: {
        status: CountStatus.RECOUNT_REQUESTED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: notes,
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

  // Nuevo método: Rechazar conteo
  async rejectCount(id: string, adminId: string, notes: string) {
    const inventoryCount = await prisma.inventoryCount.findUnique({
      where: { id },
    });

    if (!inventoryCount) {
      throw new NotFoundError('Registro de inventario no encontrado');
    }

    if (inventoryCount.status !== CountStatus.PENDING) {
      throw new ValidationError('Solo se pueden rechazar conteos en estado PENDING');
    }

    const updated = await prisma.inventoryCount.update({
      where: { id },
      data: {
        status: CountStatus.REJECTED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: notes,
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
}