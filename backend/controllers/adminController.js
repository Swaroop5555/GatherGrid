
import mongoose from "mongoose";
import User from "../models/User.js";
import Event from "../models/Event.js";
// GET ALL ORGANIZERS
export const getOrganizers = async (req, res, next) => {
    try {
        const organizers = await User.find({ role: "organizer" })
            .select("-password")
            .sort({ createdAt: -1 });

        const formattedOrganizers = organizers.map((organizer) => {
            const data = organizer.toObject();

            // Handle older organizer accounts without approvalStatus
            data.approvalStatus =
                data.approvalStatus ||
                (data.isApproved ? "approved" : "pending");

            return data;
        });

        res.status(200).json({
            success: true,
            count: formattedOrganizers.length,
            organizers: formattedOrganizers
        });

    } catch (error) {
        next(error);
    }
};


// APPROVE ORGANIZER
export const approveOrganizer = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organizer ID."
            });
        }

        const organizer = await User.findOne({
            _id: id,
            role: "organizer"
        });

        if (!organizer) {
            return res.status(404).json({
                success: false,
                message: "Organizer not found."
            });
        }

        organizer.isApproved = true;
        organizer.approvalStatus = "approved";

        await organizer.save();

        res.status(200).json({
            success: true,
            message: "Organizer approved successfully.",
            organizer: {
                id: organizer._id,
                name: organizer.name,
                email: organizer.email,
                organizationName: organizer.organizationName,
                isApproved: organizer.isApproved,
                approvalStatus: organizer.approvalStatus
            }
        });

    } catch (error) {
        next(error);
    }
};


// REJECT ORGANIZER
export const rejectOrganizer = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organizer ID."
            });
        }

        const organizer = await User.findOne({
            _id: id,
            role: "organizer"
        });

        if (!organizer) {
            return res.status(404).json({
                success: false,
                message: "Organizer not found."
            });
        }

        organizer.isApproved = false;
        organizer.approvalStatus = "rejected";

        await organizer.save();

        res.status(200).json({
            success: true,
            message: "Organizer application rejected.",
            organizer: {
                id: organizer._id,
                name: organizer.name,
                email: organizer.email,
                organizationName: organizer.organizationName,
                isApproved: organizer.isApproved,
                approvalStatus: organizer.approvalStatus
            }
        });

    } catch (error) {
        next(error);
    }
};


// GET ALL CUSTOMERS AND ORGANIZERS
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({
            role: { $in: ["customer", "organizer"] }
        })
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        next(error);
    }
};


// ACTIVATE OR DEACTIVATE USER
export const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be true or false."
            });
        }

        const user = await User.findOneAndUpdate(
            {
                _id: id,
                role: { $in: ["customer", "organizer"] }
            },
            {
                $set: { isActive }
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Customer or organizer not found."
            });
        }

        res.status(200).json({
            success: true,
            message: `User ${isActive ? "activated" : "deactivated"} successfully.`,
            user
        });

    } catch (error) {
        next(error);
    }
};

// GET APPROVED ORGANIZERS FOR CUSTOMERS
export const getPublicOrganizers = async (req, res, next) => {
    try {
        const organizers = await User.find({
            role: "organizer",
            isActive: { $ne: false },
            $or: [
                { approvalStatus: "approved" },
                {
                    approvalStatus: { $exists: false },
                    isApproved: true
                }
            ]
        })
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: organizers.length,
            organizers
        });

    } catch (error) {
        next(error);
    }
};
// GET PUBLIC ORGANIZER DETAILS AND THEIR EVENTS
export const getPublicOrganizerDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { category } = req.query;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organizer ID."
            });
        }

        if (category && !mongoose.isValidObjectId(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID."
            });
        }

        const organizer = await User.findOne({
            _id: id,
            role: "organizer",
            isActive: { $ne: false },
            $or: [
                { approvalStatus: "approved" },
                {
                    approvalStatus: { $exists: false },
                    isApproved: true
                }
            ]
        }).select("-password");

        if (!organizer) {
            return res.status(404).json({
                success: false,
                message: "Organizer not found."
            });
        }

        const eventFilter = {
            organizer: id,
            isActive: true
        };

        if (category) {
            eventFilter.category = category;
        }

        const events = await Event.find(eventFilter)
            .populate("category", "name slug")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            organizer,
            count: events.length,
            events
        });

    } catch (error) {
        next(error);
    }
};