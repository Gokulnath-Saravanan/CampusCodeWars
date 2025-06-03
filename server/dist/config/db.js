"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://9036956408gn:Gokul0030@cluster0.givpqd1.mongodb.net/campuscodewars?retryWrites=true&w=majority';
        const conn = await mongoose_1.default.connect(MONGODB_URI);
        logger_1.default.info(`MongoDB Connected: ${conn.connection.host}`);
        // Handle MongoDB connection errors
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.default.error(`MongoDB connection error: ${err}`);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.default.warn('MongoDB disconnected');
        });
        // Handle process termination
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            logger_1.default.info('MongoDB connection closed through app termination');
            process.exit(0);
        });
    }
    catch (error) {
        logger_1.default.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
};
exports.default = connectDB;
