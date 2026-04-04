import { Router } from 'express';
import { verifySession } from '../../middleware/verifySession.middleware';
import { requireRole } from '../../middleware/requireRole.middleware';
import { handleSearchStudents } from './student.controller';

const router = Router();

// All student admin routes require authentication and ADMIN or FACULTY role
router.use(verifySession, requireRole(['ADMIN', 'FACULTY']));

router.post('/search', handleSearchStudents);

export default router;
