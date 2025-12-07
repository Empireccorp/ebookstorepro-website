import { Router } from 'express';
import {
  getAllEbooks,
  getEbookBySlug,
  createEbook,
  updateEbook,
  deleteEbook,
} from '../controllers/ebookController';

const router = Router();

// Rotas públicas
router.get('/', getAllEbooks);
router.get('/:slug', getEbookBySlug);

// Rotas administrativas (sem autenticação por enquanto)
router.post('/', createEbook);
router.put('/:id', updateEbook);
router.delete('/:id', deleteEbook);

export default router;
