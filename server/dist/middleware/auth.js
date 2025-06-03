"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
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
        const user = await User_1.default.findById(decoded.id).select('-password');
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
        const authReq = req;
        if (!authReq.user) {
            res.status(401).json({ success: false, error: 'Not authorized to access this route' });
            return;
        }
        if (!roles.includes(authReq.user.role)) {
            res.status(403).json({ success: false, error: 'Not authorized to access this route' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
