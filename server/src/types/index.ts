import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user: IUser;
}

export interface ContestQuery {
  status?: string;
  visibility?: string;
}

export interface ProblemQuery {
  difficulty?: string;
  category?: string;
  title?: { $regex: string; $options: string };
}

export interface SubmissionScore {
  accuracy: number;
  timeComplexity: number;
  spaceComplexity: number;
  codeQuality: number;
}

export interface ScoringCriteria {
  accuracy: number;
  timeComplexity: number;
  spaceComplexity: number;
  codeQuality: number;
} 