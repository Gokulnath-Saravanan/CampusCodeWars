import express from 'express';
import {
  createContest,
  getContests,
  getContest,
  updateContest,
  deleteContest,
  registerForContest,
  getLeaderboard,
  updateScores,
} from '../controllers/contest';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(getContests)
  .post(protect, authorize('admin'), createContest);

router.route('/:id')
  .get(getContest)
  .put(protect, authorize('admin'), updateContest)
  .delete(protect, authorize('admin'), deleteContest);

router.post('/:id/register', protect, registerForContest);
router.get('/:id/leaderboard', protect, getLeaderboard);
router.post('/:id/update-scores', protect, authorize('admin'), updateScores);

export default router;
