import { Router } from 'express';
import { getReportData } from '../controllers/reportController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);
router.get('/', getReportData);

export default router;
