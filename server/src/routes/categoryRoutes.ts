import { Router } from 'express';
import {
  listCategories,
  listAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rota pública para listar categorias ativas
router.get('/', listCategories);

// Rotas de admin (protegidas)
router.get('/admin/all', authMiddleware, listAllCategories);
router.get('/admin/:id', authMiddleware, getCategoryById);
router.post('/admin', authMiddleware, createCategory);
router.put('/admin/:id', authMiddleware, updateCategory);
router.delete('/admin/:id', authMiddleware, deleteCategory);

export default router;
