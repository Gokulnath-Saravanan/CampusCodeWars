import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect to login if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth API
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
  }
  return response;
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  role: string;
}) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
  }
  return response;
};

export const getCurrentUser = () => api.get('/auth/me');

// Problems API
export const getProblems = () => api.get('/problems');
export const getProblem = (id: string) => api.get(`/problems/${id}`);
export const submitSolution = (problemId: string, code: string, language: string) =>
  api.post('/submissions', { problemId, code, language });

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
