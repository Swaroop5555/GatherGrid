
import rateLimit from "express-rate-limit";

// OTP request limiter
export const otpLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 5,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many OTP requests. Please try again later."
    }

});


// Login attempt limiter
export const loginLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 10,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    }

});
