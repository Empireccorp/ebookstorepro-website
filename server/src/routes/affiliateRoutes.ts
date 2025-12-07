import { Router } from 'express';
import {
  listAffiliates,
  getAffiliateById,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
} from '../controllers/affiliateController';
import {
  payAffiliateCommissions,
  listPayouts,
  getPayoutById,
  getAffiliateStats,
} from '../controllers/affiliatePayoutController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Todas as rotas são protegidas
router.use(authMiddleware);

// Estatísticas
router.get('/stats/general', getAffiliateStats);

// CRUD de afiliados
router.get('/', listAffiliates);
router.get('/:id', getAffiliateById);
router.post('/', createAffiliate);
router.put('/:id', updateAffiliate);
router.delete('/:id', deleteAffiliate);

// Pagamento de comissões
router.post('/:id/pay-commissions', payAffiliateCommissions);

// Payouts
router.get('/payouts/list', listPayouts);
router.get('/payouts/:id', getPayoutById);

export default router;
