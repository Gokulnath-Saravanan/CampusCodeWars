import { Request } from 'express';
import { Document, Types } from 'mongoose';

// User types
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: 'participant' | 'organizer' | 'admin';
  problemsSolved: number;
  totalPoints: number;
  rank?: number;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(candidatePassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

// Contest types
export interface ContestParticipant {
  user: Types.ObjectId;
  score: number;
  submissions: Types.ObjectId[];
  joinedAt: Date;
  rank?: number;
}

export interface IContest extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  problems: Types.ObjectId[];
  participants: ContestParticipant[];
  isActive: boolean;
  registrationOpen: boolean;
  maxParticipants: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Problem types
export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  timeLimit?: number;
  memoryLimit?: number;
}

export interface IProblem extends Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  testCases: TestCase[];
  sampleInput: string;
  sampleOutput: string;
  timeLimit: number;
  memoryLimit: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Submission types
export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  timeUsed: number;
  memoryUsed: number;
}

export interface ISubmission extends Document {
  code: string;
  language: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  runtime: number;
  memory: number;
  user: Types.ObjectId;
  problem: Types.ObjectId;
  testResults: TestResult[];
  createdAt: Date;
  updatedAt: Date;
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
