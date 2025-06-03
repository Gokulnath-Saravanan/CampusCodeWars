import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Alert,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const ProblemGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [problemType, setProblemType] = useState('algorithmic');
  const { token } = useAuth();

  const handleGenerate = async (isCustom: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const endpoint = isCustom ? '/admin/problems/generate-custom' : '/admin/problems/generate';
      const response = await api.post(endpoint, 
        isCustom ? { type: problemType } : {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Problem generated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Problem Generator
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Problem Type</InputLabel>
            <Select
              value={problemType}
              label="Problem Type"
              onChange={(e) => setProblemType(e.target.value)}
            >
              <MenuItem value="algorithmic">Algorithmic</MenuItem>
              <MenuItem value="dataStructure">Data Structure</MenuItem>
              <MenuItem value="optimization">Optimization</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => handleGenerate(false)}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Random Problem'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleGenerate(true)}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Custom Problem'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProblemGenerator; 