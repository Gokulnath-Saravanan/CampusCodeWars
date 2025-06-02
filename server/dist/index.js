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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = __importDefault(require("./config/db"));
const logger_1 = __importDefault(require("./utils/logger"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const problem_1 = __importDefault(require("./routes/problem"));
const submission_1 = __importDefault(require("./routes/submission"));
const contest_1 = __importDefault(require("./routes/contest"));
// Load environment variables
dotenv_1.default.config();
// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        logger_1.default.error(`Error: ${envVar} is not defined in environment variables`);
        process.exit(1);
    }
}
// Create Express app
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
});
app.use(limiter);
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Mount routes
app.use('/api/auth', auth_1.default);
app.use('/api/problems', problem_1.default);
app.use('/api/submissions', submission_1.default);
app.use('/api/contests', contest_1.default);
// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to CampusCodeWars API' });
});
// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.default.error('Unhandled error:', err.message);
    if (err.stack) {
        logger_1.default.error('Stack trace:', err.stack);
    }
    res.status(500).json({
        success: false,
        error: 'Server Error'
    });
});
// Start server
const PORT = process.env.PORT || 5000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        yield (0, db_1.default)();
        // Start listening for requests
        const server = app.listen(PORT, () => {
            logger_1.default.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger_1.default.error('Unhandled Rejection:', err.message);
            if (err.stack) {
                logger_1.default.error('Stack trace:', err.stack);
            }
            // Close server & exit process
            server.close(() => process.exit(1));
        });
        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            logger_1.default.error('Uncaught Exception:', err.message);
            if (err.stack) {
                logger_1.default.error('Stack trace:', err.stack);
            }
            // Close server & exit process
            server.close(() => process.exit(1));
        });
    }
    catch (err) {
        const error = err;
        logger_1.default.error('Failed to start server:', error.message);
        process.exit(1);
    }
});
startServer();
