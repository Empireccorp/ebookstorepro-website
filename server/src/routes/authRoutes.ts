import { Router } from 'express';
import { login, setupAdmin, getCurrentAdmin } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { loginSchema, setupAdminSchema } from '../validators/schemas';

const router = Router();

// Rota de login (com rate limiting e validação)
router.post('/login', loginRateLimiter, validate(loginSchema), login);

// Rota de setup do primeiro admin (com validação)
router.post('/setup', validate(setupAdminSchema), setupAdmin);

// Rota para obter dados do admin atual (protegida)
router.get('/me', authMiddleware, getCurrentAdmin);

export default router;
