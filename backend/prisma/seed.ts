import { PrismaClient, WarehouseStatus, PackagingUnit, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.warehouse.createMany({
    data: [
      { code: '00009', description: 'Cereté', status: WarehouseStatus.ACTIVE },
      { code: '00014', description: 'Central', status: WarehouseStatus.ACTIVE },
      { code: '00006', description: 'Valledupar', status: WarehouseStatus.ACTIVE },
      { code: '00090', description: 'Maicao', status: WarehouseStatus.INACTIVE },
    ],
    skipDuplicates: true,
  });

  await prisma.product.createMany({
    data: [
      {
        code: '4779',
        description: 'ATUN TRIPACK LA SOBERANA ACTE 80 GRM',
        packagingUnit: PackagingUnit.CAJA,
        conversionFactor: 12,
      },
      {
        code: '4266',
        description: 'HARINA AREPA REPA BLANCA 500G X24',
        packagingUnit: PackagingUnit.ARROBA,
        conversionFactor: 24,
      },
      {
        code: '4442',
        description: 'HARINA LA SOBERANA BLANCA 500G X24',
        packagingUnit: PackagingUnit.ARROBA,
        conversionFactor: 24,
      },
    ],
    skipDuplicates: true,
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { identification: '12345678' },
    update: {},
    create: {
      identification: '12345678',
      name: 'Administrador Sistema',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { identification: '80299534' },
    update: {},
    create: {
      identification: '80299534',
      name: 'Juan Esteban Arango',
      password: await bcrypt.hash('user123', 10),
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { identification: '43997553' },
    update: {},
    create: {
      identification: '43997553',
      name: 'Manuel Francisco Grajales',
      password: await bcrypt.hash('user123', 10),
      role: Role.USER,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { identification: '25776298' },
    update: {},
    create: {
      identification: '25776298',
      name: 'Santiago Francisco Martinez',
      password: await bcrypt.hash('user123', 10),
      role: Role.USER,
    },
  });

  await prisma.userWarehouse.createMany({
    data: [
      { userId: user1.id, warehouseId: '00009' },
      { userId: user2.id, warehouseId: '00006' },
      { userId: user2.id, warehouseId: '00090' },
      { userId: user3.id, warehouseId: '00014' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seeded successfully');
  console.log('\n📋 Usuarios creados:');
  console.log('Admin: 12345678 / admin123');
  console.log('User1: 80299534 / user123 (Bodega: Cereté)');
  console.log('User2: 43997553 / user123 (Bodegas: Valledupar, Maicao)');
  console.log('User3: 25776298 / user123 (Bodega: Central)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });