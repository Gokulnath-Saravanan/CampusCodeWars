import { Request, Response } from 'express';
import Problem from '../models/Problem';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

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
    logger.error(
      'Error creating problem:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return res.status(500).json({
      success: false,
      error: 'Error creating problem',
    });
  }
};

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
export const getProblems = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const problems = await Problem.find().select('-testCases');
    res.json({
      success: true,
      data: problems,
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching problems',
    });
  }
};

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
export const getProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
      return;
    }

    // Filter out hidden test cases for non-admin users
    if (req.user?.role !== 'admin') {
      problem.testCases = problem.testCases.filter((test) => !test.isHidden);
    }

    res.json({
      success: true,
      data: problem,
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching problem',
    });
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
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
export const deleteProblem = async (req: Request, res: Response) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
    }

    await problem.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Problem deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};
