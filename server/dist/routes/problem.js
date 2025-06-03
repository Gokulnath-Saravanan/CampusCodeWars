"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const problem_1 = require("../controllers/problem");
const router = express_1.default.Router();
// Get all problems (public)
router.get('/', auth_1.protect, problem_1.getProblems);
// Get single problem
router.get('/:id', auth_1.protect, problem_1.getProblem);
// Create new problem (admin only)
router.post('/', auth_1.protect, (0, auth_1.authorize)('admin'), problem_1.createProblem);
// Update problem (admin only)
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), problem_1.updateProblem);
// Delete problem (admin only)
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), problem_1.deleteProblem);
exports.default = router;
