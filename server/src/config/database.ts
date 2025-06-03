import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

let mongoServer: MongoMemoryServer | null = null;
let isConnecting = false;

export async function connect(): Promise<void> {
  try {
    // If already connected or connecting, don't try to connect again
    if (mongoose.connection.readyState === 1) {
      logger.info('MongoDB already connected');
      return;
    }

    if (isConnecting) {
      logger.info('MongoDB connection in progress');
      return;
    }

    isConnecting = true;

    // If there's an existing connection, close it first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    let uri = process.env.MONGODB_URI;

    if (process.env.NODE_ENV === 'test') {
      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
      }
      uri = mongoServer.getUri();
    }

    if (!uri) {
      uri = 'mongodb://localhost:27017/campus-code-wars';
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  } finally {
    isConnecting = false;
  }
}

export async function disconnect(): Promise<void> {
  try {
    if (mongoose.connection.readyState === 0) {
      logger.info('MongoDB already disconnected');
      return;
    }

    await mongoose.connection.close();
    
    if (process.env.NODE_ENV === 'test' && mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
    
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
    throw error;
  }
}

// Cleanup function for tests
export async function closeDatabase(): Promise<void> {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
  } catch (error) {
    logger.error('Error cleaning up database:', error);
    throw error;
  }
} 