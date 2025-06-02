import mongoose from 'mongoose';

export interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  timeUsed: number;
  memoryUsed: number;
}

export interface ISubmission extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  problem: mongoose.Types.ObjectId;
  contestId?: mongoose.Types.ObjectId;
  code: string;
  language: string;
  status:
    | 'pending'
    | 'running'
    | 'accepted'
    | 'wrong_answer'
    | 'time_limit_exceeded'
    | 'memory_limit_exceeded'
    | 'runtime_error';
  runtime: number;
  memory: number;
  testResults: TestResult[];
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['javascript', 'python', 'java', 'cpp'],
    },
    status: {
      type: String,
      enum: [
        'pending',
        'running',
        'accepted',
        'wrong_answer',
        'time_limit_exceeded',
        'memory_limit_exceeded',
        'runtime_error',
      ],
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
    testResults: [
      {
        passed: Boolean,
        input: String,
        expectedOutput: String,
        actualOutput: String,
        timeUsed: Number,
        memoryUsed: Number,
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
submissionSchema.index({ user: 1, problem: 1, createdAt: -1 });
submissionSchema.index({ contestId: 1, user: 1, createdAt: -1 });

export default mongoose.model<ISubmission>('Submission', submissionSchema);
