import { Router } from 'express';
import {
  getAllFieldOfficers,
  getFieldOfficerById,
  createFieldOfficer,
  updateFieldOfficer,
  assignFarmersToOfficer,
} from '../controllers/fieldOfficerController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllFieldOfficers);
router.get('/:id', getFieldOfficerById);
router.post('/', authorizeRoles('admin'), createFieldOfficer);
router.put('/:id', authorizeRoles('admin', 'officer'), updateFieldOfficer);
router.post('/:id/assign-farmers', authorizeRoles('admin'), assignFarmersToOfficer);

export default router;
