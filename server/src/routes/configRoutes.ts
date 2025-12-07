import { Router } from 'express';
import {
  getAllConfigs,
  getConfigByKey,
  upsertConfig,
  updateEnvVar,
  deleteConfig,
} from '../controllers/configController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Todas as rotas são protegidas
router.use(authMiddleware);

// CRUD de configurações
router.get('/', getAllConfigs);
router.get('/:key', getConfigByKey);
router.post('/', upsertConfig);
router.delete('/:key', deleteConfig);

// Atualizar variáveis de ambiente
router.put('/env/:key', updateEnvVar);

export default router;
