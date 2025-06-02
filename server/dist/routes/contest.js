"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contest_1 = require("../controllers/contest");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/')
    .get(contest_1.getContests)
    .post(auth_1.protect, (0, auth_1.authorize)('admin'), contest_1.createContest);
router.route('/:id')
    .get(contest_1.getContest)
    .put(auth_1.protect, (0, auth_1.authorize)('admin'), contest_1.updateContest)
    .delete(auth_1.protect, (0, auth_1.authorize)('admin'), contest_1.deleteContest);
router.post('/:id/register', auth_1.protect, contest_1.registerForContest);
router.get('/:id/leaderboard', auth_1.protect, contest_1.getLeaderboard);
router.post('/:id/update-scores', auth_1.protect, (0, auth_1.authorize)('admin'), contest_1.updateScores);
exports.default = router;
