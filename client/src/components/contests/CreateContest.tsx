import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
  points: number;
}

const CreateContest: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(Date.now() + 7200000), // Default duration: 2 hours
  });
  const [availableProblems, setAvailableProblems] = useState<Problem[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableProblems();
  }, []);

  const fetchAvailableProblems = async () => {
    try {
      const response = await fetch('/api/problems', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAvailableProblems(data.data);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      setError('Failed to load available problems');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStartTimeChange = (date: Date | null) => {
    if (date) {
      setFormData({
        ...formData,
        startTime: date,
      });
    }
  };

  const handleEndTimeChange = (date: Date | null) => {
    if (date) {
      setFormData({
        ...formData,
        endTime: date,
      });
    }
  };

  const handleAddProblem = (problemId: string) => {
    const problem = availableProblems.find((p) => p._id === problemId);
    if (problem && !selectedProblems.some((p) => p._id === problemId)) {
      setSelectedProblems([...selectedProblems, problem]);
    }
  };

  const handleRemoveProblem = (problemId: string) => {
    setSelectedProblems(selectedProblems.filter((p) => p._id !== problemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (selectedProblems.length === 0) {
      setError('Please add at least one problem to the contest');
      setLoading(false);
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/contests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          problems: selectedProblems.map((p) => p._id),
        }),
      });

      const data = await response.json();
      if (data.success) {
        navigate('/contests');
      } else {
        setError(data.message || 'Failed to create contest');
      }
    } catch (error) {
      console.error('Error creating contest:', error);
      setError('Failed to create contest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create Contest
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Contest Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={handleStartTimeChange}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={handleEndTimeChange}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Add Problem</InputLabel>
                <Select
                  value=""
                  label="Add Problem"
                  onChange={(e: SelectChangeEvent) =>
                    handleAddProblem(e.target.value)
                  }
                >
                  {availableProblems
                    .filter(
                      (problem) =>
                        !selectedProblems.some((p) => p._id === problem._id)
                    )
                    .map((problem) => (
                      <MenuItem key={problem._id} value={problem._id}>
                        {problem.title} ({problem.difficulty})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Selected Problems
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Difficulty</TableCell>
                      <TableCell align="right">Points</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedProblems.map((problem) => (
                      <TableRow key={problem._id}>
                        <TableCell>{problem.title}</TableCell>
                        <TableCell>
                          <Chip
                            label={problem.difficulty}
                            color={
                              problem.difficulty.toLowerCase() === 'easy'
                                ? 'success'
                                : problem.difficulty.toLowerCase() === 'medium'
                                ? 'warning'
                                : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{problem.points}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={() => handleRemoveProblem(problem._id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {selectedProblems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No problems selected
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/contests')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Contest'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateContest; 