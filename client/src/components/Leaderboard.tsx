import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import api from '../services/api';

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalPoints: number;
  problemsSolved: number;
  winRate: number;
}

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/leaderboard');
        setEntries(response.data.data);
      } catch (err) {
        setError('Failed to load leaderboard data');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return 'transparent';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Global Leaderboard
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Username</TableCell>
                <TableCell align="right">Problems Solved</TableCell>
                <TableCell align="right">Total Points</TableCell>
                <TableCell align="right">Win Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.username} hover>
                  <TableCell>
                    {entry.rank <= 3 && (
                      <EmojiEventsIcon
                        sx={{
                          color: getMedalColor(entry.rank),
                          fontSize: entry.rank === 1
                            ? '24px'
                            : entry.rank === 2
                              ? '20px'
                              : '16px',
                          verticalAlign: 'middle',
                          mr: 1,
                        }}
                      />
                    )}
                    {entry.rank}
                  </TableCell>
                  <TableCell>{entry.username}</TableCell>
                  <TableCell align="right">{entry.problemsSolved}</TableCell>
                  <TableCell align="right">{entry.totalPoints}</TableCell>
                  <TableCell align="right">
                    {(entry.winRate * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Leaderboard; 