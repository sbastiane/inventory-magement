import express from 'express';
import cors from 'cors';
import { config } from '@config/env';
import { connectDatabase } from '@config/database';
import { errorHandler } from '@shared/middlewares/errorHandler';

import authRoutes from '@modules/auth/auth.routes';
import userRoutes from '@modules/users/user.routes';
import inventoryRoutes from '@modules/inventory/inventory.routes';
import warehouseRoutes from '@modules/warehouses/warehouse.routes';
import productRoutes from '@modules/products/product.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory-counts', inventoryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/products', productRoutes);

app.use(errorHandler);

const startServer = async () => {
  await connectDatabase();

  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`📍 Environment: ${config.nodeEnv}`);
  });
};

startServer();

export default app;