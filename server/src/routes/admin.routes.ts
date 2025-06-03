import { Router } from 'express';
import { auth } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import {
  getUsers,
  updateUser,
  deleteUser,
  getStats,
  generateProblemHandler as generateProblem,
  updateProblem,
  deleteProblem,
  createContest,
  updateContest,
  deleteContest,
} from '../controllers/admin';

const router = Router();

// User management
router.get('/users', auth, isAdmin, getUsers);
router.put('/users/:id', auth, isAdmin, updateUser);
router.delete('/users/:id', auth, isAdmin, deleteUser);

// Statistics
router.get('/stats', auth, isAdmin, getStats);

// Problem management
router.post('/problems/generate', auth, isAdmin, generateProblem);
router.put('/problems/:id', auth, isAdmin, updateProblem);
router.delete('/problems/:id', auth, isAdmin, deleteProblem);

// Contest management
router.post('/contests', auth, isAdmin, createContest);
router.put('/contests/:id', auth, isAdmin, updateContest);
router.delete('/contests/:id', auth, isAdmin, deleteContest);

export default router; 