import express from 'express';
import {
  generateProblem,
  listProblems,
  updateProblemStatus,
  deleteProblem,
  generateCustomProblem,
} from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// Apply admin authentication middleware to all routes
router.use(authenticateAdmin);

// Problem generation routes
router.post('/problems/generate', generateProblem);
router.post('/problems/generate-custom', generateCustomProblem);

// Problem management routes
router.get('/problems', listProblems);
router.patch('/problems/:id/status', updateProblemStatus);
router.delete('/problems/:id', deleteProblem);

export default router; 