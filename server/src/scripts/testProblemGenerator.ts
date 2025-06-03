import { generateProblemManually } from './geminiProblemGenerator';
import logger from '../utils/logger';

async function testGenerator() {
  try {
    logger.info('Starting test problem generation...');
    await generateProblemManually();
    logger.info('Test completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

testGenerator(); 