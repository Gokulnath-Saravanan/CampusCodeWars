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
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Contest {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  problems: string[];
  participants: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

const ContestManagement: React.FC = () => {
  const { token } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
  });

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/contests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContests(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching contests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, [token]);

  const handleEditClick = (contest: Contest) => {
    setSelectedContest(contest);
    setEditForm({
      title: contest.title,
      description: contest.description,
      startTime: new Date(contest.startTime),
      endTime: new Date(contest.endTime),
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      if (!selectedContest) return;
      
      await api.put(
        `/admin/contests/${selectedContest._id}`,
        {
          ...editForm,
          startTime: editForm.startTime.toISOString(),
          endTime: editForm.endTime.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setEditDialogOpen(false);
      fetchContests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating contest');
    }
  };

  const handleDeleteContest = async (contestId: string) => {
    if (!window.confirm('Are you sure you want to delete this contest?')) return;
    
    try {
      await api.delete(`/admin/contests/${contestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchContests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting contest');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'info';
      case 'ongoing':
        return 'success';
      case 'completed':
        return 'default';
      default:
        return 'default';
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Contest Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setSelectedContest(null);
            setEditForm({
              title: '',
              description: '',
              startTime: new Date(),
              endTime: new Date(),
            });
            setEditDialogOpen(true);
          }}
        >
          Create Contest
        </Button>
      </Box>

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
              <TableCell>Status</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Participants</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contests.map((contest) => (
              <TableRow key={contest._id}>
                <TableCell>{contest.title}</TableCell>
                <TableCell>
                  <Chip
                    label={contest.status}
                    color={getStatusColor(contest.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(contest.startTime).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(contest.endTime).toLocaleString()}
                </TableCell>
                <TableCell>{contest.participants.length}</TableCell>
                <TableCell>
                  <IconButton
                    color="info"
                    onClick={() => window.open(`/contests/${contest._id}`, '_blank')}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditClick(contest)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteContest(contest._id)}
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
        <DialogTitle>
          {selectedContest ? 'Edit Contest' : 'Create Contest'}
        </DialogTitle>
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
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Start Time"
              value={editForm.startTime}
              onChange={(newValue) =>
                setEditForm({ ...editForm, startTime: newValue || new Date() })
              }
              sx={{ mt: 2, width: '100%' }}
            />
            <DateTimePicker
              label="End Time"
              value={editForm.endTime}
              onChange={(newValue) =>
                setEditForm({ ...editForm, endTime: newValue || new Date() })
              }
              sx={{ mt: 2, width: '100%' }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            {selectedContest ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContestManagement; 