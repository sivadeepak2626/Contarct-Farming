import { Router } from 'express';
import {
  getAllContracts,
  getContractById,
  createContract,
  updateContractStatus,
  updateContract,
} from '../controllers/contractController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllContracts);
router.get('/:id', getContractById);
router.post('/', authorizeRoles('admin', 'buyer'), createContract);
router.put('/:id', authorizeRoles('admin', 'buyer'), updateContract);
router.put('/:id/status', authorizeRoles('admin', 'buyer', 'farmer'), updateContractStatus);

export default router;
