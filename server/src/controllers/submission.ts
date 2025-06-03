import { Request, Response } from 'express';
import { Submission, TestResult } from '../models/Submission';
import { Problem } from '../models/Problem';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

// @desc    Submit code for a problem
export const submitCode = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
      return;
    }

    const { code, language, problemId } = req.body;

    // Get the problem to check difficulty
    const problem = await Problem.findById(problemId);
    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
      return;
    }

    // Mock test execution - replace with actual test runner
    const testResults: TestResult[] = [
      {
        input: 'test input',
        expectedOutput: 'expected output',
        actualOutput: 'actual output',
        passed: true,
        timeUsed: 100,
        memoryUsed: 1024,
      },
    ];

    const submission = await Submission.create({
      code,
      language,
      problemId,
      userId: req.user._id,
      status: 'completed',
      testResults,
      runtime: testResults.reduce((acc, curr) => acc + curr.timeUsed, 0),
      memory: testResults.reduce((acc, curr) => acc + curr.memoryUsed, 0),
    });

    // Calculate points based on difficulty
    let pointsEarned = 0;
    switch (problem.difficulty) {
      case 'easy':
        pointsEarned = 10;
        break;
      case 'medium':
        pointsEarned = 20;
        break;
      case 'hard':
        pointsEarned = 30;
        break;
    }

    // Update user's points and problems solved
    const user = await User.findById(req.user._id);
    if (user) {
      // Check if this is the first time solving this problem
      const previousSubmission = await Submission.findOne({
        userId: req.user._id,
        problemId,
        status: 'completed',
      }).sort({ createdAt: -1 });

      if (!previousSubmission) {
        user.totalPoints += pointsEarned;
        user.problemsSolved += 1;
        await user.save();
      }
    }

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    logger.error('Error submitting code:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      error: 'Error submitting code',
    });
  }
};

// @desc    Get all submissions for a user
export const getUserSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
      return;
    }

    const submissions = await Submission.find({ userId: req.user._id })
      .populate('problemId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    logger.error('Error getting user submissions:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      error: 'Error getting user submissions',
    });
  }
};

// @desc    Get submission by ID
export const getSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('userId', 'username')
      .populate('problemId', 'title');

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    // Check if user owns the submission or is admin
    if (submission.userId.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission',
      });
      return;
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submission',
    });
  }
};
