import { Router } from 'express';
import { getDashboardStats, getSalesChart } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Todas as rotas de dashboard são protegidas
router.use(authMiddleware);

// Estatísticas do dashboard
router.get('/stats', getDashboardStats);

// Gráfico de vendas
router.get('/sales-chart', getSalesChart);

export default router;
