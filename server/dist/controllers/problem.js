"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProblem = exports.updateProblem = exports.getProblem = exports.getProblems = exports.createProblem = void 0;
const Problem_1 = __importDefault(require("../models/Problem"));
const logger_1 = __importDefault(require("../utils/logger"));
// @desc    Create new problem
// @route   POST /api/problems
// @access  Private/Admin
const createProblem = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized',
            });
        }
        const problem = await Problem_1.default.create({
            ...req.body,
            createdBy: req.user._id,
        });
        return res.status(201).json({
            success: true,
            data: problem,
        });
    }
    catch (error) {
        logger_1.default.error('Error creating problem:', error instanceof Error ? error.message : 'Unknown error');
        return res.status(500).json({
            success: false,
            error: 'Error creating problem',
        });
    }
};
exports.createProblem = createProblem;
// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
const getProblems = async (_req, res) => {
    try {
        const problems = await Problem_1.default.find().select('-testCases');
        res.json({
            success: true,
            data: problems,
        });
    }
    catch (error) {
        console.error('Get problems error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching problems',
        });
    }
};
exports.getProblems = getProblems;
// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
const getProblem = async (req, res) => {
    try {
        const problem = await Problem_1.default.findById(req.params.id);
        if (!problem) {
            res.status(404).json({
                success: false,
                message: 'Problem not found',
            });
            return;
        }
        // Filter out hidden test cases for non-admin users
        if (req.user?.role !== 'admin') {
            problem.testCases = problem.testCases.filter(test => !test.isHidden);
        }
        res.json({
            success: true,
            data: problem,
        });
    }
    catch (error) {
        console.error('Get problem error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching problem',
        });
    }
};
exports.getProblem = getProblem;
// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private/Admin
const updateProblem = async (req, res) => {
    try {
        const problem = await Problem_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!problem) {
            return res.status(404).json({
                success: false,
                error: 'Problem not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: problem,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};
exports.updateProblem = updateProblem;
// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
const deleteProblem = async (req, res) => {
    try {
        const problem = await Problem_1.default.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({
                success: false,
                error: 'Problem not found',
            });
        }
        await problem.deleteOne();
        return res.status(200).json({
            success: true,
            message: 'Problem deleted successfully',
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};
exports.deleteProblem = deleteProblem;
