import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  logger.info('Testing Gemini API connection...');
  
  if (!apiKey) {
    logger.error('No GEMINI_API_KEY found in environment variables');
    logger.info('Please add GEMINI_API_KEY to your .env file');
    process.exit(1);
  }

  logger.info(`API Key found (length: ${apiKey.length} characters)`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    logger.info('Initialized GoogleGenerativeAI instance');
    
    // List available models first
    logger.info('Attempting to list available models...');
    const models = await genAI.listModels();
    logger.info('Available models:', models);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',  // Using the standard model name
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });

    logger.info('Created model instance, attempting to generate content...');
    
    const prompt = `Create a simple coding problem in this JSON format:
    {
      "title": "A unique title",
      "description": "Problem description",
      "difficulty": "easy",
      "tags": ["arrays"],
      "testCases": [
        {
          "input": "sample input",
          "expectedOutput": "expected output",
          "isHidden": false
        }
      ]
    }`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    logger.info('Successfully received response from Gemini API');
    logger.info('Response preview:', text.substring(0, 100) + '...');
    logger.info('API test completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Gemini API Error:', error);
    process.exit(1);
  }
}

testGeminiAPI(); 