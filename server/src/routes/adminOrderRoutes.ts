import { Router } from 'express';
import {
  listOrders,
  getOrderById,
  resendOrderEmailAdmin,
  getOrderStats,
} from '../controllers/adminOrderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Todas as rotas são protegidas
router.use(authMiddleware);

// Estatísticas de pedidos
router.get('/stats', getOrderStats);

// CRUD de pedidos
router.get('/', listOrders);
router.get('/:id', getOrderById);

// Reenviar e-mail
router.post('/:id/resend-email', resendOrderEmailAdmin);

export default router;
