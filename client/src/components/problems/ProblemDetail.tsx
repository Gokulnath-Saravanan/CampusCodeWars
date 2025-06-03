import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import CodeEditor from '../CodeEditor';
import ReactMarkdown from 'react-markdown';

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  timeLimit: number;
  memoryLimit: number;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      const response = await fetch(`/api/problems/${id}`);
      const data = await response.json();
      if (data.success) {
        setProblem(data.data);
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      setError('Failed to load problem details');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setTestResults([]);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          problemId: id,
          code,
          language,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResults(data.testResults);
      } else {
        setError(data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setError('Failed to submit code');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!problem) {
    return (
      <Container>
        <Alert severity="error">Problem not found</Alert>
      </Container>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="h4">{problem.title}</Typography>
              <Chip
                label={problem.difficulty}
                color={getDifficultyColor(problem.difficulty) as any}
              />
            </Box>
            <Box mb={2}>
              {problem.tags.map((tag) => (
                <Chip key={tag} label={tag} sx={{ mr: 1 }} />
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={3}>
              <ReactMarkdown>{problem.description}</ReactMarkdown>
            </Box>
            <Typography variant="h6" gutterBottom>
              Examples:
            </Typography>
            {problem.examples.map((example, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2">Input:</Typography>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'monospace', mb: 1 }}
                >
                  {example.input}
                </Typography>
                <Typography variant="subtitle2">Output:</Typography>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'monospace', mb: 1 }}
                >
                  {example.output}
                </Typography>
                {example.explanation && (
                  <>
                    <Typography variant="subtitle2">Explanation:</Typography>
                    <Typography variant="body2">{example.explanation}</Typography>
                  </>
                )}
              </Paper>
            ))}
            <Typography variant="h6" gutterBottom>
              Constraints:
            </Typography>
            <ul>
              {problem.constraints.map((constraint, index) => (
                <li key={index}>
                  <Typography variant="body2">{constraint}</Typography>
                </li>
              ))}
            </ul>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  label="Language"
                  onChange={handleLanguageChange}
                >
                  <MenuItem value="javascript">JavaScript</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="java">Java</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </Button>
            </Box>
            <CodeEditor
              value={code}
              onChange={(value) => setCode(value || '')}
              language={language}
              height="500px"
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {testResults.length > 0 && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>
                  Test Results:
                </Typography>
                {testResults.map((test, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="subtitle1">
                        Test Case {index + 1}
                      </Typography>
                      <Chip
                        label={test.passed ? 'Passed' : 'Failed'}
                        color={test.passed ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    {!test.passed && (
                      <>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                          Input:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: 'monospace' }}
                        >
                          {test.input}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                          Expected Output:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: 'monospace' }}
                        >
                          {test.expectedOutput}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                          Your Output:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: 'monospace' }}
                        >
                          {test.actualOutput}
                        </Typography>
                      </>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProblemDetail; 