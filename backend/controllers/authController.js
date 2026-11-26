
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomInt } from "crypto";

import User from "../models/User.js";
import OTP from "../models/OTP.js";

import { sendEmail } from "../utils/sendEmail.js";


// Generate JWT Token
const generateToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

};


// Common response
const userResponse = (user) => {

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
        isEmailVerified: user.isEmailVerified,
        isApproved: user.isApproved
    };

};


// SEND REGISTRATION OTP
export const sendRegistrationOTP = async (req, res, next) => {

    try {

        const { email, role } = req.body;

        if (!email || !["customer", "organizer"].includes(role)) {

            return res.status(400).json({
                success: false,
                message: "Valid email and role are required."
            });

        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });

        }

        const otp = randomInt(100000, 1000000).toString();

        const otpHash = await bcrypt.hash(otp, 10);

        await OTP.findOneAndUpdate(
            {
                email: normalizedEmail,
                purpose: "registration"
            },
            {
                $set: {
                    otpHash,
                    role,
                    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                    attempts: 0
                }
            },
            {
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        await sendEmail({

            to: normalizedEmail,

            subject: "GatherGrid - Email Verification",

            html: `
                <div style="font-family:Arial;padding:25px">
                    <h2>Welcome to GatherGrid!</h2>
                    <p>Your email verification code is:</p>
                    <h1 style="color:#258ef0;letter-spacing:8px">
                        ${otp}
                    </h1>
                    <p>This code expires in 5 minutes.</p>
                    <p>Please do not share this code with anyone.</p>
                </div>
            `

        });

        res.status(200).json({
            success: true,
            message: "Verification code sent successfully."
        });

    } catch (error) {
    console.error("SEND REGISTRATION OTP ERROR:", error);

    return res.status(500).json({
        success: false,
        message: error.message
    });
}

};


// VERIFY OTP
const verifyOTP = async (email, otp, purpose) => {

    const record = await OTP.findOne({
        email,
        purpose
    });

    if (!record) {
        throw new Error("OTP not found. Please request a new code.");
    }

    if (record.expiresAt < new Date()) {

        await OTP.deleteOne({ _id: record._id });

        throw new Error("OTP expired. Please request a new code.");
    }

    if (record.attempts >= 5) {

        await OTP.deleteOne({ _id: record._id });

        throw new Error("Too many incorrect attempts. Request a new code.");
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);

    if (!isValid) {

        await OTP.updateOne(
            { _id: record._id },
            { $inc: { attempts: 1 } }
        );

        throw new Error("Invalid verification code.");
    }

    return record;

};


// CUSTOMER AND ORGANIZER REGISTRATION
export const registerUser = async (req, res, next) => {

    try {

        const {
            name,
            email,
            otp,
            password,
            confirmPassword,
            role,
            organizationName,
            licenseNumber,
            officialEmail
        } = req.body;

        if (!email || !otp || !password || !confirmPassword) {

            return res.status(400).json({
                success: false,
                message: "All required fields must be completed."
            });

        }

        if (!["customer", "organizer"].includes(role)) {

            return res.status(400).json({
                success: false,
                message: "Invalid account type."
            });

        }

        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });

        }

        if (password !== confirmPassword) {

            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });

        }

        if (role === "customer" && !name?.trim()) {

            return res.status(400).json({
                success: false,
                message: "Customer name is required."
            });

        }

        if (
            role === "organizer" &&
            (!organizationName?.trim() ||
             !licenseNumber?.trim() ||
             !officialEmail?.trim())
        ) {

            return res.status(400).json({
                success: false,
                message: "Complete all organization details."
            });

        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Account already exists."
            });

        }

        const otpRecord = await verifyOTP(
            normalizedEmail,
            otp,
            "registration"
        );

        if (otpRecord.role !== role) {

            return res.status(400).json({
                success: false,
                message: "Account type does not match OTP request."
            });

        }

        if (
            role === "organizer" &&
            officialEmail.trim().toLowerCase() !== normalizedEmail
        ) {

            return res.status(400).json({
                success: false,
                message: "Official email must match the verified email."
            });

        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({

            name: role === "customer" ? name.trim() : undefined,

            email: normalizedEmail,

            password: hashedPassword,

            role,

            organizationName:
                role === "organizer" ? organizationName.trim() : undefined,

            licenseNumber:
                role === "organizer" ? licenseNumber.trim() : undefined,

            officialEmail:
                role === "organizer"
                    ? officialEmail.trim().toLowerCase()
                    : undefined,

            isEmailVerified: true,

            isApproved: role === "customer"

        });

        await OTP.deleteOne({
            _id: otpRecord._id
        });

        const token = generateToken(user);

        res.status(201).json({

            success: true,

            message: role === "organizer"
                ? "Registration successful. Your organization is awaiting admin approval."
                : "Customer account created successfully.",

            token,

            user: userResponse(user)

        });

    } catch (error) {

        if (error.code === 11000) {

            return res.status(409).json({
                success: false,
                message: "This email or organization is already registered."
            });

        }

        if (error.message.includes("OTP")) {

            return res.status(400).json({
                success: false,
                message: error.message
            });

        }

        next(error);

    }

};


