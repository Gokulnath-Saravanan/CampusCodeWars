import { Router } from 'express';
import { auth } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { Submission } from '../models/Submission';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all submissions (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('userId', 'username')
      .populate('problemId', 'title')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: submissions,
    });
  } catch (error) {
    throw new AppError('Error fetching submissions', 500);
  }
});

// Get user's submissions
router.get('/my', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user!._id })
      .populate('problemId', 'title')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: submissions,
    });
  } catch (error) {
    throw new AppError('Error fetching submissions', 500);
  }
});

// Get single submission
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('userId', 'username')
      .populate('problemId', 'title');

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    // Check if user is admin or submission owner
    if (req.user!.role !== 'admin' && submission.userId.toString() !== req.user!._id.toString()) {
      throw new AppError('Not authorized to view this submission', 403);
    }

    res.json({
      status: 'success',
      data: submission,
    });
  } catch (error) {
    throw new AppError('Error fetching submission', 500);
  }
});

// Create submission
router.post('/', auth, async (req, res) => {
  try {
    const submission = await Submission.create({
      ...req.body,
      userId: req.user!._id,
    });

    res.status(201).json({
      status: 'success',
      data: submission,
    });
  } catch (error) {
    throw new AppError('Error creating submission', 500);
  }
});

export default router;
