import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - redirect to home
          window.location.href = '/';
          break;
        default:
          break;
      }

      // Return the error message from the server
      return Promise.reject(
        new Error(
          error.response.data.message || 'An error occurred. Please try again.'
        )
      );
    }

    // Network error or other issues
    return Promise.reject(
      new Error('Network error. Please check your internet connection.')
    );
  }
);

// Auth API
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const register = (userData: {
  username: string;
  email: string;
  password: string;
  role: string;
}) => api.post('/auth/register', userData);

export const getCurrentUser = () => api.get('/auth/me');

// Problems API
export const getProblems = () => api.get('/problems');
export const getProblem = (id: string) => api.get(`/problems/${id}`);
export const submitSolution = (
  problemId: string,
  code: string,
  language: string
) => api.post('/submissions', { problemId, code, language });

// Contests API
export const getContests = () => api.get('/contests');
export const getContest = (id: string) => api.get(`/contests/${id}`);
export const createContest = (contestData: {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  problems: string[];
}) => api.post('/contests', contestData);
export const registerForContest = (contestId: string) =>
  api.post(`/contests/${contestId}/register`);

// Leaderboard API
export const getGlobalLeaderboard = () => api.get('/leaderboard');
export const getContestLeaderboard = (contestId: string) =>
  api.get(`/contests/${contestId}/leaderboard`);

export default api; 