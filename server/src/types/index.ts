import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  _id: Types.ObjectId;
  matchPassword(candidatePassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

export interface IContest extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  isRegistrationOpen: boolean;
  status: string;
  visibility: string;
  problems: Types.ObjectId[];
  participants: {
    user: Types.ObjectId;
    score: number;
    rank?: number;
    joinedAt: Date;
  }[];
  scoringCriteria: {
    accuracy: number;
    timeComplexity: number;
    spaceComplexity: number;
    codeQuality: number;
  };
  createdBy: Types.ObjectId;
}

export interface ISubmission extends Document {
  code: string;
  language: string;
  status: string;
  runtime: number;
  memory: number;
  user: Types.ObjectId;
  problem: Types.ObjectId;
  testResults: TestResult[];
}

export interface AuthRequest extends Request {
  user?: IUser;
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

export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  timeUsed: number;
  memoryUsed: number;
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

export type LogArgs = string | number | boolean | object | null | undefined; 