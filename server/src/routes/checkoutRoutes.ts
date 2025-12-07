import { Router } from 'express';
import { createCheckoutSession } from '../controllers/checkoutController';
import { validate } from '../middleware/validate';
import { createCheckoutSchema } from '../validators/schemas';

const router = Router();

// Rota para criar sessão de checkout (com validação)
router.post('/create-session', validate(createCheckoutSchema), createCheckoutSession);

export default router;
