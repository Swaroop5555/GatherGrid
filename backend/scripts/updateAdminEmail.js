
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const updateAdminEmail = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const oldEmail = "satyakatikireddy@gmail.com";
        const newEmail = process.env.NEW_ADMIN_EMAIL?.trim().toLowerCase();

        if (!newEmail) {
            throw new Error("NEW_ADMIN_EMAIL is missing in .env");
        }

        const existingAccount = await User.findOne({
            email: newEmail
        });

        if (existingAccount) {
            throw new Error("This email is already registered.");
        }

        const admin = await User.findOne({
            email: oldEmail,
            role: "admin"
        });

        if (!admin) {
            throw new Error("Existing admin account not found.");
        }

        admin.email = newEmail;
        await admin.save();

        console.log("Admin email updated successfully!");
        console.log("New login email:", newEmail);

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

updateAdminEmail();
