import { Router } from 'express';
import { generateDownloadLink, downloadEbook } from '../controllers/downloadController';
import { downloadRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Rota para gerar link de download
router.post('/generate', generateDownloadLink);

// Rota para realizar o download (com rate limiting)
router.get('/:token', downloadRateLimiter, downloadEbook);

export default router;
