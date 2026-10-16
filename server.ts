import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { connectDB, getDBStatus } from './server/config/db.ts';
import { dbStore } from './server/data/dataStore.ts';
import { errorHandler } from './server/middleware/errorHandler.ts';

// Routes
import authRoutes from './server/routes/authRoutes.ts';
import farmerRoutes from './server/routes/farmerRoutes.ts';
import buyerRoutes from './server/routes/buyerRoutes.ts';
import fieldOfficerRoutes from './server/routes/fieldOfficerRoutes.ts';
import cropRoutes from './server/routes/cropRoutes.ts';
import cultivationRoutes from './server/routes/cultivationRoutes.ts';
import contractRoutes from './server/routes/contractRoutes.ts';
import fieldVisitRoutes from './server/routes/fieldVisitRoutes.ts';
import inputIssueRoutes from './server/routes/inputIssueRoutes.ts';
import harvestRoutes from './server/routes/harvestRoutes.ts';
import deliveryRoutes from './server/routes/deliveryRoutes.ts';
import settlementRoutes from './server/routes/settlementRoutes.ts';
import paymentRoutes from './server/routes/paymentRoutes.ts';
import reportRoutes from './server/routes/reportRoutes.ts';
import notificationRoutes from './server/routes/notificationRoutes.ts';
import dashboardRoutes from './server/routes/dashboardRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health and DB status endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    system: 'FarmContract Enterprise API',
    version: '1.0.0',
    db: getDBStatus(),
    timestamp: new Date(),
  });
});

// Admin data reset for testing
app.post('/api/admin/reset-data', (_req, res) => {
  dbStore.reset();
  res.json({ success: true, message: 'All demo data has been reset to pristine initial state.' });
});

// RESTful API route groups
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/field-officers', fieldOfficerRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/cultivation', cultivationRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/field-visits', fieldVisitRoutes);
app.use('/api/input-issues', inputIssueRoutes);
app.use('/api/harvests', harvestRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Central error handler for API routes
app.use('/api', errorHandler);

// Setup frontend serving
const setupFrontend = async () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }
};

const startServer = async () => {
  try {
    // Attempt DB connection
    await connectDB();
    await dbStore.syncToMongoIfConnected();

    await setupFrontend();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[FarmContract] Server successfully running at http://0.0.0.0:${PORT}`);
    });
  } catch (err: any) {
    console.error('[FarmContract] Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
