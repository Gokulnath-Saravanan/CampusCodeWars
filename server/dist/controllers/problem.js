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
exports.deleteProblem = exports.updateProblem = exports.getProblem = exports.getProblems = exports.createProblem = void 0;
const Problem_1 = __importDefault(require("../models/Problem"));
const logger_1 = __importDefault(require("../utils/logger"));
// @desc    Create new problem
// @route   POST /api/problems
// @access  Private/Admin
const createProblem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
            return;
        }
        const problem = yield Problem_1.default.create(Object.assign(Object.assign({}, req.body), { createdBy: req.user._id }));
        res.status(201).json({
            success: true,
            data: problem,
        });
    }
    catch (error) {
        logger_1.default.error('Error creating problem:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({
            success: false,
            error: 'Error creating problem',
        });
    }
});
exports.createProblem = createProblem;
// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
const getProblems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { difficulty, category, search } = req.query;
        const query = {};
        // Filter by difficulty
        if (difficulty) {
            query.difficulty = difficulty;
        }
        // Filter by category
        if (category) {
            query.category = category;
        }
        // Search by title
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        const problems = yield Problem_1.default.find(query)
            .select('-testCases.expectedOutput -testCases.input')
            .populate('createdBy', 'username');
        res.status(200).json({
            success: true,
            count: problems.length,
            data: problems,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
});
exports.getProblems = getProblems;
// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
const getProblem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const problem = yield Problem_1.default.findById(req.params.id).populate('createdBy', 'username');
        if (!problem) {
            return res.status(404).json({
                success: false,
                error: 'Problem not found',
            });
        }
        // Remove hidden test cases for non-admin users
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            problem.testCases = problem.testCases.filter((test) => !test.isHidden);
        }
        res.status(200).json({
            success: true,
            data: problem,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
});
exports.getProblem = getProblem;
// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private/Admin
const updateProblem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const problem = yield Problem_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!problem) {
            return res.status(404).json({
                success: false,
                error: 'Problem not found',
            });
        }
        res.status(200).json({
            success: true,
            data: problem,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
});
exports.updateProblem = updateProblem;
// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
const deleteProblem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const problem = yield Problem_1.default.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({
                success: false,
                error: 'Problem not found',
            });
        }
        yield problem.deleteOne();
        res.status(200).json({
            success: true,
            data: {},
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
});
exports.deleteProblem = deleteProblem;
