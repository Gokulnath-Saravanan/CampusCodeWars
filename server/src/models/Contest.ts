import mongoose, { Schema, Document } from 'mongoose';

interface ContestParticipant {
  user: mongoose.Types.ObjectId;
  score: number;
  submissions: mongoose.Types.ObjectId[];
  joinedAt: Date;
  rank?: number;
}

export interface IContest extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  problems: mongoose.Types.ObjectId[];
  participants: ContestParticipant[];
  isActive: boolean;
  registrationOpen: boolean;
  maxParticipants: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContestSchema = new Schema<IContest>(
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
    startTime: {
      type: Date,
      required: [true, 'Please add a start time'],
    },
    endTime: {
      type: Date,
      required: [true, 'Please add an end time'],
    },
    duration: {
      type: Number,
      required: [true, 'Please add duration in minutes'],
    },
    problems: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        required: [true, 'Please add at least one problem'],
      },
    ],
    participants: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        score: {
          type: Number,
          default: 0,
        },
        submissions: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Submission',
          },
        ],
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        rank: {
          type: Number,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Please add maximum number of participants'],
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
ContestSchema.index({ startTime: 1 });
ContestSchema.index({ endTime: 1 });
ContestSchema.index({ isActive: 1 });
ContestSchema.index({ registrationOpen: 1 });

// Middleware to validate start and end times
ContestSchema.pre('save', function (next) {
  if (this.startTime >= this.endTime) {
    next(new Error('Start time must be before end time'));
  }
  next();
});

// Add methods if needed
ContestSchema.methods.updateParticipantScore = async function (userId: string, newScore: number) {
  const participant = this.participants.find(
    (p: ContestParticipant) => p.user.toString() === userId
  );
  if (participant) {
    participant.score = newScore;
    await this.save();
  }
};

// Update contest status based on time
ContestSchema.pre('save', function (next) {
  const now = new Date();
  if (now < this.startTime) {
    this.isActive = false;
  } else if (now >= this.startTime && now <= this.endTime) {
    this.isActive = true;
  } else {
    this.isActive = false;
  }
  next();
});

// Indexes for faster queries
ContestSchema.index({ isActive: 1, startTime: -1 });
ContestSchema.index({ 'participants.user': 1 });

export default mongoose.model<IContest>('Contest', ContestSchema);
