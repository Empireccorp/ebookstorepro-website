import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateEnv, ALLOWED_ORIGINS, PORT as ENV_PORT } from './config/env';
import { setupSecurityMiddlewares } from './middleware/security';
import { apiRateLimiter } from './middleware/rateLimiter';
import prisma from './config/database';
import ebookRoutes from './routes/ebookRoutes';
import checkoutRoutes from './routes/checkoutRoutes';
import webhookRoutes from './routes/webhookRoutes';
import orderRoutes from './routes/orderRoutes';
import downloadRoutes from './routes/downloadRoutes';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import adminEbookRoutes from './routes/adminEbookRoutes';
import categoryRoutes from './routes/categoryRoutes';
import adminOrderRoutes from './routes/adminOrderRoutes';
import configRoutes from './routes/configRoutes';
import affiliateRoutes from './routes/affiliateRoutes';
import healthRoutes from './routes/healthRoutes';
import themeRoutes from './routes/themeRoutes';

dotenv.config();

// Validar variáveis de ambiente
validateEnv();

const app = express();
const PORT = ENV_PORT;

// Security middlewares
setupSecurityMiddlewares(app);

// CORS configurado por ambiente
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (ex: Postman, apps mobile)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️  CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting geral
app.use(apiRateLimiter);

// Webhook route MUST come before express.json() to receive raw body
app.use('/api/stripe', express.raw({ type: 'application/json' }), webhookRoutes);

// JSON parser for other routes
app.use(express.json());

// Health check routes
app.use('/health', healthRoutes);

// Public routes
app.use('/api/ebooks', ebookRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/theme', themeRoutes);

// Admin routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/ebooks', adminEbookRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/config', configRoutes);
app.use('/api/admin/affiliates', affiliateRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Database connection test route
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    const ebooksCount = await prisma.ebook.count();
    const ordersCount = await prisma.order.count();
    const downloadsCount = await prisma.download.count();

    res.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        ebooks: ebooksCount,
        orders: ordersCount,
        downloads: downloadsCount,
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database test: http://localhost:${PORT}/api/test-db`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
