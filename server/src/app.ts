import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connect } from './config/database';
import config from './config/app.config';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import { scheduleProblemGeneration } from './scripts/geminiProblemGenerator';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import contestRoutes from './routes/contestRoutes';
import submissionRoutes from './routes/submission';
import leaderboardRoutes from './routes/leaderboard.routes';
import problemRoutes from './routes/problem.routes';




export const createServer = () => {
  const app = express();

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://generativelanguage.googleapis.com'],
          fontSrc: ["'self'", 'data:', 'https:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    })
  );

  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Rate limiting
  app.use(rateLimit({
    windowMs: config.rateLimitWindow,
    max: config.rateLimitMax,
    message: 'Too many requests from this IP, please try again later.'
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression middleware
  app.use(compression());

  // Logging middleware
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  app.use(requestLogger);

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/contests', contestRoutes);
  app.use('/api/submissions', submissionRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/problems', problemRoutes);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      environment: config.env,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Schedule problem generation if not in test environment
  if (process.env.NODE_ENV !== 'test') {
    scheduleProblemGeneration();
  }

  return app;
};

// Connect to database and start problem generation schedule
const initializeApp = async () => {
  try {
    await connect();
    logger.info('Connected to MongoDB');

    if (config.env === 'production') {
      scheduleProblemGeneration();
      logger.info('Problem generation scheduled');
    }
  } catch (error) {
    logger.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

// Initialize the application
initializeApp();

export default createServer; 