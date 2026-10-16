import { Router } from 'express';
import {
  getAllSettlements,
  getSettlementById,
  prepareSettlement,
  updateSettlementStatus,
} from '../controllers/settlementController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllSettlements);
router.get('/:id', getSettlementById);
router.post('/prepare', authorizeRoles('admin', 'buyer'), prepareSettlement);
router.put('/:id/status', authorizeRoles('admin'), updateSettlementStatus);

export default router;