// LOGIN
export const loginUser = async (req, res, next) => {

    try {

        const { email, password, role } = req.body;

        if (!email || !password || !role) {

            return res.status(400).json({
                success: false,
                message: "Email, password and role are required."
            });

        }

        if (!["customer", "organizer","admin"].includes(role)) {

            return res.status(400).json({
                success: false,
                message: "Invalid account type."
            });

        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
            role
        }).select("+password");

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }

        if (!user.isActive) {

            return res.status(403).json({
                success: false,
                message: "Your account is inactive."
            });

        }

        if (!user.isEmailVerified) {

            return res.status(403).json({
                success: false,
                message: "Please verify your email first."
            });

        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }

        const token = generateToken(user);

        res.status(200).json({

            success: true,

            message: "Login successful.",

            token,

            user: userResponse(user)

        });

    } catch (error) {
        next(error);
    }

};


// FORGOT PASSWORD OTP
export const sendPasswordResetOTP = async (req, res, next) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Email is required."
            });

        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail,
            role: { $in: ["customer", "organizer"] },
            isActive: true
        });

        if (!user) {

            return res.status(200).json({
                success: true,
                message: "If an eligible account exists, a reset code will be sent."
            });

        }

        const otp = randomInt(100000, 1000000).toString();

        const otpHash = await bcrypt.hash(otp, 10);

        await OTP.findOneAndUpdate(
            {
                email: normalizedEmail,
                purpose: "password_reset"
            },
            {
                $set: {
                    otpHash,
                    role: user.role,
                    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                    attempts: 0
                }
            },
            {
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        await sendEmail({

            to: normalizedEmail,

            subject: "GatherGrid - Password Reset",

            html: `
                <div style="font-family:Arial;padding:25px">
                    <h2>Password Reset Request</h2>
                    <p>Your verification code is:</p>
                    <h1 style="color:#258ef0;letter-spacing:8px">${otp}</h1>
                    <p>This code expires in 5 minutes.</p>
                    <p>If you did not request this, ignore this email.</p>
                </div>
            `

        });

        res.status(200).json({
            success: true,
            message: "If an eligible account exists, a reset code will be sent."
        });

    } catch (error) {
        next(error);
    }

};


// RESET PASSWORD
export const resetPassword = async (req, res, next) => {

    try {

        const {
            email,
            otp,
            newPassword,
            confirmPassword
        } = req.body;

        if (!email || !otp || !newPassword || !confirmPassword) {

            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });

        }

        if (newPassword.length < 6) {

            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });

        }

        if (newPassword !== confirmPassword) {

            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });

        }

        const normalizedEmail = email.trim().toLowerCase();

        const otpRecord = await verifyOTP(
            normalizedEmail,
            otp,
            "password_reset"
        );

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const result = await User.updateOne(
            {
                email: normalizedEmail,
                role: otpRecord.role,
                isActive: true
            },
            {
                $set: {
                    password: hashedPassword
                }
            }
        );

        if (result.matchedCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Account not found."
            });

        }

        await OTP.deleteOne({
            _id: otpRecord._id
        });

        res.status(200).json({
            success: true,
            message: "Password reset successfully. Please log in."
        });

    } catch (error) {

        if (error.message.includes("OTP")) {

            return res.status(400).json({
                success: false,
                message: error.message
            });

        }

        next(error);

    }

};


// GET CURRENT LOGGED-IN USER
export const getMe = async (req, res, next) => {

    try {

        const user = await User.findById(req.user.id);

        if (!user || !user.isActive) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        res.status(200).json({
            success: true,
            user: userResponse(user)
        });

    } catch (error) {
        next(error);
    }

};
