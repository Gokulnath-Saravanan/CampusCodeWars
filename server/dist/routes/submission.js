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
const express_1 = __importDefault(require("express"));
const submission_1 = require("../controllers/submission");
const auth_1 = require("../middleware/auth");
const Submission_1 = __importDefault(require("../models/Submission"));
const router = express_1.default.Router();
// Get user's submissions
router.get('/my', auth_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const submissions = yield Submission_1.default.find({ user: req.user._id })
            .populate('problem', 'title difficulty')
            .sort('-createdAt');
        res.json(submissions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching submissions' });
    }
}));
// Get submissions for a problem
router.get('/problem/:problemId', auth_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const submissions = yield Submission_1.default.find({
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
}));
router.get('/', auth_1.protect, submission_1.getUserSubmissions);
router.post('/', auth_1.protect, submission_1.submitCode);
router.get('/:id', auth_1.protect, submission_1.getSubmission);
exports.default = router;
