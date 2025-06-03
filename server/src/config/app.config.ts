import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({
  path: path.join(__dirname, '../../../.env')
});

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-code-wars',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  geminiApiKey: process.env.GEMINI_API_KEY,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes in milliseconds
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'), // Maximum requests per window
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filename: process.env.LOG_FILE || 'app.log'
  },
  problemGeneration: {
    schedule: process.env.PROBLEM_GENERATION_SCHEDULE || '0 0 * * *', // Daily at midnight
    maxRetries: parseInt(process.env.PROBLEM_GENERATION_MAX_RETRIES || '3', 10)
  }
};

export default config; 