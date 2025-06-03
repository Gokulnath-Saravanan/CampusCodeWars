import express from 'express';
import { protect } from '../middleware/auth';
import { submitCode, getSubmission, getUserSubmissions } from '../controllers/submission';
import { AuthRequest } from '../types';
import Submission from '../models/Submission';

const router = express.Router();

// Get user's submissions
router.get('/my', protect, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
      return;
    }

    const submissions = await Submission.find({ user: req.user._id })
      .populate('problem', 'title difficulty')
      .sort('-createdAt');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions' });
  }
});

// Get submissions for a problem
router.get('/problem/:problemId', protect, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
      return;
    }

    const submissions = await Submission.find({
      problem: req.params.problemId,
      user: req.user._id,
    })
      .populate('problem', 'title difficulty')
      .sort('-createdAt');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions' });
  }
});

router.post('/', protect, submitCode);
router.get('/', protect, getUserSubmissions);
router.get('/:id', protect, getSubmission);

export default router;
