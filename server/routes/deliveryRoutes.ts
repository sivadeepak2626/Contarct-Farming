import { Router } from 'express';
import { getAllDeliveries, createDelivery } from '../controllers/deliveryController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllDeliveries);
router.post('/', authorizeRoles('admin', 'farmer', 'buyer'), createDelivery);

export default router;
