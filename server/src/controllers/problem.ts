import { Request, Response } from 'express';
import { Problem } from '../models/Problem';
import { AuthRequest } from '../types';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

// @desc    Create new problem
// @route   POST /api/problems
// @access  Private/Admin
export const createProblem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
    }

    const problem = await Problem.create({
      ...req.body,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    logger.error('Error creating problem:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({
      success: false,
      error: 'Error creating problem',
    });
  }
};

// @desc    Get daily problem
// @route   GET /api/problems/daily
// @access  Public
export const getDailyProblem = async (req: Request, res: Response) => {
  try {
    // Get today's date at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Get tomorrow's date at midnight UTC
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find a problem that was created today
    let dailyProblem = await Problem.findOne({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'published'
    });

    // If no problem was created today, get the most recently created problem
    if (!dailyProblem) {
      dailyProblem = await Problem.findOne({ status: 'published' })
        .sort({ createdAt: -1 });
    }

    if (!dailyProblem) {
      throw new AppError('No daily problem available', 404);
    }

    res.status(200).json({
      success: true,
      data: dailyProblem
    });
  } catch (error) {
    logger.error('Error getting daily problem:', error);
    throw new AppError('Error getting daily problem', 500);
  }
};

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
export const getProblems = async (req: Request, res: Response) => {
  try {
    const problems = await Problem.find({ status: 'published' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: problems
    });
  } catch (error) {
    logger.error('Error getting problems:', error);
    throw new AppError('Error getting problems', 500);
  }
};

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
export const getProblem = async (req: Request, res: Response) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    // Remove hidden test cases for non-admin users
    if (req.user?.role !== 'admin') {
      problem.testCases = problem.testCases.filter((test: any) => !test.isHidden);
    }

    res.json({
      status: 'success',
      data: problem,
    });
  } catch (error) {
    logger.error('Error getting problem:', error);
    throw new AppError('Error getting problem', 500);
  }
};

// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private/Admin
export const updateProblem = async (req: Request, res: Response) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    logger.error('Error updating problem:', error);
    throw new AppError('Error updating problem', 500);
  }
};

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
export const deleteProblem = async (req: Request, res: Response) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('Error deleting problem:', error);
    throw new AppError('Error deleting problem', 500);
  }
};
