"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let token;
    if ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        res.status(401).json({ success: false, error: 'Not authorized to access this route' });
        return;
    }
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield User_1.default.findById(decoded.id);
        if (!user) {
            res.status(401).json({ success: false, error: 'User not found' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.default.error('Auth middleware error:', error instanceof Error ? error.message : 'Unknown error');
        res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
});
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    });
};
exports.authorize = authorize;
