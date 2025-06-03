"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const logger_1 = __importDefault(require("./utils/logger"));
const app_config_1 = __importDefault(require("./config/app.config"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const problem_1 = __importDefault(require("./routes/problem"));
const contest_routes_1 = __importDefault(require("./routes/contest.routes"));
const submission_1 = __importDefault(require("./routes/submission"));
// Load env vars
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
// Connect to database
(0, db_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100
});
app.use(limiter);
// Body parser
app.use(express_1.default.json());
// Logging
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Mount routes
app.use('/api/auth', auth_1.default);
app.use('/api/problems', problem_1.default);
app.use('/api/contests', contest_routes_1.default);
app.use('/api/submissions', submission_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.default.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Server Error'
    });
});
const server = app.listen(app_config_1.default.port, () => {
    logger_1.default.info(`Server running in ${app_config_1.default.env} mode on port ${app_config_1.default.port}`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.default.error('Unhandled Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger_1.default.error('Uncaught Exception:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});
// Handle SIGTERM
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        logger_1.default.info('Process terminated');
        process.exit(0);
    });
});
exports.default = server;
