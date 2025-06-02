"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const submissionSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    problem: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    },
    contestId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Contest',
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
        enum: ['javascript', 'python', 'java', 'cpp'],
    },
    status: {
        type: String,
        enum: [
            'pending',
            'running',
            'accepted',
            'wrong_answer',
            'time_limit_exceeded',
            'memory_limit_exceeded',
            'runtime_error',
        ],
        default: 'pending',
    },
    runtime: {
        type: Number,
        default: 0,
    },
    memory: {
        type: Number,
        default: 0,
    },
    testResults: [
        {
            passed: Boolean,
            input: String,
            expectedOutput: String,
            actualOutput: String,
            timeUsed: Number,
            memoryUsed: Number,
        },
    ],
    score: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
// Index for faster queries
submissionSchema.index({ user: 1, problem: 1, createdAt: -1 });
submissionSchema.index({ contestId: 1, user: 1, createdAt: -1 });
exports.default = mongoose_1.default.model('Submission', submissionSchema);
