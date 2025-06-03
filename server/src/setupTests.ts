import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { User } from './models/User';
import { Problem } from './models/Problem';
import { Contest } from './models/Contest';
import { Submission } from './models/Submission';

// Set timeout for all tests
vi.setConfig({ testTimeout: 60000 }); // 60 seconds timeout for all tests

let mongoServer: MongoMemoryServer;

// Mock Gemini API
const mockGeminiInstance = {
  generateContent: vi.fn().mockResolvedValue({
    response: {
      text: () => JSON.stringify({
        title: 'Test Problem',
        description: 'Test Description',
        difficulty: 'easy',
        tags: ['test'],
        testCases: [
          {
            input: 'test input',
            expectedOutput: 'test output',
            isHidden: false
          }
        ]
      })
    }
  })
};

const MockGoogleGenerativeAI = vi.fn().mockImplementation(() => ({
  getGenerativeModel: vi.fn().mockReturnValue(mockGeminiInstance)
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: MockGoogleGenerativeAI
}));

// Setup and teardown for all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Reset database before each test
beforeEach(async () => {
  await User.deleteMany({});
  await Problem.deleteMany({});
  await Contest.deleteMany({});
  await Submission.deleteMany({});
  
  // Reset all mocks
  vi.resetModules();
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(async () => {
  await User.deleteMany({});
  await Problem.deleteMany({});
  await Contest.deleteMany({});
  await Submission.deleteMany({});
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Mock JWT
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockReturnValue('test-token'),
  verify: vi.fn().mockReturnValue({ id: 'test-id', role: 'user' }),
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  genSalt: vi.fn().mockResolvedValue('salt'),
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn().mockResolvedValue(true),
}));

// Mock OpenAI
const mockOpenAIInstance = {
  chat: {
    completions: {
      create: vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: 'Test Problem',
                description: 'Test Description',
                difficulty: 'easy',
                tags: ['test'],
                testCases: [
                  {
                    input: 'test input',
                    expectedOutput: 'test output',
                    isHidden: false,
                  },
                ],
              }),
            },
          },
        ],
      }),
    },
  },
};

const MockOpenAI = vi.fn().mockImplementation(() => mockOpenAIInstance);
vi.mock('openai', () => MockOpenAI);

// Export mocks for test-specific modifications
export { MockOpenAI, mockOpenAIInstance, MockGoogleGenerativeAI, mockGeminiInstance }; 