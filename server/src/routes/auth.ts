import express, { Response, NextFunction, Request } from 'express';
import { register, login, getMe } from '../controllers/auth';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
