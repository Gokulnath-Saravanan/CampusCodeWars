import { Request, Response } from 'express';
import { User } from '../models/User';
import { Submission } from '../models/Submission';
import { Contest } from '../models/Contest';
import { AppError } from '../middleware/errorHandler';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    throw new AppError('Error fetching user profile', 500);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user?._id,
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
    throw new AppError('Error updating user profile', 500);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Add your statistics gathering logic here
    const stats = {
      // Add relevant user statistics
      totalSubmissions: 0,
      problemsSolved: 0,
      contestsParticipated: 0,
    };

    res.json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    throw new AppError('Error fetching user statistics', 500);
  }
};

// @desc    Get user submissions
// @route   GET /api/users/submissions
// @access  Private
export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find({ userId: req.user?._id })
      .populate('problemId', 'title')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: submissions,
    });
  } catch (error) {
    throw new AppError('Error fetching user submissions', 500);
  }
};

// @desc    Get user contests
// @route   GET /api/users/contests
// @access  Private
export const getContests = async (req: Request, res: Response) => {
  try {
    const contests = await Contest.find({
      'participants.user': req.user?._id,
    }).sort({ startTime: -1 });

    res.json({
      status: 'success',
      data: contests,
    });
  } catch (error) {
    throw new AppError('Error fetching user contests', 500);
  }
}; 