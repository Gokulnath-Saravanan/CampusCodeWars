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
const auth_1 = require("../middleware/auth");
const Problem_1 = __importDefault(require("../models/Problem"));
const problem_1 = require("../controllers/problem");
const router = express_1.default.Router();
// Get all problems (public)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const problems = yield Problem_1.default.find().select('-testCases').populate('createdBy', 'username');
        res.json(problems);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching problems' });
    }
}));
// Get single problem
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const problem = yield Problem_1.default.findById(req.params.id)
            .select('-testCases')
            .populate('createdBy', 'username');
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.json(problem);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching problem' });
    }
}));
// Create new problem (admin only)
router.post('/', auth_1.protect, (0, auth_1.authorize)('admin'), problem_1.createProblem);
// Update problem (admin only)
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const problem = yield Problem_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.json(problem);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating problem' });
    }
}));
// Delete problem (admin only)
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const problem = yield Problem_1.default.findByIdAndDelete(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.json({ message: 'Problem deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting problem' });
    }
}));
exports.default = router;
