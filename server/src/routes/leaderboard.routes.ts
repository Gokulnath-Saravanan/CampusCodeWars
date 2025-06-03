import express, { Router } from 'express';
import { Response } from 'express';
import User from '../models/User';
import Contest from '../models/Contest';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';
import Submission from '../models/Submission';

interface LeaderboardEntry {
  userId: string;
  username: string;
  totalScore: number;
  problemsSolved: number;
  contestsParticipated: number;
}

const router = Router();

// @route   GET /api/leaderboard/global
// @desc    Get global leaderboard
// @access  Private
router.get('/global', protect, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leaderboard: LeaderboardEntry[] = await User.aggregate([
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'userId',
          as: 'submissions'
        }
      },
      {
        $project: {
          username: 1,
          totalScore: { $sum: '$submissions.score' },
          problemsSolved: {
            $size: {
              $setUnion: '$submissions.problemId'
            }
          },
          contestsParticipated: {
            $size: {
              $setUnion: '$submissions.contestId'
            }
          }
        }
      },
      {
        $sort: {
          totalScore: -1,
          problemsSolved: -1
        }
      }
    ]);

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching global leaderboard',
    });
  }
});

// @route   GET /api/leaderboard/contest/:id
// @desc    Get contest leaderboard
// @access  Private
router.get('/contest/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const contest = await Contest.findById(req.params.id).populate('participants.user', 'username');

    if (!contest) {
      res.status(404).json({
        success: false,
        message: 'Contest not found',
      });
      return;
    }

    // Sort participants by score and update ranks
    const leaderboard = contest.participants
      .sort((a, b) => b.score - a.score)
      .map((participant, index) => ({
        rank: index + 1,
        username: (participant.user as any).username,
        score: participant.score,
      }));

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('Get contest leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contest leaderboard',
    });
  }
});

export default router;
