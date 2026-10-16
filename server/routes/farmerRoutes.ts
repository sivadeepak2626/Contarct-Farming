import { Router } from 'express';
import {
  getAllFarmers,
  getFarmerById,
  createFarmer,
  updateFarmer,
  deleteFarmer,
} from '../controllers/farmerController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllFarmers);
router.get('/:id', getFarmerById);
router.post('/', authorizeRoles('admin', 'officer'), createFarmer);
router.put('/:id', authorizeRoles('admin', 'officer', 'farmer'), updateFarmer);
router.delete('/:id', authorizeRoles('admin'), deleteFarmer);

export default router;
