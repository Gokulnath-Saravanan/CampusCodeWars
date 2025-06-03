import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProblemList from './components/problems/ProblemList';
import ProblemDetail from './components/problems/ProblemDetail';
import ProblemCreate from './components/problems/ProblemCreate';
import ContestList from './components/contests/ContestList';
import ContestDetail from './components/contests/ContestDetail';
import ContestCreate from './components/contests/ContestCreate';
import Leaderboard from './components/Leaderboard';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navigation />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/problems/create" element={<ProblemCreate />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/contests" element={<ContestList />} />
            <Route path="/contests/create" element={<ContestCreate />} />
            <Route path="/contests/:id" element={<ContestDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
