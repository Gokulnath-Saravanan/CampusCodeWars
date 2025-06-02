import mongoose from 'mongoose';

export interface IContest extends mongoose.Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  problems: mongoose.Types.ObjectId[];
  participants: {
    user: mongoose.Types.ObjectId;
    score: number;
    rank?: number;
    joinedAt: Date;
  }[];
  createdBy: mongoose.Types.ObjectId;
  status: 'upcoming' | 'ongoing' | 'completed';
  isPublic: boolean;
  rules: string[];
  createdAt: Date;
  updatedAt: Date;
}

const contestSchema = new mongoose.Schema(
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
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    problems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
      },
    ],
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        score: {
          type: Number,
          default: 0,
        },
        rank: Number,
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    rules: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Update contest status based on time
contestSchema.pre('save', function (next) {
  const now = new Date();
  if (now < this.startTime) {
    this.status = 'upcoming';
  } else if (now >= this.startTime && now <= this.endTime) {
    this.status = 'ongoing';
  } else {
    this.status = 'completed';
  }
  next();
});

// Indexes for faster queries
contestSchema.index({ status: 1, startTime: -1 });
contestSchema.index({ 'participants.user': 1 });

export default mongoose.model<IContest>('Contest', contestSchema);
