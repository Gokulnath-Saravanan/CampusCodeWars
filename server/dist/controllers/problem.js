"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProblem = exports.updateProblem = exports.getProblem = exports.getProblems = exports.createProblem = void 0;
const Problem_1 = require("../models/Problem");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler_1 = require("../middleware/errorHandler");
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
        const problem = await Problem_1.Problem.create({
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
const getProblems = async (req, res) => {
    var _a;
    try {
        const problems = await Problem_1.Problem.find({ status: 'published' });
        // Remove hidden test cases for non-admin users
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            problems.forEach(problem => {
                problem.testCases = problem.testCases.filter((test) => !test.isHidden);
            });
        }
        res.json({
            status: 'success',
            data: problems,
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Error fetching problems', 500);
    }
};
exports.getProblems = getProblems;
// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
const getProblem = async (req, res) => {
    var _a;
    try {
        const problem = await Problem_1.Problem.findById(req.params.id);
        if (!problem) {
            throw new errorHandler_1.AppError('Problem not found', 404);
        }
        // Remove hidden test cases for non-admin users
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            problem.testCases = problem.testCases.filter((test) => !test.isHidden);
        }
        res.json({
            status: 'success',
            data: problem,
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Error fetching problem', 500);
    }
};
exports.getProblem = getProblem;
// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private/Admin
const updateProblem = async (req, res) => {
    try {
        const problem = await Problem_1.Problem.findByIdAndUpdate(req.params.id, req.body, {
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
        const problem = await Problem_1.Problem.findById(req.params.id);
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
