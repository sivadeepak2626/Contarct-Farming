import { Router } from 'express';
import { getAllCrops, getCropById, createCrop, updateCrop } from '../controllers/cropController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllCrops);
router.get('/:id', getCropById);
router.post('/', authorizeRoles('admin'), createCrop);
router.put('/:id', authorizeRoles('admin'), updateCrop);

export default router;
