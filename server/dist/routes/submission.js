"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const submission_1 = require("../controllers/submission");
const Submission_1 = __importDefault(require("../models/Submission"));
const router = express_1.default.Router();
// Get user's submissions
router.get('/my', auth_1.protect, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
            return;
        }
        const submissions = await Submission_1.default.find({ user: req.user._id })
            .populate('problem', 'title difficulty')
            .sort('-createdAt');
        res.json(submissions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching submissions' });
    }
});
// Get submissions for a problem
router.get('/problem/:problemId', auth_1.protect, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
            return;
        }
        const submissions = await Submission_1.default.find({
            problem: req.params.problemId,
            user: req.user._id,
        })
            .populate('problem', 'title difficulty')
            .sort('-createdAt');
        res.json(submissions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching submissions' });
    }
});
router.post('/', auth_1.protect, submission_1.submitCode);
router.get('/', auth_1.protect, submission_1.getUserSubmissions);
router.get('/:id', auth_1.protect, submission_1.getSubmission);
exports.default = router;
