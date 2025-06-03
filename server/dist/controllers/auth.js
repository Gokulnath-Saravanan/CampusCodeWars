"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const auth_1 = require("../utils/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            throw new errorHandler_1.AppError('User already exists', 400);
        }
        // Create user
        const user = await User_1.User.create({
            username,
            email,
            password,
        });
        // Generate token
        const token = (0, auth_1.generateToken)(user._id);
        res.status(201).json({
            status: 'success',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Error registering user', 500);
    }
};
exports.register = register;
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = await User_1.User.findOne({ email }).select('+password');
        if (!user) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        // Generate token
        const token = (0, auth_1.generateToken)(user._id);
        res.json({
            status: 'success',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Error logging in', 500);
    }
};
exports.login = login;
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized',
            });
        }
        const user = await User_1.User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        logger_1.default.error('Get me error:', error instanceof Error ? error.message : 'Unknown error');
        return res.status(500).json({
            success: false,
            error: 'Error getting user information',
        });
    }
};
exports.getMe = getMe;
