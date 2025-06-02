import { Request, Response } from 'express';
import Submission from '../models/Submission';
import Problem from '../models/Problem';
import { AuthRequest, TestResult } from '../types';
import logger from '../utils/logger';

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface ExecutionResult {
  output: string;
  runtime: number;
  memory: number;
}

// @desc    Submit code for a problem
export const submitCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
      return;
    }

    const { code, language, problemId } = req.body;

    // Mock test execution - replace with actual test runner
    const testResults: TestResult[] = [
      {
        input: 'test input',
        expectedOutput: 'expected output',
        actualOutput: 'actual output',
        passed: true,
        timeUsed: 100,
        memoryUsed: 1024
      }
    ];

    const submission = await Submission.create({
      code,
      language,
      problem: problemId,
      user: req.user._id,
      status: 'completed',
      testResults,
      runtime: testResults.reduce((acc, curr) => acc + curr.timeUsed, 0),
      memory: testResults.reduce((acc, curr) => acc + curr.memoryUsed, 0)
    });

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    logger.error('Error submitting code:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      error: 'Error submitting code'
    });
  }
};

// @desc    Get all submissions for a user
export const getUserSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
      return;
    }

    const submissions = await Submission.find({ user: req.user._id })
      .populate('problem', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    logger.error('Error getting user submissions:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      error: 'Error getting user submissions'
    });
  }
};

// @desc    Get submission by ID
export const getSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
      return;
    }

    const submission = await Submission.findById(req.params.id)
      .populate('problem', 'title')
      .populate('user', 'username');

    if (!submission) {
      res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
      return;
    }

    // Only allow users to view their own submissions
    if (submission.user.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to view this submission'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    logger.error('Error getting submission:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      error: 'Error getting submission'
    });
  }
};

// Helper function to execute code
const executeCode = async (_code: string, _input: string): Promise<ExecutionResult> => {
  // TODO: Implement actual code execution
  // For now, return mock results
  return {
    output: 'Mock output',
    runtime: 100,
    memory: 50000,
  };
};
