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
exports.updateContestScore = exports.updateScores = exports.getLeaderboard = exports.registerForContest = exports.deleteContest = exports.updateContest = exports.getContest = exports.getContests = exports.createContest = void 0;
const Contest_1 = __importDefault(require("../models/Contest"));
const Submission_1 = __importDefault(require("../models/Submission"));
const logger_1 = __importDefault(require("../utils/logger"));
// @desc    Create new contest
// @route   POST /api/contests
// @access  Private/Admin
const createContest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
            return;
        }
        const contest = yield Contest_1.default.create(Object.assign(Object.assign({}, req.body), { createdBy: req.user._id }));
        res.status(201).json({
            success: true,
            data: contest,
        });
    }
    catch (error) {
        logger_1.default.error('Error creating contest:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({
            success: false,
            error: 'Error creating contest',
        });
    }
});
exports.createContest = createContest;
// @desc    Get all contests
// @route   GET /api/contests
// @access  Public
const getContests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, visibility } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        if (visibility) {
            query.visibility = visibility;
        }
        const contests = yield Contest_1.default.find(query)
            .populate('createdBy', 'username')
            .select('-problems -participants')
            .sort('-startTime');
        res.status(200).json({
            success: true,
            count: contests.length,
            data: contests,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
});
exports.getContests = getContests;
// @desc    Get single contest
// @route   GET /api/contests/:id
// @access  Public
const getContest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contest = yield Contest_1.default.findById(req.params.id)
            .populate('createdBy', 'username')
            .populate('problems', 'title difficulty category')
            .populate('participants.user', 'username');
        if (!contest) {
            return res.status(404).json({
                success: false,
                error: 'Contest not found',
            });
        }
        res.status(200).json({
            success: true,
            data: contest,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
});
exports.getContest = getContest;
// @desc    Update contest
// @route   PUT /api/contests/:id
// @access  Private/Admin
const updateContest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contest = yield Contest_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!contest) {
            return res.status(404).json({
                success: false,
                error: 'Contest not found',
            });
        }
        res.status(200).json({
            success: true,
            data: contest,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
});
exports.updateContest = updateContest;
// @desc    Delete contest
// @route   DELETE /api/contests/:id
// @access  Private/Admin
const deleteContest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contest = yield Contest_1.default.findById(req.params.id);
        if (!contest) {
            return res.status(404).json({
                success: false,
                error: 'Contest not found',
            });
        }
        yield contest.deleteOne();
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
exports.deleteContest = deleteContest;
// @desc    Register for contest
// @route   POST /api/contests/:id/register
// @access  Private
const registerForContest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
            return;
        }
        const contest = yield Contest_1.default.findById(req.params.id);
        if (!contest) {
            res.status(404).json({
                success: false,
                error: 'Contest not found'
            });
            return;
        }
        if (!contest.isRegistrationOpen) {
            res.status(400).json({
                success: false,
                error: 'Contest registration is closed'
            });
            return;
        }
        const userId = req.user._id;
        // Check if user is already registered
        if (contest.participants.some(p => p.user.toString() === userId.toString())) {
            res.status(400).json({
                success: false,
                error: 'Already registered for this contest'
            });
            return;
        }
        contest.participants.push({
            user: userId,
            score: 0,
            joinedAt: new Date()
        });
        yield contest.save();
        res.status(200).json({
            success: true,
            data: contest
        });
    }
    catch (error) {
        logger_1.default.error('Error registering for contest:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({
            success: false,
            error: 'Error registering for contest'
        });
    }
});
exports.registerForContest = registerForContest;
// @desc    Get contest leaderboard
// @route   GET /api/contests/:id/leaderboard
// @access  Public
const getLeaderboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contest = yield Contest_1.default.findById(req.params.id).populate('participants.user', 'username');
        if (!contest) {
            return res.status(404).json({
                success: false,
                error: 'Contest not found',
            });
        }
        // Sort participants by score and update ranks
        const sortedParticipants = [...contest.participants].sort((a, b) => b.score - a.score);
        sortedParticipants.forEach((participant, index) => {
            participant.rank = index + 1;
        });
        yield contest.save();
        res.status(200).json({
            success: true,
            data: sortedParticipants,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
});
exports.getLeaderboard = getLeaderboard;
// @desc    Update participant scores
// @route   POST /api/contests/:id/update-scores
// @access  Private/Admin
const updateScores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contest = yield Contest_1.default.findById(req.params.id);
        if (!contest) {
            return res.status(404).json({
                success: false,
                error: 'Contest not found',
            });
        }
        // Get all submissions for this contest's problems during the contest period
        const submissions = yield Submission_1.default.find({
            problem: { $in: contest.problems },
            createdAt: { $gte: contest.startTime, $lte: contest.endTime },
        });
        // Calculate scores for each participant
        for (const participant of contest.participants) {
            const userSubmissions = submissions.filter((s) => s.user.toString() === participant.user.toString());
            let totalScore = 0;
            for (const submission of userSubmissions) {
                // Apply scoring criteria
                const score = calculateSubmissionScore(submission, contest.scoringCriteria);
                totalScore += score;
            }
            participant.score = totalScore;
        }
        yield contest.save();
        res.status(200).json({
            success: true,
            data: contest,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
});
exports.updateScores = updateScores;
// Helper function to calculate submission score
const calculateSubmissionScore = (submission, criteria) => {
    const score = {
        accuracy: submission.testResults.filter(test => test.passed).length / submission.testResults.length * criteria.accuracy,
        timeComplexity: criteria.timeComplexity * (1 - submission.runtime / 1000),
        spaceComplexity: criteria.spaceComplexity * (1 - submission.memory / (1024 * 1024)),
        codeQuality: criteria.codeQuality
    };
    return Object.values(score).reduce((acc, val) => acc + val, 0);
};
// Helper function to get difficulty score
const getDifficultyScore = (difficulty) => {
    switch (difficulty) {
        case 'easy':
            return 0.3;
        case 'medium':
            return 0.6;
        case 'hard':
            return 1.0;
        default:
            return 0;
    }
};
const updateContestScore = (submission, contest) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const score = calculateSubmissionScore(submission, contest.scoringCriteria);
        const participantIndex = contest.participants.findIndex(p => p.user.toString() === submission.user.toString());
        if (participantIndex !== -1) {
            contest.participants[participantIndex].score = score;
            yield contest.save();
        }
    }
    catch (error) {
        logger_1.default.error('Error updating contest score:', error instanceof Error ? error.message : 'Unknown error');
    }
});
exports.updateContestScore = updateContestScore;
