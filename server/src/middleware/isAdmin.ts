import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    throw new AppError('Not authorized to access this route', 403);
  }
  next();
}; 