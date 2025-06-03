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
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalPoints: number;
  problemsSolved: number;
}

interface ContestLeaderboardEntry {
  rank: number;
  username: string;
  contestPoints: number;
  problemsSolved: number;
}

interface Contest {
  _id: string;
  title: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const Leaderboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [contestLeaderboard, setContestLeaderboard] = useState<ContestLeaderboardEntry[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [tabValue, selectedContestId, pagination.page]);

  const fetchContests = async () => {
    try {
      const response = await api.get('/api/contests/leaderboard');
      if (response.data.status === 'success') {
        setContests(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedContestId(response.data.data[0]._id);
          setContestLeaderboard(response.data.data[0].leaderboard);
        }
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
      setError('Failed to load contests');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      if (tabValue === 0) {
        const response = await api.get(`/api/leaderboard?page=${pagination.page}&limit=${pagination.limit}`);
        if (response.data.success) {
          setGlobalLeaderboard(response.data.data.leaderboard);
          setPagination(response.data.data.pagination);
        }
      } else {
        const selectedContest = contests.find(c => c._id === selectedContestId);
        if (selectedContest) {
          setContestLeaderboard(selectedContest.leaderboard);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleContestChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newContestId = event.target.value as string;
    setSelectedContestId(newContestId);
    const selectedContest = contests.find(c => c._id === newContestId);
    if (selectedContest) {
      setContestLeaderboard(selectedContest.leaderboard);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        <TableCell>Rank</TableCell>
        <TableCell>Username</TableCell>
        <TableCell align="right">{tabValue === 0 ? 'Total Points' : 'Contest Points'}</TableCell>
        <TableCell align="right">Problems Solved</TableCell>
      </TableRow>
    </TableHead>
  );

  const renderTableBody = () => {
    const data = tabValue === 0 ? globalLeaderboard : contestLeaderboard;

    return (
      <TableBody>
        {data.map((entry, index) => {
          const isCurrentUser = user && entry.username === user.username;
          return (
            <TableRow
              key={index}
              sx={{
                backgroundColor: isCurrentUser
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'inherit',
                '&:nth-of-type(odd)': {
                  backgroundColor: isCurrentUser
                    ? alpha(theme.palette.primary.main, 0.1)
                    : theme.palette.action.hover,
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <TableCell>{entry.rank}</TableCell>
              <TableCell>
                <Typography
                  component="span"
                  fontWeight={isCurrentUser ? 'bold' : 'normal'}
                  color={isCurrentUser ? 'primary' : 'inherit'}
                >
                  {entry.username}
                  {isCurrentUser && ' (You)'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {tabValue === 0 ? entry.totalPoints : (entry as ContestLeaderboardEntry).contestPoints}
              </TableCell>
              <TableCell align="right">{entry.problemsSolved}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Leaderboard
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Global" />
            <Tab label="Contest" />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {tabValue === 1 && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Contest</InputLabel>
            <Select
              value={selectedContestId}
              label="Select Contest"
              onChange={handleContestChange}
            >
              {contests.map((contest) => (
                <MenuItem key={contest._id} value={contest._id}>
                  {contest.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                {renderTableHeader()}
                {renderTableBody()}
              </Table>
            </TableContainer>
            {tabValue === 0 && pagination.totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default Leaderboard;
