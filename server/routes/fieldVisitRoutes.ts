import { Router } from 'express';
import {
  getAllFieldVisits,
  getFieldVisitById,
  createFieldVisit,
  updateFieldVisit,
} from '../controllers/fieldVisitController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllFieldVisits);
router.get('/:id', getFieldVisitById);
router.post('/', authorizeRoles('admin', 'officer'), createFieldVisit);
router.put('/:id', authorizeRoles('admin', 'officer'), updateFieldVisit);

export default router;
