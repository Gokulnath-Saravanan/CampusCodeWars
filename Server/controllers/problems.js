import { GoogleGenerativeAI } from "@google/generative-ai";
import Problem from "../models/Problem.js";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Add a problem (Admin only)
export const addProblem = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Only administrators can add problems manually" 
      });
    }

    const newProblem = new Problem({
      ...req.body,
      author: req.user.id,
      isDaily: req.body.isDaily || false
    });
    
    const savedProblem = await newProblem.save();
    res.status(201).json(savedProblem);
  } catch (error) {
    console.error("Error adding problem:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Generate problem using Gemini AI (Admin only or Automated)
export const generateProblem = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { mode, difficulty, tags, customPrompt } = req.body;
    console.log('Generate request:', { mode, difficulty, tags, customPrompt });

    // Use a valid model name and ensure it's compatible with generateContent
    const modelName = "gemini-pro"; // or "gemini-1.5-pro-latest"
    const model = genAI.getGenerativeModel({ model: modelName });

    // Construct prompt
    let prompt = mode === 'quick'
      ? `Generate a ${difficulty} difficulty coding problem with tags: ${tags.join(', ')}. 
         Please format your response as a valid JSON object with these fields:
         title, description, inputFormat, outputFormat, constraints, examples (array of {input, output, explanation}), testCases (array of {input, output})`
      : customPrompt;

    // Generate content
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      throw new Error(`Gemini API request failed: ${geminiError.message}`);
    }

    if (!result || !result.response) {
      throw new Error('Gemini API returned an empty response');
    }

    const text = result.response.text();
    console.log('Generated text:', text);

    // Extract JSON from response
    let parsedProblem;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      parsedProblem = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error(`Failed to parse generated content as JSON: ${parseError.message}`);
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'inputFormat', 'outputFormat', 'constraints', 'examples', 'testCases'];
    const missingFields = requiredFields.filter(field => !parsedProblem[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Create problem document
    const problemData = {
      ...parsedProblem,
      difficulty: difficulty || 'medium',
      tags: tags || [],
      author: req.user._id,
      isDaily: false
    };

    const newProblem = new Problem(problemData);
    const savedProblem = await newProblem.save();

    res.status(201).json(savedProblem);

  } catch (error) {
    console.error('Problem generation error:', error);
    res.status(500).json({
      message: "Failed to generate problem",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all daily problems
export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ isDaily: true })
      .select('-testCases') // Exclude test cases from list view
      .sort({ createdAt: -1 });
    res.status(200).json(problems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get problem by ID (with auth check)
export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Check if problem is daily challenge or user is admin
    if (!problem.isDaily && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: "This problem is not available" 
      });
    }

    res.status(200).json(problem);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update problem
export const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (problem.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only update your own problems" });
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedProblem);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete problem
export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (problem.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own problems" });
    }

    await Problem.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Problem deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get problems by user ID
export const getUserProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ author: req.user.id });
    res.status(200).json(problems);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
