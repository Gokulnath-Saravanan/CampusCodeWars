import express from 'express';
import { protect } from '../middleware/auth';
import { register, login, getMe } from '../controllers/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
