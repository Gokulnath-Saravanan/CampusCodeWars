import mongoose, { Schema, Document } from 'mongoose';

export interface ContestParticipant {
  user: mongoose.Types.ObjectId;
  score: number;
  submissions: mongoose.Types.ObjectId[];
  joinedAt: Date;
}

export interface IContest extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  problems: mongoose.Types.ObjectId[];
  participants: ContestParticipant[];
  maxParticipants: number;
  registrationOpen: boolean;
  createdBy: mongoose.Types.ObjectId;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const contestSchema = new Schema<IContest>(
  {
    title: {
      type: String,
      required: [true, 'Contest title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Contest description is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    problems: [{
      type: Schema.Types.ObjectId,
      ref: 'Problem',
    }],
    participants: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      score: {
        type: Number,
        default: 0,
      },
      submissions: [{
        type: Schema.Types.ObjectId,
        ref: 'Submission',
      }],
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    maxParticipants: {
      type: Number,
      required: [true, 'Maximum participants count is required'],
    },
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contest creator is required'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
contestSchema.index({ startTime: 1 });
contestSchema.index({ endTime: 1 });
contestSchema.index({ status: 1 });
contestSchema.index({ 'participants.user': 1 });

// Update contest status based on time
contestSchema.pre('save', function(next) {
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

export const Contest = mongoose.model<IContest>('Contest', contestSchema);
export default Contest;
