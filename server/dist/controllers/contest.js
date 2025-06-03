"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContestScores = exports.updateContestScore = exports.updateScores = exports.getLeaderboard = exports.registerForContest = exports.deleteContest = exports.updateContest = exports.getContest = exports.getContests = exports.createContest = void 0;
const Contest_1 = __importDefault(require("../models/Contest"));
const logger_1 = __importDefault(require("../utils/logger"));
// @desc    Create new contest
// @route   POST /api/contests
// @access  Private/Admin
const createContest = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
            return;
        }
        const contest = await Contest_1.default.create({
            ...req.body,
            createdBy: req.user._id,
        });
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
};
exports.createContest = createContest;
// @desc    Get all contests
// @route   GET /api/contests
// @access  Private
const getContests = async (_req, res) => {
    try {
        const contests = await Contest_1.default.find()
            .populate('problems', 'title difficulty points')
            .select('-participants');
        res.json({
            success: true,
            data: contests,
        });
    }
    catch (error) {
        console.error('Get contests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contests',
        });
    }
};
exports.getContests = getContests;
// @desc    Get single contest
// @route   GET /api/contests/:id
// @access  Private
const getContest = async (req, res) => {
    try {
        const contest = await Contest_1.default.findById(req.params.id);
        if (!contest) {
            return res.status(404).json({
                success: false,
                error: 'Contest not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: contest,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};
exports.getContest = getContest;
// @desc    Update contest
// @route   PUT /api/contests/:id
// @access  Private/Admin
const updateContest = async (req, res) => {
    try {
        const contest = await Contest_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!contest) {
            return res.status(404).json({
                success: false,
                error: 'Contest not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: contest,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};
exports.updateContest = updateContest;
// @desc    Delete contest
// @route   DELETE /api/contests/:id
// @access  Private/Admin
const deleteContest = async (req, res) => {
    try {
        const contest = await Contest_1.default.findById(req.params.id);
        if (!contest) {
            return res.status(404).json({
                success: false,
                error: 'Contest not found',
            });
        }
        await contest.deleteOne();
        return res.status(200).json({
            success: true,
            data: { id: req.params.id },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};
exports.deleteContest = deleteContest;
// @desc    Register for contest
// @route   POST /api/contests/:id/register
// @access  Private
const registerForContest = async (req, res) => {
    try {
        const contest = await Contest_1.default.findById(req.params.id);
        if (!contest) {
            return res.status(404).json({
                success: false,
                error: 'Contest not found',
            });
        }
        if (!contest.registrationOpen) {
            return res.status(400).json({
                success: false,
                error: 'Contest registration is closed',
            });
        }
        if (contest.participants.length >= contest.maxParticipants) {
            return res.status(400).json({
                success: false,
                error: 'Contest is full',
            });
        }
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized',
            });
        }
        if (contest.participants.some(p => p.user.toString() === userId.toString())) {
            return res.status(400).json({
                success: false,
                error: 'Already registered for this contest',
            });
        }
        const newParticipant = {
            user: userId,
            score: 0,
            submissions: [],
            joinedAt: new Date(),
            rank: undefined,
        };
        contest.participants.push(newParticipant);
        await contest.save();
        return res.status(200).json({
            success: true,
            data: contest,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};
exports.registerForContest = registerForContest;
// @desc    Get contest leaderboard
// @route   GET /api/contests/:id/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
    try {
        const contest = await Contest_1.default.findById(req.params.id).populate('participants.user', 'username');
        if (!contest) {
            return res.status(404).json({
                success: false,
                error: 'Contest not found',
            });
        }
        // Sort participants by score in descending order
        const sortedParticipants = [...contest.participants].sort((a, b) => b.score - a.score);
        // Add rank to each participant
        const rankedParticipants = sortedParticipants.map((participant, index) => ({
            ...participant,
            rank: index + 1,
        }));
        return res.status(200).json({
            success: true,
            data: rankedParticipants,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};
exports.getLeaderboard = getLeaderboard;
// @desc    Update participant scores
// @route   PUT /api/contests/:id/scores
// @access  Private/Admin
const updateScores = async (req, res) => {
    try {
        const contest = await Contest_1.default.findById(req.params.id);
        if (!contest) {
            return res.status(404).json({
                success: false,
                error: 'Contest not found',
            });
        }
        const { submissions } = req.body;
        for (const submission of submissions) {
            const participant = contest.participants.find((p) => p.user.toString() === submission.userId);
            if (participant) {
                const score = calculateSubmissionScore(submission);
                participant.score = score;
            }
        }
        await contest.save();
        return res.status(200).json({
            success: true,
            data: contest,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};
exports.updateScores = updateScores;
// Helper function to calculate submission score
const calculateSubmissionScore = (submission) => {
    const defaultCriteria = {
        accuracy: 0.4,
        timeComplexity: 0.3,
        spaceComplexity: 0.2,
        codeQuality: 0.1,
    };
    const score = {
        accuracy: (submission.testResults.filter((test) => test.passed).length / submission.testResults.length) * defaultCriteria.accuracy,
        timeComplexity: defaultCriteria.timeComplexity * (1 - submission.runtime / 1000),
        spaceComplexity: defaultCriteria.spaceComplexity * (1 - submission.memory / 1000),
        codeQuality: defaultCriteria.codeQuality,
    };
    return Object.values(score).reduce((a, b) => a + b, 0);
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
const updateContestScore = async (submission, contest) => {
    try {
        const submissionData = {
            testResults: submission.testResults,
            runtime: submission.runtime,
            memory: submission.memory,
            userId: submission.user.toString(),
        };
        const score = calculateSubmissionScore(submissionData);
        const participantIndex = contest.participants.findIndex(p => p.user.toString() === submission.user.toString());
        if (participantIndex !== -1) {
            contest.participants[participantIndex].score = score;
            await contest.save();
        }
    }
    catch (error) {
        logger_1.default.error('Error updating contest score:', error instanceof Error ? error.message : 'Unknown error');
    }
};
exports.updateContestScore = updateContestScore;
const updateContestScores = async (contestId) => {
    const contest = await Contest_1.default.findById(contestId);
    if (!contest)
        return;
    for (const participant of contest.participants) {
        const submissions = participant.submissions.map(() => ({
            testResults: [],
            runtime: 0,
            memory: 0,
            userId: participant.user.toString()
        }));
        let totalScore = 0;
        for (const submission of submissions) {
            totalScore += calculateSubmissionScore(submission);
        }
        participant.score = totalScore;
    }
    await contest.save();
};
exports.updateContestScores = updateContestScores;
