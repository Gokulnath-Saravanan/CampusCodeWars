import { Request, Response } from 'express';
import { User } from '../models/User';
import { Contest } from '../models/Contest';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

// @desc    Get global leaderboard
// @route   GET /api/leaderboard
// @access  Public
export const getGlobalLeaderboard = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    const leaderboard = await User.find()
      .select('username totalPoints problemsSolved')
      .sort({ totalPoints: -1, problemsSolved: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments();

    // Calculate and update ranks
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: skip + index + 1
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching global leaderboard:', error);
    throw new AppError('Error fetching leaderboard', 500);
  }
};

// @desc    Get contest leaderboard
// @route   GET /api/leaderboard/contests/:contestId
// @access  Public
export const getContestLeaderboard = async (req: Request, res: Response) => {
  try {
    const { contestId } = req.params;
    
    const contest = await Contest.findById(contestId)
      .populate('participants.user', 'username')
      .select('participants');

    if (!contest) {
      throw new AppError('Contest not found', 404);
    }

    // Sort participants by score in descending order
    const sortedParticipants = [...contest.participants].sort((a, b) => b.score - a.score);

    // Add rank to each participant and format the response
    const rankedLeaderboard = sortedParticipants.map((participant, index) => ({
      rank: index + 1,
      username: participant.user.username,
      contestPoints: participant.score,
      problemsSolved: participant.submissions.length
    }));

    res.status(200).json({
      success: true,
      data: rankedLeaderboard
    });
  } catch (error) {
    logger.error('Error fetching contest leaderboard:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error fetching contest leaderboard', 500);
  }
}; 