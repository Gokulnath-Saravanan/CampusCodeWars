import express from 'express';
import { protect } from '../middleware/auth';
import { submitCode, getSubmission, getUserSubmissions } from '../controllers/submission';

const router = express.Router();

// @route   GET /api/submissions
// @desc    Get all submissions for a user
// @access  Private
router.get('/', protect, getUserSubmissions);

// @route   GET /api/submissions/:id
// @desc    Get single submission
// @access  Private
router.get('/:id', protect, getSubmission);

// @route   POST /api/submissions
// @desc    Create new submission
// @access  Private
router.post('/', protect, submitCode);

export default router;
