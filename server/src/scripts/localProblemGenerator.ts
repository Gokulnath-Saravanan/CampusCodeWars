import { Problem } from '../models/Problem';
import { connect, disconnect } from '../config/database';
import logger from '../utils/logger';
import { validateProblem } from '../utils/problemValidator';
import cron from 'node-cron';

// Predefined problem templates
const problemTemplates = [
  {
    title: "Array Sum",
    description: "Given an array of integers, find the sum of all elements.\n\nInput Format:\nFirst line contains N, the size of array\nSecond line contains N space-separated integers\n\nOutput Format:\nPrint the sum of all elements\n\nConstraints:\n1 ≤ N ≤ 1000\n-1000 ≤ array elements ≤ 1000",
    difficulty: "easy",
    tags: ["arrays", "math"],
    testCases: [
      {
        input: "5\n1 2 3 4 5",
        expectedOutput: "15",
        isHidden: false
      },
      {
        input: "3\n-1 0 1",
        expectedOutput: "0",
        isHidden: false
      },
      {
        input: "4\n10 20 30 40",
        expectedOutput: "100",
        isHidden: true
      }
    ]
  },
  {
    title: "String Palindrome",
    description: "Check if a given string is a palindrome. A palindrome reads the same backwards as forwards.\n\nInput Format:\nA single line containing a string\n\nOutput Format:\nPrint 'YES' if the string is a palindrome, 'NO' otherwise\n\nConstraints:\n1 ≤ string length ≤ 100\nString contains only lowercase letters",
    difficulty: "easy",
    tags: ["strings", "palindrome"],
    testCases: [
      {
        input: "racecar",
        expectedOutput: "YES",
        isHidden: false
      },
      {
        input: "hello",
        expectedOutput: "NO",
        isHidden: false
      },
      {
        input: "amanaplanacanalpanama",
        expectedOutput: "YES",
        isHidden: true
      }
    ]
  },
  {
    title: "Binary Search",
    description: "Implement binary search to find a number in a sorted array.\n\nInput Format:\nFirst line contains N, the size of array\nSecond line contains N space-separated sorted integers\nThird line contains Q, the number of queries\nNext Q lines contain a single integer to search for\n\nOutput Format:\nFor each query, print the index of the number (0-based) or -1 if not found\n\nConstraints:\n1 ≤ N ≤ 10^5\n1 ≤ Q ≤ 1000\nArray is sorted in ascending order",
    difficulty: "medium",
    tags: ["binary search", "arrays", "searching"],
    testCases: [
      {
        input: "5\n1 3 5 7 9\n2\n3\n6",
        expectedOutput: "1\n-1",
        isHidden: false
      },
      {
        input: "3\n10 20 30\n3\n10\n20\n30",
        expectedOutput: "0\n1\n2",
        isHidden: false
      },
      {
        input: "6\n2 4 6 8 10 12\n2\n1\n12",
        expectedOutput: "-1\n5",
        isHidden: true
      }
    ]
  }
];

// Function to get a random problem template
function getRandomProblem() {
  const index = Math.floor(Math.random() * problemTemplates.length);
  return problemTemplates[index];
}

// Function to modify the problem slightly to make it unique
function makeUnique(problem: any) {
  const timestamp = Date.now();
  return {
    ...problem,
    title: `${problem.title} (Variant ${timestamp % 1000})`,
    description: problem.description + `\n\nProblem ID: ${timestamp}`,
  };
}

export async function generateProblemManually(): Promise<void> {
  try {
    await connect();
    
    const template = getRandomProblem();
    const uniqueProblem = makeUnique(template);
    
    const problem = new Problem({
      ...uniqueProblem,
      createdBy: 'LOCAL_GENERATOR',
      status: 'draft',
      timeLimit: 1000,
      memoryLimit: 256,
    });

    // Validate the problem before saving
    const validation = validateProblem(problem);
    if (!validation.isValid) {
      logger.error('Problem validation failed:', validation.errors);
      throw new Error(`Problem validation failed: ${validation.errors.join(', ')}`);
    }

    await problem.save();
    logger.info(`Generated new problem: ${problem.title}`);
    
    await disconnect();
  } catch (error) {
    logger.error('Error generating problem:', error);
    await disconnect();
    throw error;
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