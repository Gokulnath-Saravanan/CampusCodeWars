import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';
import { AuthRequest, IUser } from '../types';
import logger from '../utils/logger';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    return;
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

export const authorize = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    if (!roles.includes(authReq.user.role)) {
      res.status(403).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    next();
  };
};
