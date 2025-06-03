import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import AddIcon from '@mui/icons-material/Add';
import api from '../../services/api';

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

const ProblemCreate: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '', expectedOutput: '', isHidden: false },
  ]);
  const [sampleCode, setSampleCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/problems', {
        title,
        description,
        difficulty,
        testCases,
        sampleCode,
      });
      navigate('/problems');
    } catch (error) {
      console.error('Error creating problem:', error);
    }
  };

  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      { input: '', expectedOutput: '', isHidden: false },
    ]);
  };

  const handleTestCaseChange = (
    index: number,
    field: keyof TestCase,
    value: string | boolean
  ) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[index] = { ...updatedTestCases[index], [field]: value };
    setTestCases(updatedTestCases);
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Problem
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Problem Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Problem Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            required
            multiline
            rows={4}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="difficulty-label">Difficulty</InputLabel>
            <Select
              labelId="difficulty-label"
              value={difficulty}
              label="Difficulty"
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Cases
              <IconButton
                color="primary"
                onClick={handleAddTestCase}
                size="small"
                sx={{ ml: 1 }}
              >
                <AddIcon />
              </IconButton>
            </Typography>
            {testCases.map((testCase, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Input"
                    value={testCase.input}
                    onChange={(e) =>
                      handleTestCaseChange(index, 'input', e.target.value)
                    }
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Expected Output"
                    value={testCase.expectedOutput}
                    onChange={(e) =>
                      handleTestCaseChange(
                        index,
                        'expectedOutput',
                        e.target.value
                      )
                    }
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel id={`hidden-label-${index}`}>
                      Visibility
                    </InputLabel>
                    <Select
                      labelId={`hidden-label-${index}`}
                      value={testCase.isHidden ? 'hidden' : 'visible'}
                      label="Visibility"
                      onChange={(e) =>
                        handleTestCaseChange(
                          index,
                          'isHidden',
                          e.target.value === 'hidden'
                        )
                      }
                    >
                      <MenuItem value="visible">Visible</MenuItem>
                      <MenuItem value="hidden">Hidden</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            ))}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sample Code
            </Typography>
            <Editor
              height="300px"
              defaultLanguage="javascript"
              value={sampleCode}
              onChange={(value) => setSampleCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
              }}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            Create Problem
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProblemCreate;
