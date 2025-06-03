import express from 'express';
import { Problem } from '../models/Problem';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get all problems
router.get('/', auth, async (req, res) => {
  try {
    const problems = await Problem.find({ status: 'published' });
    res.json({ success: true, data: problems });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch problems' });
  }
});

// Get single problem
router.get('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }
    res.json({ success: true, data: problem });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch problem' });
  }
});

// Submit solution
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { code, language } = req.body;
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }

    // TODO: Implement solution evaluation
    res.json({ success: true, message: 'Solution submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to submit solution' });
  }
});

export default router; 