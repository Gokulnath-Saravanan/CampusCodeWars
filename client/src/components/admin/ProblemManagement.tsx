import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  testCases: {
    input: string;
    output: string;
  }[];
  solutionTemplate: string;
  timeLimit: number;
  memoryLimit: number;
}

const ProblemManagement: React.FC = () => {
  const { token } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    difficulty: '',
    tags: [] as string[],
    solutionTemplate: '',
    timeLimit: 1,
    memoryLimit: 128,
  });

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/problems', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProblems(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [token]);

  const handleEditClick = (problem: Problem) => {
    setSelectedProblem(problem);
    setEditForm({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      tags: problem.tags,
      solutionTemplate: problem.solutionTemplate,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      if (!selectedProblem) return;
      
      await api.put(
        `/admin/problems/${selectedProblem._id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setEditDialogOpen(false);
      fetchProblems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating problem');
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      await api.delete(`/admin/problems/${problemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProblems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting problem');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Problem Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Time Limit (s)</TableCell>
              <TableCell>Memory Limit (MB)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {problems.map((problem) => (
              <TableRow key={problem._id}>
                <TableCell>{problem.title}</TableCell>
                <TableCell>
                  <Chip
                    label={problem.difficulty}
                    color={
                      problem.difficulty === 'easy'
                        ? 'success'
                        : problem.difficulty === 'medium'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {problem.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>{problem.timeLimit}</TableCell>
                <TableCell>{problem.memoryLimit}</TableCell>
                <TableCell>
                  <IconButton
                    color="info"
                    onClick={() => window.open(`/problems/${problem._id}`, '_blank')}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditClick(problem)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteProblem(problem._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Problem</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={editForm.difficulty}
              label="Difficulty"
              onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Tags (comma-separated)"
            fullWidth
            value={editForm.tags.join(', ')}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                tags: e.target.value.split(',').map((tag) => tag.trim()),
              })
            }
          />
          <TextField
            margin="dense"
            label="Solution Template"
            fullWidth
            multiline
            rows={4}
            value={editForm.solutionTemplate}
            onChange={(e) =>
              setEditForm({ ...editForm, solutionTemplate: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Time Limit (seconds)"
            type="number"
            fullWidth
            value={editForm.timeLimit}
            onChange={(e) =>
              setEditForm({ ...editForm, timeLimit: Number(e.target.value) })
            }
          />
          <TextField
            margin="dense"
            label="Memory Limit (MB)"
            type="number"
            fullWidth
            value={editForm.memoryLimit}
            onChange={(e) =>
              setEditForm({ ...editForm, memoryLimit: Number(e.target.value) })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProblemManagement; 