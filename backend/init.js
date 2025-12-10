#!/usr/bin/env node

const { execSync } = require('child_process');

async function initApp() {
  try {
    console.log('🚀 Iniciando aplicación en modo producción...');

    // Ejecutar migraciones de Prisma para producción
    console.log('📦 Ejecutando migraciones de base de datos...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    // Ejecutar seed de la base de datos
    console.log('🌱 Ejecutando seed de base de datos...');
    execSync('npm run prisma:seed', { stdio: 'inherit' });

    console.log('✅ Inicialización completada. Iniciando servidor...');

    // Iniciar el servidor
    require('./dist/server.js');

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    process.exit(1);
  }
}

initApp();
