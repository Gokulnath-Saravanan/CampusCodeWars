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
exports.Contest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const contestSchema = new mongoose_1.Schema({
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Problem',
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Contest creator is required'],
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming',
    },
}, {
    timestamps: true,
});
// Add indexes
contestSchema.index({ startTime: 1 });
contestSchema.index({ endTime: 1 });
contestSchema.index({ status: 1 });
contestSchema.index({ 'participants.user': 1 });
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
exports.Contest = mongoose_1.default.model('Contest', contestSchema);
exports.default = exports.Contest;
