import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { APP_ENV } from '../config/env';

const router = Router();

/**
 * Healthcheck simples
 * GET /health
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Testar conexão com banco
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      message: 'Ebook Store Pro API is running',
      environment: APP_ENV,
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Service unavailable',
      environment: APP_ENV,
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

/**
 * Healthcheck detalhado (apenas para monitoramento interno)
 * GET /health/detailed
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Testar conexão com banco
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;
    
    // Contar registros principais
    const [ebooksCount, ordersCount, affiliatesCount] = await Promise.all([
      prisma.ebook.count(),
      prisma.order.count(),
      prisma.affiliate.count(),
    ]);
    
    res.json({
      status: 'ok',
      environment: APP_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`,
      },
      stats: {
        ebooks: ebooksCount,
        orders: ordersCount,
        affiliates: affiliatesCount,
      },
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Service check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
