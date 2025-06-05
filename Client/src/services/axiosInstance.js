import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',  // Updated port to 3000
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 10000  // Increased timeout for better reliability
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with improved error logging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    };
    console.error('Response error:', errorDetails);
    return Promise.reject(error);
  }
);

export default axiosInstance;
