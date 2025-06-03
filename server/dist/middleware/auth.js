"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.authenticateAdmin = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler_1 = require("./errorHandler");
const protect = async (req, res, next) => {
    var _a;
    try {
        // Get token from header
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'No token, authorization denied',
            });
            return;
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        // Get user from token
        const user = await User_1.User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Token is not valid',
            });
            return;
        }
        // Add user to request
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token is not valid',
        });
        return;
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route',
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this route',
            });
        }
        next();
    };
};
exports.authorize = authorize;
const authenticateAdmin = async (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-default-secret');
        const user = await User_1.User.findById(decoded.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied: Admin privileges required' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.default.error('Authentication error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticateAdmin = authenticateAdmin;
const auth = async (req, res, next) => {
    var _a;
    try {
        // Get token from header
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            throw new errorHandler_1.AppError('No token, authorization denied', 401);
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        // Get user from database
        const user = await User_1.User.findById(decoded.id).select('-password');
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        // Add user to request object
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new errorHandler_1.AppError('Invalid token', 401);
        }
        throw new errorHandler_1.AppError('Server error', 500);
    }
};
exports.auth = auth;
