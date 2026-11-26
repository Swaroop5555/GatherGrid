

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: function () {
                return this.role === "customer";
            }
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            select: false
        },

        role: {
            type: String,
            enum: ["customer", "organizer", "admin"],
            default: "customer"
        },

        organizationName: {
            type: String,
            trim: true,
            required: function () {
                return this.role === "organizer";
            }
        },

        licenseNumber: {
            type: String,
            trim: true,
            required: function () {
                return this.role === "organizer";
            }
        },

        officialEmail: {
            type: String,
            lowercase: true,
            trim: true,
            required: function () {
                return this.role === "organizer";
            }
        },

        isEmailVerified: {
            type: Boolean,
            default: false
        },

        isApproved: {
            type: Boolean,
            default: function () {
                return this.role !== "organizer";
            }
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: function () {
                return this.role === "organizer" ? "pending" : "approved";
            }
        },

        isActive: {
            type: Boolean,
            default: true
        },

        profileImage: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User;
