import { Request, Response } from 'express';
import Problem from '../models/Problem';

// @desc    Create new problem
// @route   POST /api/problems
// @access  Private/Admin
export const createProblem = async (req: Request, res: Response) => {
  try {
    const problem = await Problem.create({
      ...req.body,
      createdBy: (req as any).user.id,
    });

    res.status(201).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
export const getProblems = async (req: Request, res: Response) => {
  try {
    const { difficulty, category, search } = req.query;
    const query: any = {};

    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Filter by category
    if (category) {
      query.category = { $in: [category] };
    }

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const problems = await Problem.find(query)
      .select('-testCases.expectedOutput -testCases.input')
      .populate('createdBy', 'username');

    res.status(200).json({
      success: true,
      count: problems.length,
      data: problems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
export const getProblem = async (req: Request, res: Response) => {
  try {
    const problem = await Problem.findById(req.params.id).populate('createdBy', 'username');

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
    }

    // Remove hidden test cases for non-admin users
    if ((req as any).user?.role !== 'admin') {
      problem.testCases = problem.testCases.filter((test) => !test.isHidden);
    }

    res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
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

    res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    res.status(500).json({
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
