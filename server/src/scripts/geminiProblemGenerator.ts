import { GoogleGenerativeAI } from '@google/generative-ai';
import { Problem } from '../models/Problem';
import { connect, disconnect } from '../config/database';
import { validateProblem } from '../utils/problemValidator';
import { rateLimiter } from '../utils/rateLimiter';
import logger from '../utils/logger';
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the generative model
const model = genAI.getGenerativeModel({ 
  model: 'gemini-pro',
  generationConfig: {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  },
});

interface ProblemTemplate {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }[];
}

const PROBLEM_PROMPT = `Create a coding problem with the following format:
{
  "title": "A unique and descriptive title",
  "description": "A detailed problem description including input/output format and constraints",
  "difficulty": "one of: easy, medium, hard",
  "tags": ["relevant", "problem", "tags"],
  "testCases": [
    {
      "input": "sample input",
      "expectedOutput": "expected output",
      "isHidden": false
    }
  ]
}

The problem should be original, challenging, and educational.
Include at least 3 test cases, with at least 1 hidden test case.
Make sure the problem description is clear and includes examples.
Include time and memory limits appropriate for the problem difficulty.
Make sure to return a valid JSON object that matches the format exactly.`;

export async function generateProblemManually(template?: string): Promise<void> {
  let text = '';
  try {
    logger.info('Starting problem generation...');
    await connect();
    logger.info('Connected to MongoDB successfully');
    
    // Check rate limit before making API call
    await rateLimiter.checkRateLimit();
    logger.info('Rate limit check passed');
    
    try {
      logger.info('Calling Gemini API...');
      // Generate content using Gemini AI
      const result = await model.generateContent(template || PROBLEM_PROMPT);
      const response = await result.response;
      text = response.text();
      
      logger.info('Received response from Gemini API');
      logger.debug('Raw response:', text);
      
      logger.info('Parsing response into problem template...');
      // Parse the response into a problem template
      const problemTemplate = JSON.parse(text) as ProblemTemplate;
      
      // Basic validation of the template structure
      if (!problemTemplate.title || !problemTemplate.description || !problemTemplate.testCases) {
        throw new Error('Invalid problem template structure');
      }
      
      logger.info('Creating new Problem document...');
      const problem = new Problem({
        ...problemTemplate,
        createdBy: 'GEMINI_GENERATOR',
        status: 'draft',
        timeLimit: 1000, // Default 1 second
        memoryLimit: 256, // Default 256MB
      });

      // Validate the problem before saving
      logger.info('Validating problem...');
      const validation = validateProblem(problem);
      if (!validation.isValid) {
        logger.error('Problem validation failed:', validation.errors);
        throw new Error(`Problem validation failed: ${validation.errors.join(', ')}`);
      }

      logger.info('Saving problem to database...');
      await problem.save();
      logger.info(`Successfully generated and saved new problem: ${problem.title}`);
    } catch (parseError) {
      logger.error('Error parsing Gemini response:', parseError);
      logger.error('Raw response:', text);
      throw new Error('Failed to parse Gemini response into valid problem format');
    }
  } catch (apiError) {
    logger.error('Gemini API Error:', apiError);
    throw new Error('Failed to generate content using Gemini API');
  }
}

export function scheduleProblemGeneration(): void {
  const schedule = process.env.PROBLEM_GENERATION_SCHEDULE || '0 0 * * *';
  cron.schedule(schedule, async () => {
    try {
      logger.info('Starting scheduled problem generation...');
      await generateProblemManually();
      logger.info('Scheduled problem generation completed');
    } catch (error) {
      logger.error('Scheduled problem generation failed:', error);
    }
  });
}

// For testing purposes
if (require.main === module) {
  generateProblemManually()
    .then(() => logger.info('Manual generation completed'))
    .catch((error) => logger.error('Manual generation failed:', error));
} 