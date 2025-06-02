import mongoose from 'mongoose';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface IProblem extends mongoose.Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  memoryLimit: number;
  testCases: TestCase[];
  sampleTestCases: TestCase[];
  createdBy: mongoose.Types.ObjectId;
  contestId?: mongoose.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    timeLimit: {
      type: Number,
      required: true,
      default: 1000, // milliseconds
    },
    memoryLimit: {
      type: Number,
      required: true,
      default: 256, // MB
    },
    testCases: [
      {
        input: {
          type: String,
          required: true,
        },
        expectedOutput: {
          type: String,
          required: true,
        },
        isHidden: {
          type: Boolean,
          default: true,
        },
      },
    ],
    sampleTestCases: [
      {
        input: {
          type: String,
          required: true,
        },
        expectedOutput: {
          type: String,
          required: true,
        },
        isHidden: {
          type: Boolean,
          default: false,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProblem>('Problem', problemSchema);
