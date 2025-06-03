import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Grid,
} from '@mui/material';
import CodeEditor from './CodeEditor';

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
}

interface LeaderboardEntry {
  username: string;
  score: number;
  rank: number;
}

const Dashboard: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [dailyChallenge, setDailyChallenge] = useState<Problem | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Fetch daily challenge
    fetchDailyChallenge();
    // Fetch leaderboard
    fetchLeaderboard();
  }, []);

  const fetchDailyChallenge = async () => {
    try {
      const response = await fetch('/api/problems/daily');
      const data = await response.json();
      if (data.success) {
        setDailyChallenge(data.data);
      }
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/contests/leaderboard');
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleSubmit = async () => {
    if (!dailyChallenge) return;

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          problemId: dailyChallenge._id,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Handle successful submission
        alert('Code submitted successfully!');
        setCode('');
      }
    } catch (error) {
      console.error('Error submitting code:', error);
    }
  };

  const handleLanguageChange = (e: SelectChangeEvent) => setLanguage(e.target.value);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Daily Challenge */}
        <Grid item xs={12} md={8} component="div">
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Daily Challenge
            </Typography>
            {dailyChallenge && (
              <>
                <Typography variant="h6">{dailyChallenge.title}</Typography>
                <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
                  {dailyChallenge.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <FormControl sx={{ minWidth: 120, mr: 2 }}>
                    <InputLabel>Language</InputLabel>
                    <Select value={language} label="Language" onChange={handleLanguageChange}>
                      <MenuItem value="javascript">JavaScript</MenuItem>
                      <MenuItem value="python">Python</MenuItem>
                      <MenuItem value="java">Java</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <CodeEditor
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  language={language}
                />
                <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
                  Submit Solution
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        {/* Leaderboard */}
        <Grid item xs={12} md={4} component="div">
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Leaderboard
            </Typography>
            {leaderboard.map((entry, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1,
                  borderBottom: '1px solid #eee',
                }}
              >
                <Typography>
                  {entry.rank}. {entry.username}
                </Typography>
                <Typography color="primary">{entry.score}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
