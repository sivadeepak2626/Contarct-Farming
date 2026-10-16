import { Router } from 'express';
import { getAllPayments, recordPayment } from '../controllers/paymentController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllPayments);
router.post('/record', authorizeRoles('admin', 'buyer'), recordPayment);

export default router;
