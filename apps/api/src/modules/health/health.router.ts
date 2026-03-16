import { Router } from 'express';
import { handleHealthCheck } from './health.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
router.get('/', asyncHandler(handleHealthCheck));
export default router;