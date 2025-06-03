"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const isAdmin_1 = require("../middleware/isAdmin");
const Submission_1 = require("../models/Submission");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// Get all submissions (admin only)
router.get('/', auth_1.auth, isAdmin_1.isAdmin, async (req, res) => {
    try {
        const submissions = await Submission_1.Submission.find()
            .populate('userId', 'username')
            .populate('problemId', 'title')
            .sort({ createdAt: -1 });
        res.json({
            status: 'success',
            data: submissions,
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Error fetching submissions', 500);
    }
});
// Get user's submissions
router.get('/my', auth_1.auth, async (req, res) => {
    try {
        const submissions = await Submission_1.Submission.find({ userId: req.user._id })
            .populate('problemId', 'title')
            .sort({ createdAt: -1 });
        res.json({
            status: 'success',
            data: submissions,
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Error fetching submissions', 500);
    }
});
// Get single submission
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const submission = await Submission_1.Submission.findById(req.params.id)
            .populate('userId', 'username')
            .populate('problemId', 'title');
        if (!submission) {
            throw new errorHandler_1.AppError('Submission not found', 404);
        }
        // Check if user is admin or submission owner
        if (req.user.role !== 'admin' && submission.userId.toString() !== req.user._id.toString()) {
            throw new errorHandler_1.AppError('Not authorized to view this submission', 403);
        }
        res.json({
            status: 'success',
            data: submission,
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Error fetching submission', 500);
    }
});
// Create submission
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const submission = await Submission_1.Submission.create({
            ...req.body,
            userId: req.user._id,
        });
        res.status(201).json({
            status: 'success',
            data: submission,
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Error creating submission', 500);
    }
});
exports.default = router;
