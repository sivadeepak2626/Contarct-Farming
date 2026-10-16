import { Router } from 'express';
import { getAllHarvests, createHarvest } from '../controllers/harvestController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllHarvests);
router.post('/', authorizeRoles('admin', 'officer', 'farmer'), createHarvest);

export default router;
