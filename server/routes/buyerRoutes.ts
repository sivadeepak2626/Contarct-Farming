import { Router } from 'express';
import {
  getAllBuyers,
  getBuyerById,
  createBuyer,
  updateBuyer,
  deleteBuyer,
} from '../controllers/buyerController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllBuyers);
router.get('/:id', getBuyerById);
router.post('/', authorizeRoles('admin'), createBuyer);
router.put('/:id', authorizeRoles('admin', 'buyer'), updateBuyer);
router.delete('/:id', authorizeRoles('admin'), deleteBuyer);

export default router;
