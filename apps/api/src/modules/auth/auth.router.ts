import { Router } from 'express';
import { handleSignup, handleLogin, handleGetMe, handleLogout } from './auth.controller';
import { verifySession } from '../../middleware/verifySession.middleware';

const router = Router();

router.post('/signup', handleSignup);
router.post('/login', handleLogin);
router.get('/me', verifySession, handleGetMe);
router.post('/logout', handleLogout);

export default router;
