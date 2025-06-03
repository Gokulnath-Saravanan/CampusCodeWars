import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import LaunchIcon from '@mui/icons-material/Launch';
import AddIcon from '@mui/icons-material/Add';

interface Contest {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  participantCount: number;
  problemCount: number;
}

const ContestList: React.FC = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetchContests();
    // Get user role from localStorage or context
    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);
  }, []);

  const fetchContests = async () => {
    try {
      const response = await fetch('/api/contests');
      const data = await response.json();
      if (data.success) {
        setContests(data.data);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredContests = contests.filter((contest) =>
    contest.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Contests</Typography>
        {userRole === 'organizer' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/contests/create')}
          >
            Create Contest
          </Button>
        )}
      </Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search contests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Participants</TableCell>
              <TableCell align="right">Problems</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContests.map((contest) => (
              <TableRow key={contest._id} hover>
                <TableCell>{contest.title}</TableCell>
                <TableCell>{formatDate(contest.startTime)}</TableCell>
                <TableCell>{formatDate(contest.endTime)}</TableCell>
                <TableCell>
                  <Chip
                    label={contest.status}
                    color={getStatusColor(contest.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{contest.participantCount}</TableCell>
                <TableCell align="right">{contest.problemCount}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => navigate(`/contests/${contest._id}`)}
                    size="small"
                  >
                    <LaunchIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ContestList; 