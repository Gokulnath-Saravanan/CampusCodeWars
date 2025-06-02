"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const contestSchema = new mongoose_1.default.Schema({
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Problem',
        }],
    participants: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
// Add methods if needed
contestSchema.methods.updateParticipantScore = function (userId, newScore) {
    return __awaiter(this, void 0, void 0, function* () {
        const participant = this.participants.find((p) => p.user.toString() === userId);
        if (participant) {
            participant.score = newScore;
            yield this.save();
        }
    });
};
// Update contest status based on time
contestSchema.pre('save', function (next) {
    const now = new Date();
    if (now < this.startTime) {
        this.status = 'upcoming';
    }
    else if (now >= this.startTime && now <= this.endTime) {
        this.status = 'ongoing';
    }
    else {
        this.status = 'completed';
    }
    next();
});
// Indexes for faster queries
contestSchema.index({ status: 1, startTime: -1 });
contestSchema.index({ 'participants.user': 1 });
exports.default = mongoose_1.default.model('Contest', contestSchema);
