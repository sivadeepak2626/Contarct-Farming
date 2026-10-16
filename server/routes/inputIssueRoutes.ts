import { Router } from 'express';
import {
  getAllInputIssues,
  createInputIssue,
  updateInputIssue,
} from '../controllers/inputIssueController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllInputIssues);
router.post('/', createInputIssue);
router.put('/:id', authorizeRoles('admin', 'officer'), updateInputIssue);

export default router;
