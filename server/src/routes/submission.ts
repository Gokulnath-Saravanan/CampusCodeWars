import express from 'express';
import { protect } from '../middleware/auth';
import Submission from '../models/Submission';
import Problem from '../models/Problem';

const router = express.Router();

// Get user's submissions
router.get('/my', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user!._id })
      .populate('problem', 'title difficulty')
      .sort('-createdAt');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions' });
  }
});

// Get submissions for a problem
router.get('/problem/:problemId', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({
      problem: req.params.problemId,
      user: req.user!._id,
    })
      .populate('problem', 'title difficulty')
      .sort('-createdAt');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions' });
  }
});

// Submit solution
router.post('/', protect, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Create submission
    const submission = await Submission.create({
      user: req.user!._id,
      problem: problemId,
      code,
      language,
      status: 'pending',
    });

    // In a real application, you would now:
    // 1. Send the submission to a queue for processing
    // 2. Run the code in a sandboxed environment
    // 3. Test against all test cases
    // 4. Update the submission status and results

    // For now, we'll just simulate acceptance
    submission.status = 'accepted';
    submission.runtime = Math.floor(Math.random() * 1000);
    submission.memory = Math.floor(Math.random() * 50);
    submission.score = 100;
    await submission.save();

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Error processing submission' });
  }
});

// Get single submission
router.get('/:id', protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problem', 'title difficulty')
      .populate('user', 'username');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Only allow users to view their own submissions
    if (submission.user._id.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submission' });
  }
});

export default router;
