
import "dotenv/config";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";

const createAdmin = async () => {
    try {
        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        // Validate environment variables
        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error(
                "Please configure ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in your .env file."
            );
        }

        if (ADMIN_PASSWORD.length < 8) {
            throw new Error("Admin password must contain at least 8 characters.");
        }

        await connectDB();

        const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

        // Prevent duplicate accounts
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            throw new Error(
                "An account with this email already exists. Use a different email."
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

        // Create admin account
        const admin = await User.create({
            name: ADMIN_NAME.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "admin",
            isEmailVerified: true,
            isApproved: true,
            isActive: true
        });

        console.log("Admin account created successfully.");
        console.log("Admin email:", admin.email);
        console.log("Admin role:", admin.role);

    } catch (error) {
        console.error("ADMIN CREATION ERROR:", error.message);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();
