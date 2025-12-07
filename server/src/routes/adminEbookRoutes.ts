import { Router } from 'express';
import {
  listEbooks,
  getEbookById,
  createEbook,
  updateEbook,
  deleteEbook,
  uploadCover,
  uploadPdf,
} from '../controllers/adminEbookController';
import { authMiddleware } from '../middleware/auth';
import { uploadCover as uploadCoverMiddleware, uploadPDF as uploadPDFMiddleware } from '../config/upload';

const router = Router();

// Todas as rotas são protegidas
router.use(authMiddleware);

// CRUD de ebooks
router.get('/', listEbooks);
router.get('/:id', getEbookById);
router.post('/', createEbook);
router.put('/:id', updateEbook);
router.delete('/:id', deleteEbook);

// Upload de arquivos
router.post('/:id/upload-cover', uploadCoverMiddleware.single('cover'), uploadCover);
router.post('/:id/upload-pdf', uploadPDFMiddleware.single('pdf'), uploadPdf);

export default router;
