import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface Contest {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  problems: Array<{
    _id: string;
    title: string;
    points: number;
    difficulty: string;
    solvedCount: number;
  }>;
  participants: Array<{
    _id: string;
    username: string;
    totalPoints: number;
    rank: number;
    problemsSolved: number;
  }>;
  isRegistered?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contest-tabpanel-${index}`}
      aria-labelledby={`contest-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ContestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    fetchContest();
  }, [id]);

  useEffect(() => {
    if (contest && contest.status === 'ongoing') {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(contest.endTime).getTime();
        const distance = end - now;

        if (distance < 0) {
          clearInterval(timer);
          setTimeLeft('Contest Ended');
          return;
        }

        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [contest]);

  const fetchContest = async () => {
    try {
      const response = await fetch(`/api/contests/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setContest(data.data);
      } else {
        setErrorMessage(data.message || 'Failed to load contest details');
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
      setErrorMessage('Failed to load contest details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`/api/contests/${id}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setContest((prev) => prev ? { ...prev, isRegistered: true } : null);
      }
    } catch (error) {
      console.error('Error registering for contest:', error);
      setErrorMessage('Failed to register for contest');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!contest) {
    return (
      <Container>
        <Alert severity="error">Contest not found</Alert>
      </Container>
    );
  }

  type StatusColor = 'info' | 'success' | 'default';
  
  const getStatusColor = (status: string): StatusColor => {
    switch (status) {
      case 'upcoming':
        return 'info';
      case 'ongoing':
        return 'success';
      case 'completed':
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              {contest.title}
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <Chip
                label={contest.status.toUpperCase()}
                color={getStatusColor(contest.status) as any}
              />
              {contest.status === 'ongoing' && (
                <Typography variant="subtitle1" color="text.secondary">
                  <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Time Left: {timeLeft}
                </Typography>
              )}
            </Box>
          </Box>
          {contest.status === 'upcoming' && !contest.isRegistered && (
            <Button variant="contained" onClick={handleRegister}>
              Register
            </Button>
          )}
        </Box>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Problems" />
          <Tab label="Leaderboard" />
          <Tab label="About" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell align="right">Points</TableCell>
                <TableCell align="right">Solved By</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contest.problems.map((problem) => (
                <TableRow key={problem._id} hover>
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
                  <TableCell align="right">{problem.solvedCount}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() =>
                        navigate(`/contests/${id}/problems/${problem._id}`)
                      }
                      size="small"
                      disabled={contest.status === 'upcoming'}
                    >
                      <LaunchIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Username</TableCell>
                <TableCell align="right">Problems Solved</TableCell>
                <TableCell align="right">Total Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contest.participants.map((participant) => (
                <TableRow key={participant._id} hover>
                  <TableCell>
                    {participant.rank <= 3 && (
                      <EmojiEventsIcon
                        sx={{
                          color:
                            participant.rank === 1
                              ? '#FFD700'
                              : participant.rank === 2
                              ? '#C0C0C0'
                              : '#CD7F32',
                          mr: 1,
                          verticalAlign: 'middle',
                        }}
                      />
                    )}
                    {participant.rank}
                  </TableCell>
                  <TableCell>{participant.username}</TableCell>
                  <TableCell align="right">{participant.problemsSolved}</TableCell>
                  <TableCell align="right">{participant.totalPoints}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {contest.description}
          </Typography>
          <Box display="flex" gap={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Start Time
              </Typography>
              <Typography>
                {new Date(contest.startTime).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                End Time
              </Typography>
              <Typography>
                {new Date(contest.endTime).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Participants
              </Typography>
              <Typography display="flex" alignItems="center" gap={1}>
                <PeopleIcon fontSize="small" />
                {contest.participants.length}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default ContestDetail; 