import { Router } from 'express';
import {
  getAllCultivations,
  getCultivationById,
  updateCultivationStage,
  createCultivation,
} from '../controllers/cultivationController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllCultivations);
router.get('/:id', getCultivationById);
router.post('/', authorizeRoles('admin', 'officer'), createCultivation);
router.put('/:id/stage', authorizeRoles('admin', 'officer', 'farmer'), updateCultivationStage);

export default router;
