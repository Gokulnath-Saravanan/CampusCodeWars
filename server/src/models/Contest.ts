import mongoose from 'mongoose';
import { IContest } from '../types';

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
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
    isRegistrationOpen: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    problems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
    }],
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      score: {
        type: Number,
        default: 0,
      },
      rank: {
        type: Number,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    scoringCriteria: {
      accuracy: {
        type: Number,
        required: true,
        default: 40,
      },
      timeComplexity: {
        type: Number,
        required: true,
        default: 20,
      },
      spaceComplexity: {
        type: Number,
        required: true,
        default: 20,
      },
      codeQuality: {
        type: Number,
        required: true,
        default: 20,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

interface IParticipant {
  user: mongoose.Types.ObjectId;
  score: number;
  rank?: number;
  joinedAt: Date;
}

// Add methods if needed
contestSchema.methods.updateParticipantScore = async function(userId: string, newScore: number) {
  const participant = this.participants.find((p: IParticipant) => p.user.toString() === userId);
  if (participant) {
    participant.score = newScore;
    await this.save();
  }
};

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
