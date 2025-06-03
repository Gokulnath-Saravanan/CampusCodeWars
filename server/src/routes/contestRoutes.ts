import { Router } from 'express';
import { auth } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { Contest } from '../models/Contest';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all contests with leaderboards
router.get('/leaderboard', async (req, res, next) => {
  try {
    const contests = await Contest.find()
      .populate('participants.user', 'username')
      .sort({ startTime: -1 });

    const contestsWithLeaderboards = contests.map(contest => {
      // Sort participants by score in descending order
      const sortedParticipants = [...contest.participants].sort((a, b) => b.score - a.score);

      // Add rank to each participant
      const leaderboard = sortedParticipants.map((participant, index) => ({
        rank: index + 1,
        username: participant.user.username,
        contestPoints: participant.score,
        problemsSolved: participant.submissions.length
      }));

      return {
        _id: contest._id,
        title: contest.title,
        startTime: contest.startTime,
        endTime: contest.endTime,
        leaderboard
      };
    });

    res.json({
      success: true,
      data: contestsWithLeaderboards,
    });
  } catch (error) {
    next(new AppError('Error fetching contests', 500));
  }
});

// Get all contests
router.get('/', async (req, res, next) => {
  try {
    const contests = await Contest.find().sort({ startTime: -1 });
    res.json({
      success: true,
      data: contests,
    });
  } catch (error) {
    next(new AppError('Error fetching contests', 500));
  }
});

// Get single contest
router.get('/:id', async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return next(new AppError('Contest not found', 404));
    }
    res.json({
      success: true,
      data: contest,
    });
  } catch (error) {
    next(new AppError('Error fetching contest', 500));
  }
});

// Join contest
router.post('/:id/join', auth, async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return next(new AppError('Contest not found', 404));
    }

    if (!contest.registrationOpen) {
      return next(new AppError('Contest registration is closed', 400));
    }

    if (contest.participants.length >= contest.maxParticipants) {
      return next(new AppError('Contest is full', 400));
    }

    const participant = {
      user: req.user!._id,
      score: 0,
      submissions: [],
      joinedAt: new Date(),
    };

    if (contest.participants.some(p => p.user.toString() === req.user!._id.toString())) {
      return next(new AppError('Already registered for this contest', 400));
    }

    contest.participants.push(participant);
    await contest.save();

    res.json({
      success: true,
      message: 'Successfully joined the contest',
    });
  } catch (error) {
    next(new AppError('Error joining contest', 500));
  }
});

// Create contest (admin only)
router.post('/', auth, isAdmin, async (req, res, next) => {
  try {
    const contest = await Contest.create({
      ...req.body,
      createdBy: req.user!._id,
    });

    res.status(201).json({
      success: true,
      data: contest,
    });
  } catch (error) {
    next(new AppError('Error creating contest', 500));
  }
});

// Update contest (admin only)
router.put('/:id', auth, isAdmin, async (req, res, next) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!contest) {
      return next(new AppError('Contest not found', 404));
    }

    res.json({
      success: true,
      data: contest,
    });
  } catch (error) {
    next(new AppError('Error updating contest', 500));
  }
});

// Delete contest (admin only)
router.delete('/:id', auth, isAdmin, async (req, res, next) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);

    if (!contest) {
      return next(new AppError('Contest not found', 404));
    }

    res.json({
      success: true,
      message: 'Contest deleted successfully',
    });
  } catch (error) {
    next(new AppError('Error deleting contest', 500));
  }
});

export default router; 