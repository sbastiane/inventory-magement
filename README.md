# 📦 Sistema de Gestión de Inventarios

Un sistema completo de gestión de conteos de inventario. Permite realizar seguimiento preciso de inventarios en múltiples bodegas, gestionar productos con diferentes unidades de medida y controlar el acceso de usuarios por roles.

## 🚀 Características Principales

- **Gestión Multi-Bodega**: Control de inventarios en diferentes almacenes
- **Sistema de Usuarios**: Autenticación JWT con roles (Usuario/Administrador)
- **Productos Flexibles**: Soporte para unidades de empaque y unidades de inventario
- **Control de Conteos**: Seguimiento histórico de inventarios por fecha de corte
- **API RESTful**: Backend robusto con validación de datos
- **Interfaz Moderna**: Frontend React con diseño responsivo
- **Base de Datos PostgreSQL**: Persistencia confiable con Prisma ORM
- **Docker Ready**: Despliegue simplificado con contenedores

## 🛠️ Tecnologías

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticación
- **Zod** - Validación de esquemas
- **Vitest** - Testing
- **ESLint** + **Prettier** - Calidad de código

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Navegación
- **React Query** - Gestión de estado servidor
- **Tailwind CSS** - Estilos
- **React Hook Form** - Formularios
- **React Toastify** - Notificaciones

### Infraestructura
- **Docker** + **Docker Compose**
- **PostgreSQL** - Base de datos
- **Nginx** - Servidor web para frontend

## 📋 Prerrequisitos

- **Node.js** 18+
- **Docker** y **Docker Compose**
- **Git**

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd inventory-management
```

### 2. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
# IMPORTANTE: Cambiar JWT_SECRET por una clave segura
```

### 3. Ejecutar con Docker (Recomendado)
```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# O ejecutar en segundo plano
docker-compose up -d --build
```

### 4. Ejecutar en desarrollo local

#### Backend
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Acceder a la aplicación
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Base de datos**: localhost:5432

## 📊 Uso del Sistema

### Usuarios por Defecto
- **Admin**: identificación: `admin`, password: `admin123`
- **Usuario**: identificación: `user`, password: `user123`

### Flujo de Trabajo
1. **Login**: Acceder con credenciales
2. **Seleccionar Bodega**: Elegir almacén asignado
3. **Crear Conteo**: Iniciar nuevo conteo de inventario
4. **Registrar Productos**: Ingresar cantidades por producto
5. **Finalizar**: Guardar y consultar historial

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:unit  # Con coverage
```

## 📁 Estructura del Proyecto

```
inventory-management/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración (DB, env)
│   │   ├── modules/         # Módulos de negocio
│   │   │   ├── auth/        # Autenticación
│   │   │   ├── inventory/   # Gestión de inventarios
│   │   │   ├── users/       # Usuarios
│   │   │   └── warehouses/  # Bodegas
│   │   ├── shared/          # Utilidades compartidas
│   │   └── server.ts        # Punto de entrada
│   ├── prisma/
│   │   ├── schema.prisma    # Esquema de BD
│   │   └── seed.ts          # Datos iniciales
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── context/         # Contextos React
│   │   ├── lib/             # Utilidades
│   │   ├── pages/           # Páginas
│   │   └── main.tsx         # Punto de entrada
│   └── Dockerfile
├── docker-compose.yml       # Orquestación de servicios
└── README.md
```

## 🔧 Scripts Disponibles

### Backend
- `npm run dev` - Desarrollo con hot reload
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en producción
- `npm run prisma:generate` - Generar cliente Prisma
- `npm run prisma:migrate` - Ejecutar migraciones
- `npm run prisma:seed` - Poblar datos iniciales
- `npm run test` - Ejecutar tests
- `npm run lint` - Verificar código

### Frontend
- `npm run dev` - Desarrollo con Vite
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de producción
- `npm run lint` - Verificar código

## 🔒 Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | URL de conexión PostgreSQL | Requerida |
| `JWT_SECRET` | Clave secreta para JWT | Requerida (mín. 10 chars) |
| `JWT_EXPIRES_IN` | Expiración del token JWT | `8h` |
| `VITE_API_URL` | URL de la API para el frontend | `http://localhost:3000/api` |

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.


## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

⭐ Si este proyecto te resulta útil, ¡dale una estrella!