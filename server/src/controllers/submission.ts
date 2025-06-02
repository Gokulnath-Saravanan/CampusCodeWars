import { Request, Response } from 'express';
import Submission from '../models/Submission';
import Problem from '../models/Problem';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface TestResult {
  passed: boolean;
  output: string;
  expectedOutput: string;
  runtime: number;
  memory: number;
}

interface ExecutionResult {
  output: string;
  runtime: number;
  memory: number;
}

// @desc    Submit code for a problem
export const submitCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code, problemId } = req.body;

    // Validate input
    if (!code || !problemId) {
      return res.status(400).json({ message: 'Please provide code and problem ID' });
    }

    // Get problem
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Create submission
    const submission = await Submission.create({
      code,
      problem: problemId,
      user: req.user.id,
      status: 'pending',
    });

    // Run test cases
    const testResults = await Promise.all(
      problem.testCases.map(async (test: TestCase) => {
        // Execute code against test case
        const executionResult = await executeCode(submission.code, test.input);
        return {
          passed: executionResult.output === test.expectedOutput,
          output: executionResult.output,
          expectedOutput: test.expectedOutput,
          runtime: executionResult.runtime,
          memory: executionResult.memory,
        };
      })
    );

    // Update submission with results
    submission.status = testResults.every((result) => result.passed) ? 'accepted' : 'wrong_answer';
    submission.testResults = testResults;

    await submission.save();

    res.json(submission);
  } catch (error) {
    logger.error('Error submitting code:', error);
    res.status(500).json({ message: 'Error submitting code' });
  }
};

// @desc    Get all submissions for a user
export const getUserSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await Submission.find({ user: req.user.id })
      .populate('problem', 'title difficulty')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    logger.error('Error getting user submissions:', error);
    res.status(500).json({ message: 'Error getting user submissions' });
  }
};

// @desc    Get submission by ID
export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problem', 'title difficulty')
      .populate('user', 'username');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    logger.error('Error getting submission:', error);
    res.status(500).json({ message: 'Error getting submission' });
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
