import express from "express";

import {
    sendRegistrationOTP,
    registerUser,
    loginUser,
    sendPasswordResetOTP,
    resetPassword,
    getMe
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

import {
    otpLimiter,
    loginLimiter
} from "../middleware/authRateLimit.js";



const router = express.Router();

// Registration
router.post("/send-otp", otpLimiter, sendRegistrationOTP);
router.post("/register", registerUser);

// Login
router.post("/login", loginLimiter, loginUser);

// Forgot password
router.post("/forgot-password", otpLimiter, sendPasswordResetOTP);
router.post("/reset-password", resetPassword);

// Current logged-in user
router.get("/me", protect, getMe);

export default router;