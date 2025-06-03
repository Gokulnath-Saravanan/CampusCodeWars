import express from 'express';
import { protect } from '../middleware/auth';
import {
  getContests,
  getContest,
  createContest,
  updateContest,
  deleteContest,
  registerForContest,
} from '../controllers/contest';

const router = express.Router();

// @route   GET /api/contests
// @desc    Get all contests
// @access  Private
router.get('/', protect, getContests);

// @route   GET /api/contests/:id
// @desc    Get single contest
// @access  Private
router.get('/:id', protect, getContest);

// @route   POST /api/contests
// @desc    Create new contest
// @access  Private (Admin/Organizer only)
router.post('/', protect, createContest);

// @route   PUT /api/contests/:id
// @desc    Update contest
// @access  Private (Admin/Organizer only)
router.put('/:id', protect, updateContest);

// @route   DELETE /api/contests/:id
// @desc    Delete contest
// @access  Private (Admin/Organizer only)
router.delete('/:id', protect, deleteContest);

// @route   POST /api/contests/:id/register
// @desc    Register for a contest
// @access  Private
router.post('/:id/register', protect, registerForContest);

export default router;
