import { Request, Response } from 'express';
import { User } from '../models/User';
import { Problem } from '../models/Problem';
import { Contest } from '../models/Contest';
import { generateProblem } from '../services/problemGenerator';
import { AppError } from '../middleware/errorHandler';

// User management
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      status: 'success',
      data: users,
    });
  } catch (error) {
    throw new AppError('Error fetching users', 500);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    throw new AppError('Error updating user', 500);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    throw new AppError('Error deleting user', 500);
  }
};

// Statistics
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      problems: await Problem.countDocuments(),
      contests: await Contest.countDocuments(),
    };

    res.json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    throw new AppError('Error fetching statistics', 500);
  }
};

// Problem management
export const generateProblemHandler = async (req: Request, res: Response) => {
  try {
    const { difficulty, tags } = req.body;
    const problem = await generateProblem({ difficulty, tags });

    res.json({
      status: 'success',
      data: problem,
    });
  } catch (error) {
    throw new AppError('Error generating problem', 500);
  }
};

export const updateProblem = async (req: Request, res: Response) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    res.json({
      status: 'success',
      data: problem,
    });
  } catch (error) {
    throw new AppError('Error updating problem', 500);
  }
};

export const deleteProblem = async (req: Request, res: Response) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    res.json({
      status: 'success',
      message: 'Problem deleted successfully',
    });
  } catch (error) {
    throw new AppError('Error deleting problem', 500);
  }
};

// Contest management
export const createContest = async (req: Request, res: Response) => {
  try {
    const contest = await Contest.create({
      ...req.body,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      status: 'success',
      data: contest,
    });
  } catch (error) {
    throw new AppError('Error creating contest', 500);
  }
};

export const updateContest = async (req: Request, res: Response) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!contest) {
      throw new AppError('Contest not found', 404);
    }

    res.json({
      status: 'success',
      data: contest,
    });
  } catch (error) {
    throw new AppError('Error updating contest', 500);
  }
};

export const deleteContest = async (req: Request, res: Response) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);

    if (!contest) {
      throw new AppError('Contest not found', 404);
    }

    res.json({
      status: 'success',
      message: 'Contest deleted successfully',
    });
  } catch (error) {
    throw new AppError('Error deleting contest', 500);
  }
}; 