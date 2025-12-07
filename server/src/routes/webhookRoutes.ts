import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhookController';

const router = Router();

// Rota de webhook do Stripe
// IMPORTANTE: Esta rota deve receber raw body, não JSON parsed
router.post('/webhook', handleStripeWebhook);

export default router;
