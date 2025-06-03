import mongoose, { Document, Schema } from 'mongoose';

export interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  timeUsed: number;
  memoryUsed: number;
}

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  contestId?: mongoose.Types.ObjectId;
  code: string;
  language: string;
  status: 'pending' | 'accepted' | 'wrong_answer' | 'runtime_error' | 'compilation_error';
  runtime: number;
  memory: number;
  testCasesPassed: number;
  totalTestCases: number;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: [true, 'Problem ID is required'],
    },
    contestId: {
      type: Schema.Types.ObjectId,
      ref: 'Contest',
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
    },
    language: {
      type: String,
      required: [true, 'Programming language is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'wrong_answer', 'runtime_error', 'compilation_error'],
      default: 'pending',
    },
    runtime: {
      type: Number,
      default: 0,
    },
    memory: {
      type: Number,
      default: 0,
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      required: [true, 'Total test cases count is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
submissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });
submissionSchema.index({ contestId: 1, userId: 1, createdAt: -1 });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);
