"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ContestSchema = new mongoose_1.Schema({
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
    problems: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Problem',
            required: [true, 'Please add at least one problem'],
        }],
    participants: [{
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            score: {
                type: Number,
                default: 0,
            },
            submissions: [{
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: 'Submission',
                }],
            joinedAt: {
                type: Date,
                default: Date.now,
            },
            rank: {
                type: Number,
            },
        }],
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
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
ContestSchema.methods.updateParticipantScore = async function (userId, newScore) {
    const participant = this.participants.find((p) => p.user.toString() === userId);
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
    }
    else if (now >= this.startTime && now <= this.endTime) {
        this.isActive = true;
    }
    else {
        this.isActive = false;
    }
    next();
});
// Indexes for faster queries
ContestSchema.index({ isActive: 1, startTime: -1 });
ContestSchema.index({ 'participants.user': 1 });
exports.default = mongoose_1.default.model('Contest', ContestSchema);
