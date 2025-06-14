"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const auth_2 = require("../controllers/auth");
const router = express_1.default.Router();
router.post('/register', auth_2.register);
router.post('/login', auth_2.login);
router.get('/me', auth_1.protect, auth_2.getMe);
exports.default = router;
