import express from 'express';
import { protect, authorize } from '../middleware/auth';
import Problem from '../models/Problem';

const router = express.Router();

// Get all problems (public)
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().select('-testCases').populate('createdBy', 'username');
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching problems' });
  }
});

// Get single problem
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .select('-testCases')
      .populate('createdBy', 'username');

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching problem' });
  }
});

// Create new problem (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const problem = await Problem.create({
      ...req.body,
      createdBy: req.user!._id,
    });
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Error creating problem' });
  }
});

// Update problem (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Error updating problem' });
  }
});

// Delete problem (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting problem' });
  }
});

export default router;
