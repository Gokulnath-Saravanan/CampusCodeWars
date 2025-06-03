import mongoose, { Schema, Document } from 'mongoose';
import { TestCase } from '../types';

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
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      unique: true,
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: [true, 'Please add difficulty level'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    testCases: [
      {
        input: {
          type: String,
          required: [true, 'Please add test case input'],
        },
        expectedOutput: {
          type: String,
          required: [true, 'Please add expected output'],
        },
        isHidden: {
          type: Boolean,
          default: false,
        },
        timeLimit: {
          type: Number,
          default: 1000, // 1 second
        },
        memoryLimit: {
          type: Number,
          default: 256000, // 256MB
        },
      },
    ],
    sampleInput: {
      type: String,
      required: [true, 'Please add sample input'],
    },
    sampleOutput: {
      type: String,
      required: [true, 'Please add sample output'],
    },
    timeLimit: {
      type: Number,
      default: 1000, // 1 second
    },
    memoryLimit: {
      type: Number,
      default: 256000, // 256MB
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
ProblemSchema.index({ difficulty: 1 });
ProblemSchema.index({ category: 1 });

export default mongoose.model<IProblem>('Problem', ProblemSchema);
