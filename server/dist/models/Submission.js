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
exports.Submission = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const submissionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    problemId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Problem',
        required: [true, 'Problem ID is required'],
    },
    contestId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Contest',
    },
    code: {
        type: String,
        required: [true, 'Code is required'],
    },
    language: {
        type: String,
        required: [true, 'Programming language is required'],
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'wrong_answer', 'runtime_error', 'compilation_error'],
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
    testCasesPassed: {
        type: Number,
        default: 0,
    },
    totalTestCases: {
        type: Number,
        required: [true, 'Total test cases count is required'],
    },
}, {
    timestamps: true,
});
// Index for faster queries
submissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });
submissionSchema.index({ contestId: 1, userId: 1, createdAt: -1 });
exports.Submission = mongoose_1.default.model('Submission', submissionSchema);
