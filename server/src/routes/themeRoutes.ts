import express from 'express';
import { getTheme, updateTheme, resetTheme } from '../controllers/themeController';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// Public route
router.get('/', getTheme);

// Admin routes
router.put('/', authenticateAdmin, updateTheme);
router.post('/reset', authenticateAdmin, resetTheme);

export default router;
