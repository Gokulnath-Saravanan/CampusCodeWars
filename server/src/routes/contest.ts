import express from 'express';
import { protect, authorize } from '../middleware/auth';
import Contest from '../models/Contest';

const router = express.Router();

// Get all contests
router.get('/', async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate('createdBy', 'username')
      .select('-problems')
      .sort('-startTime');
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contests' });
  }
});

// Get single contest
router.get('/:id', protect, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('problems', 'title difficulty');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // If contest hasn't started, only show basic info
    if (contest.status === 'upcoming') {
      contest.problems = [];
    }

    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contest' });
  }
});

// Create contest (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const contest = await Contest.create({
      ...req.body,
      createdBy: req.user!._id,
    });
    res.status(201).json(contest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating contest' });
  }
});

// Update contest (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: 'Error updating contest' });
  }
});

// Delete contest (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.json({ message: 'Contest deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contest' });
  }
});

// Register for contest
router.post('/:id/register', protect, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.status !== 'upcoming') {
      return res.status(400).json({ message: 'Contest registration is closed' });
    }

    // Check if already registered
    if (contest.participants.some((p) => p.user.toString() === req.user!._id.toString())) {
      return res.status(400).json({ message: 'Already registered for this contest' });
    }

    contest.participants.push({
      user: req.user!._id,
      score: 0,
      joinedAt: new Date(),
    });

    await contest.save();
    res.json({ message: 'Successfully registered for contest' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering for contest' });
  }
});

// Get contest leaderboard
router.get('/:id/leaderboard', protect, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('participants.user', 'username');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Sort participants by score and update ranks
    const leaderboard = contest.participants
      .sort((a, b) => b.score - a.score)
      .map((participant, index) => ({
        ...participant.toObject(),
        rank: index + 1,
      }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

export default router;
