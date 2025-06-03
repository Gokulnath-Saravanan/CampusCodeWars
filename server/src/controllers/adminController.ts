import { Request, Response } from 'express';
import { Problem } from '../models/Problem';
import { generateProblemManually } from '../scripts/geminiProblemGenerator';
import { problemTemplates } from '../utils/problemTemplates';
import { validateProblem } from '../utils/problemValidator';
import logger from '../utils/logger';

export const generateProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    await generateProblemManually();
    res.status(200).json({ message: 'Problem generated successfully' });
  } catch (error) {
    logger.error('Error in generateProblem:', error);
    res.status(500).json({ error: 'Failed to generate problem' });
  }
};

export const generateCustomProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type = 'algorithmic' } = req.body;
    const template = problemTemplates[type as keyof typeof problemTemplates];
    
    if (!template) {
      res.status(400).json({ error: 'Invalid problem type' });
      return;
    }
    
    await generateProblemManually(template);
    res.status(200).json({ message: 'Custom problem generated successfully' });
  } catch (error) {
    logger.error('Error in generateCustomProblem:', error);
    res.status(500).json({ error: 'Failed to generate custom problem' });
  }
};

export const listProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, difficulty, page = 1, limit = 10 } = req.query;
    const query: any = {};
    
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;
    
    const problems = await Problem.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    
    const total = await Problem.countDocuments(query);
    
    res.status(200).json({
      problems,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    logger.error('Error in listProblems:', error);
    res.status(500).json({ error: 'Failed to list problems' });
  }
};

export const updateProblemStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const problem = await Problem.findById(id);
    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    // Validate the problem before updating status
    const validation = validateProblem(problem);
    if (!validation.isValid && status === 'active') {
      res.status(400).json({ 
        error: 'Cannot activate problem with validation errors',
        validationErrors: validation.errors 
      });
      return;
    }
    
    problem.status = status;
    await problem.save();
    
    res.status(200).json(problem);
  } catch (error) {
    logger.error('Error in updateProblemStatus:', error);
    res.status(500).json({ error: 'Failed to update problem status' });
  }
};

export const deleteProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const problem = await Problem.findByIdAndDelete(id);
    
    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }
    
    res.status(200).json({ message: 'Problem deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteProblem:', error);
    res.status(500).json({ error: 'Failed to delete problem' });
  }
}; 