import { Router } from 'express';
import { getOrderBySessionId, getAllOrders, resendOrderEmail } from '../controllers/orderController';

const router = Router();

// Rota para buscar pedido por session_id
router.get('/session/:sessionId', getOrderBySessionId);

// Rota para listar todos os pedidos (admin)
router.get('/', getAllOrders);

// Rota para reenviar e-mail de download
router.post('/:orderId/resend-email', resendOrderEmail);

export default router;
