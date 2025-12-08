import { PrismaClient } from '@prisma/client';
import { config } from '@config/env';

export const prisma = new PrismaClient();

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}