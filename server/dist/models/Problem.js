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
exports.Problem = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const problemSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.Mixed,
        required: [true, 'Problem creator is required'],
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
    },
}, {
    timestamps: true,
});
// Indexes for faster queries
problemSchema.index({ title: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ status: 1 });
exports.Problem = mongoose_1.default.model('Problem', problemSchema);
