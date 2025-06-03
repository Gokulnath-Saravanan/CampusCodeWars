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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger_1.default.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
exports.default = app;
