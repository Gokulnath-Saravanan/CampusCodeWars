import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateProblem } from '../services/problemGenerator';
import { Problem } from '../models/Problem';
import { connect, disconnect } from '../config/database';

describe('Problem Generator', () => {
  beforeEach(async () => {
    await connect();
  });

  afterEach(async () => {
    await Problem.deleteMany({});
    await disconnect();
  });

  it('should generate a valid problem', async () => {
    const problem = await generateProblem({
      difficulty: 'medium',
      tags: ['arrays', 'algorithms'],
    });

    expect(problem).toBeDefined();
    expect(problem.title).toBeDefined();
    expect(problem.description).toBeDefined();
    expect(problem.difficulty).toBe('medium');
    expect(problem.tags).toContain('arrays');
    expect(problem.tags).toContain('algorithms');
    expect(problem.testCases.length).toBeGreaterThan(0);
    expect(problem.createdBy).toBe('AI_GENERATOR');
  });

  it('should handle invalid difficulty level', async () => {
    await expect(
      generateProblem({
        difficulty: 'invalid' as any,
        tags: ['arrays'],
      })
    ).rejects.toThrow();
  });

  it('should generate problems with different difficulties', async () => {
    const easyProblem = await generateProblem({
      difficulty: 'easy',
      tags: ['strings'],
    });
    const hardProblem = await generateProblem({
      difficulty: 'hard',
      tags: ['dynamic-programming'],
    });

    expect(easyProblem.difficulty).toBe('easy');
    expect(hardProblem.difficulty).toBe('hard');
    expect(easyProblem.title).not.toBe(hardProblem.title);
  });
}); 