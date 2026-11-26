
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        otpHash: {
            type: String,
            required: true
        },

        purpose: {
            type: String,
            enum: ["registration", "password_reset"],
            required: true
        },

        role: {
            type: String,
            enum: ["customer", "organizer"],
            default: "customer"
        },

        expiresAt: {
            type: Date,
            required: true
        },

        attempts: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Automatically delete expired OTP records.
otpSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

// One active OTP per email and purpose.
otpSchema.index(
    { email: 1, purpose: 1 },
    { unique: true }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
