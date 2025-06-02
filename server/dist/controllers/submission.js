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
exports.getSubmission = exports.getUserSubmissions = exports.submitCode = void 0;
const Submission_1 = __importDefault(require("../models/Submission"));
const logger_1 = __importDefault(require("../utils/logger"));
// @desc    Submit code for a problem
const submitCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
            return;
        }
        const { code, language, problemId } = req.body;
        // Mock test execution - replace with actual test runner
        const testResults = [
            {
                input: 'test input',
                expectedOutput: 'expected output',
                actualOutput: 'actual output',
                passed: true,
                timeUsed: 100,
                memoryUsed: 1024
            }
        ];
        const submission = yield Submission_1.default.create({
            code,
            language,
            problem: problemId,
            user: req.user._id,
            status: 'completed',
            testResults,
            runtime: testResults.reduce((acc, curr) => acc + curr.timeUsed, 0),
            memory: testResults.reduce((acc, curr) => acc + curr.memoryUsed, 0)
        });
        res.status(201).json({
            success: true,
            data: submission
        });
    }
    catch (error) {
        logger_1.default.error('Error submitting code:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({
            success: false,
            error: 'Error submitting code'
        });
    }
});
exports.submitCode = submitCode;
// @desc    Get all submissions for a user
const getUserSubmissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
            return;
        }
        const submissions = yield Submission_1.default.find({ user: req.user._id })
            .populate('problem', 'title')
            .sort('-createdAt');
        res.status(200).json({
            success: true,
            data: submissions
        });
    }
    catch (error) {
        logger_1.default.error('Error getting user submissions:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({
            success: false,
            error: 'Error getting user submissions'
        });
    }
});
exports.getUserSubmissions = getUserSubmissions;
// @desc    Get submission by ID
const getSubmission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
            return;
        }
        const submission = yield Submission_1.default.findById(req.params.id)
            .populate('problem', 'title')
            .populate('user', 'username');
        if (!submission) {
            res.status(404).json({
                success: false,
                error: 'Submission not found'
            });
            return;
        }
        // Only allow users to view their own submissions
        if (submission.user.toString() !== req.user._id.toString()) {
            res.status(403).json({
                success: false,
                error: 'Not authorized to view this submission'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: submission
        });
    }
    catch (error) {
        logger_1.default.error('Error getting submission:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({
            success: false,
            error: 'Error getting submission'
        });
    }
});
exports.getSubmission = getSubmission;
// Helper function to execute code
const executeCode = (_code, _input) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Implement actual code execution
    // For now, return mock results
    return {
        output: 'Mock output',
        runtime: 100,
        memory: 50000,
    };
});
