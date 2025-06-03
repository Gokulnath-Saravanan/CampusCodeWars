import { IProblem } from '../models/Problem';
import logger from './logger';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateProblem(problem: Partial<IProblem>): ValidationResult {
  const errors: string[] = [];

  // Title validation
  if (!problem.title) {
    errors.push('Title is required');
  } else if (problem.title.length < 5 || problem.title.length > 100) {
    errors.push('Title must be between 5 and 100 characters');
  }

  // Description validation
  if (!problem.description) {
    errors.push('Description is required');
  } else if (problem.description.length < 50) {
    errors.push('Description must be at least 50 characters');
  }

  // Difficulty validation
  if (!problem.difficulty) {
    errors.push('Difficulty is required');
  } else if (!['easy', 'medium', 'hard'].includes(problem.difficulty)) {
    errors.push('Invalid difficulty level');
  }

  // Tags validation
  if (!problem.tags || !Array.isArray(problem.tags) || problem.tags.length === 0) {
    errors.push('At least one tag is required');
  }

  // Test cases validation
  if (!problem.testCases || !Array.isArray(problem.testCases)) {
    errors.push('Test cases are required');
  } else {
    if (problem.testCases.length < 3) {
      errors.push('At least 3 test cases are required');
    }

    const hasHiddenTestCase = problem.testCases.some(tc => tc.isHidden);
    if (!hasHiddenTestCase) {
      errors.push('At least one hidden test case is required');
    }

    problem.testCases.forEach((testCase, index) => {
      if (!testCase.input || !testCase.expectedOutput) {
        errors.push(`Test case ${index + 1} must have both input and expected output`);
      }
    });
  }

  // Time and memory limits validation
  if (typeof problem.timeLimit !== 'number' || problem.timeLimit <= 0) {
    errors.push('Valid time limit is required');
  }
  if (typeof problem.memoryLimit !== 'number' || problem.memoryLimit <= 0) {
    errors.push('Valid memory limit is required');
  }

  const isValid = errors.length === 0;
  if (!isValid) {
    logger.warn('Problem validation failed:', { errors });
  }

  return { isValid, errors };
} 