import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  createProblem,
  getProblem,
  getProblems,
  updateProblem,
  deleteProblem,
} from '../controllers/problem';

const router = express.Router();

// Get all problems (public)
router.get('/', protect, getProblems);

// Get single problem
router.get('/:id', protect, getProblem);

// Create new problem (admin only)
router.post('/', protect, authorize('admin'), createProblem);

// Update problem (admin only)
router.put('/:id', protect, authorize('admin'), updateProblem);

// Delete problem (admin only)
router.delete('/:id', protect, authorize('admin'), deleteProblem);

export default router;
