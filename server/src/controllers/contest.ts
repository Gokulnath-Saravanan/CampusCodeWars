import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Contest from '../models/Contest';
import Submission from '../models/Submission';
import { AuthRequest, ContestQuery, SubmissionScore, ScoringCriteria, IContest, ISubmission } from '../types';
import logger from '../utils/logger';

// @desc    Create new contest
// @route   POST /api/contests
// @access  Private/Admin
export const createContest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
      return;
    }

    const contest = await Contest.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: contest,
    });
  } catch (error) {
    logger.error('Error creating contest:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      error: 'Error creating contest',
    });
  }
};

// @desc    Get all contests
// @route   GET /api/contests
// @access  Public
export const getContests = async (req: Request, res: Response) => {
  try {
    const { status, visibility } = req.query;
    const query: ContestQuery = {};

    if (status) {
      query.status = status as string;
    }

    if (visibility) {
      query.visibility = visibility as string;
    }

    const contests = await Contest.find(query)
      .populate('createdBy', 'username')
      .select('-problems -participants')
      .sort('-startTime');

    res.status(200).json({
      success: true,
      count: contests.length,
      data: contests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get single contest
// @route   GET /api/contests/:id
// @access  Public
export const getContest = async (req: Request, res: Response) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('problems', 'title difficulty category')
      .populate('participants.user', 'username');

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found',
      });
    }

    res.status(200).json({
      success: true,
      data: contest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Update contest
// @route   PUT /api/contests/:id
// @access  Private/Admin
export const updateContest = async (req: Request, res: Response) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found',
      });
    }

    res.status(200).json({
      success: true,
      data: contest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Delete contest
// @route   DELETE /api/contests/:id
// @access  Private/Admin
export const deleteContest = async (req: Request, res: Response) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found',
      });
    }

    await contest.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Register for contest
// @route   POST /api/contests/:id/register
// @access  Private
export const registerForContest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
      return;
    }

    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
      return;
    }

    if (!contest.isRegistrationOpen) {
      res.status(400).json({
        success: false,
        error: 'Contest registration is closed'
      });
      return;
    }

    const userId = req.user._id;
    // Check if user is already registered
    if (contest.participants.some(p => p.user.toString() === userId.toString())) {
      res.status(400).json({
        success: false,
        error: 'Already registered for this contest'
      });
      return;
    }

    contest.participants.push({
      user: userId,
      score: 0,
      joinedAt: new Date()
    });

    await contest.save();

    res.status(200).json({
      success: true,
      data: contest
    });
  } catch (error) {
    logger.error('Error registering for contest:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      error: 'Error registering for contest'
    });
  }
};

// @desc    Get contest leaderboard
// @route   GET /api/contests/:id/leaderboard
// @access  Public
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('participants.user', 'username');

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found',
      });
    }

    // Sort participants by score and update ranks
    const sortedParticipants = [...contest.participants].sort((a, b) => b.score - a.score);
    sortedParticipants.forEach((participant, index) => {
      participant.rank = index + 1;
    });

    await contest.save();

    res.status(200).json({
      success: true,
      data: sortedParticipants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Update participant scores
// @route   POST /api/contests/:id/update-scores
// @access  Private/Admin
export const updateScores = async (req: Request, res: Response) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found',
      });
    }

    // Get all submissions for this contest's problems during the contest period
    const submissions = await Submission.find({
      problem: { $in: contest.problems },
      createdAt: { $gte: contest.startTime, $lte: contest.endTime },
    });

    // Calculate scores for each participant
    for (const participant of contest.participants) {
      const userSubmissions = submissions.filter(
        (s) => s.user.toString() === participant.user.toString()
      );

      let totalScore = 0;
      for (const submission of userSubmissions) {
        // Apply scoring criteria
        const score = calculateSubmissionScore(submission, contest.scoringCriteria);
        totalScore += score;
      }

      participant.score = totalScore;
    }

    await contest.save();

    res.status(200).json({
      success: true,
      data: contest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Helper function to calculate submission score
const calculateSubmissionScore = (submission: ISubmission, criteria: IContest['scoringCriteria']): number => {
  const score: SubmissionScore = {
    accuracy: submission.testResults.filter(test => test.passed).length / submission.testResults.length * criteria.accuracy,
    timeComplexity: criteria.timeComplexity * (1 - submission.runtime / 1000),
    spaceComplexity: criteria.spaceComplexity * (1 - submission.memory / (1024 * 1024)),
    codeQuality: criteria.codeQuality
  };
  
  return Object.values(score).reduce((acc, val) => acc + val, 0);
};

// Helper function to get difficulty score
const getDifficultyScore = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 0.3;
    case 'medium':
      return 0.6;
    case 'hard':
      return 1.0;
    default:
      return 0;
  }
};

export const updateContestScore = async (submission: ISubmission, contest: IContest): Promise<void> => {
  try {
    const score = calculateSubmissionScore(submission, contest.scoringCriteria);
    const participantIndex = contest.participants.findIndex(
      p => p.user.toString() === submission.user.toString()
    );

    if (participantIndex !== -1) {
      contest.participants[participantIndex].score = score;
      await contest.save();
    }
  } catch (error) {
    logger.error('Error updating contest score:', error instanceof Error ? error.message : 'Unknown error');
  }
};
