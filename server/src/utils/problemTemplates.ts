export const problemTemplates = {
  algorithmic: `Create an algorithmic problem that focuses on data structures and algorithms with the following format:
{
  "title": "A unique algorithmic problem title",
  "description": "A detailed problem description focusing on algorithmic concepts",
  "difficulty": "one of: easy, medium, hard",
  "tags": ["algorithms", "data-structures"],
  "testCases": [...]
}
Focus on concepts like arrays, strings, trees, graphs, dynamic programming.`,

  mathematical: `Create a mathematical problem that focuses on number theory, combinatorics, or geometry with the following format:
{
  "title": "A unique mathematical problem title",
  "description": "A detailed problem description focusing on mathematical concepts",
  "difficulty": "one of: easy, medium, hard",
  "tags": ["mathematics", "number-theory", "combinatorics", "geometry"],
  "testCases": [...]
}
Focus on concepts like prime numbers, GCD, probability, geometric calculations.`,

  realWorld: `Create a real-world application problem that focuses on practical scenarios with the following format:
{
  "title": "A unique real-world problem title",
  "description": "A detailed problem description based on real-world scenarios",
  "difficulty": "one of: easy, medium, hard",
  "tags": ["real-world", "implementation"],
  "testCases": [...]
}
Focus on scenarios like data processing, business logic, or system design.`,

  competitive: `Create a competitive programming problem that focuses on optimization and efficiency with the following format:
{
  "title": "A unique competitive programming problem title",
  "description": "A detailed problem description with strict time and space constraints",
  "difficulty": "one of: easy, medium, hard",
  "tags": ["competitive-programming", "optimization"],
  "testCases": [...]
}
Focus on efficient algorithms and optimal solutions.`
}; 