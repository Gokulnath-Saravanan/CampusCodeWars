"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const problemSchema = new mongoose_1.default.Schema({
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
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
    },
    timeLimit: {
        type: Number,
        required: true,
        default: 1000, // milliseconds
    },
    memoryLimit: {
        type: Number,
        required: true,
        default: 256, // MB
    },
    testCases: [
        {
            input: {
                type: String,
                required: true,
            },
            expectedOutput: {
                type: String,
                required: true,
            },
            isHidden: {
                type: Boolean,
                default: true,
            },
        },
    ],
    sampleTestCases: [
        {
            input: {
                type: String,
                required: true,
            },
            expectedOutput: {
                type: String,
                required: true,
            },
            isHidden: {
                type: Boolean,
                default: false,
            },
        },
    ],
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    contestId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Contest',
    },
    tags: [
        {
            type: String,
            trim: true,
        },
    ],
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('Problem', problemSchema);
