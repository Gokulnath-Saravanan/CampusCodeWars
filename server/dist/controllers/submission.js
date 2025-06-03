"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubmission = exports.getUserSubmissions = exports.submitCode = void 0;
const Submission_1 = __importDefault(require("../models/Submission"));
const logger_1 = __importDefault(require("../utils/logger"));
// @desc    Submit code for a problem
const submitCode = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authorized',
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
                memoryUsed: 1024,
            },
        ];
        const submission = await Submission_1.default.create({
            code,
            language,
            problem: problemId,
            user: req.user._id,
            status: 'completed',
            testResults,
            runtime: testResults.reduce((acc, curr) => acc + curr.timeUsed, 0),
            memory: testResults.reduce((acc, curr) => acc + curr.memoryUsed, 0),
        });
        res.status(201).json({
            success: true,
            data: submission,
        });
    }
    catch (error) {
        logger_1.default.error('Error submitting code:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({
            success: false,
            error: 'Error submitting code',
        });
    }
};
exports.submitCode = submitCode;
// @desc    Get all submissions for a user
const getUserSubmissions = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authorized',
            });
            return;
        }
        const submissions = await Submission_1.default.find({ user: req.user._id })
            .populate('problem', 'title')
            .sort('-createdAt');
        res.status(200).json({
            success: true,
            data: submissions,
        });
    }
    catch (error) {
        logger_1.default.error('Error getting user submissions:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({
            success: false,
            error: 'Error getting user submissions',
        });
    }
};
exports.getUserSubmissions = getUserSubmissions;
// @desc    Get submission by ID
const getSubmission = async (req, res) => {
    try {
        const submission = await Submission_1.default.findById(req.params.id)
            .populate('problem', 'title difficulty testCases')
            .populate('user', 'username');
        if (!submission) {
            res.status(404).json({
                success: false,
                message: 'Submission not found',
            });
            return;
        }
        // Check if user owns the submission or is admin
        if (submission.user._id.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Not authorized to view this submission',
            });
            return;
        }
        res.json({
            success: true,
            data: submission,
        });
    }
    catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching submission',
        });
    }
};
exports.getSubmission = getSubmission;
