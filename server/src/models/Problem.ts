import mongoose, { Schema, Document } from 'mongoose';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface IProblem extends Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  testCases: TestCase[];
  timeLimit: number;
  memoryLimit: number;
  createdBy: mongoose.Types.ObjectId | 'AI_GENERATOR';
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: [true, 'Problem difficulty is required'],
    },
    tags: [{
      type: String,
      trim: true,
    }],
    testCases: [{
      input: {
        type: String,
        required: [true, 'Test case input is required'],
      },
      expectedOutput: {
        type: String,
        required: [true, 'Test case expected output is required'],
      },
      isHidden: {
        type: Boolean,
        default: false,
      },
    }],
    timeLimit: {
      type: Number,
      default: 1000, // in milliseconds
    },
    memoryLimit: {
      type: Number,
      default: 256, // in MB
    },
    createdBy: {
      type: Schema.Types.Mixed,
      required: [true, 'Problem creator is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
problemSchema.index({ title: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ status: 1 });

export const Problem = mongoose.model<IProblem>('Problem', problemSchema);
