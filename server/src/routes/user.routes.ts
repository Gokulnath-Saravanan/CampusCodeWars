import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  getProfile,
  updateProfile,
  getSubmissions,
  getContests,
} from '../controllers/user';

const router = Router();

// Get user profile
router.get('/profile', auth, getProfile);

// Update user profile
router.put('/profile', auth, updateProfile);

// Get user submissions
router.get('/submissions', auth, getSubmissions);

// Get user contests
router.get('/contests', auth, getContests);

export default router; 