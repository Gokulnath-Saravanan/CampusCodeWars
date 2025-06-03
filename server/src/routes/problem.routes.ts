import express from 'express';
import { protect } from '../middleware/auth';
import { createProblem, getProblem, getProblems, updateProblem, deleteProblem, getDailyProblem } from '../controllers/problem';

const router = express.Router();

// @route   GET /api/problems
// @desc    Get all problems
// @access  Private
router.get('/', protect, getProblems);

// @route   GET /api/problems/daily
// @desc    Get daily problem
// @access  Public
router.get('/daily', getDailyProblem);

// @route   GET /api/problems/:id
// @desc    Get single problem
// @access  Private
router.get('/:id', protect, getProblem);

// @route   POST /api/problems
// @desc    Create new problem
// @access  Private (Admin/Organizer only)
router.post('/', protect, createProblem);

// @route   PUT /api/problems/:id
// @desc    Update problem
// @access  Private (Admin/Organizer only)
router.put('/:id', protect, updateProblem);

// @route   DELETE /api/problems/:id
// @desc    Delete problem
// @access  Private (Admin/Organizer only)
router.delete('/:id', protect, deleteProblem);

export default router; 