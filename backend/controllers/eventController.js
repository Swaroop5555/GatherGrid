
import mongoose from "mongoose";
import Event from "../models/Event.js";
import EventCategory from "../models/EventCategory.js";

// GET all events with search and filters
export const getEvents = async (req, res, next) => {
    try {
        const { search, category, featured } = req.query;

        const filter = {
            isActive: true
        };

        if (category) {
            filter.category = category;
        }

        if (featured === "true") {
            filter.isFeatured = true;
        }

        if (search && search.trim()) {
            filter.$text = {
                $search: search.trim()
            };
        }

        const events = await Event.find(filter)
            .populate("category", "name slug")
            .sort({ isFeatured: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });

    } catch (error) {
        next(error);
    }
};


// GET individual event details
export const getEventById = async (req, res, next) => {
    try {
        const event = await Event.findOne({
            _id: req.params.id,
            isActive: true
        })
            .populate("category", "name slug")
            .populate("organizer", "name organizationName profileImage");

        if (!event) {
            res.status(404);
            throw new Error("Event not found");
        }

        res.status(200).json({
            success: true,
            data: event
        });

    } catch (error) {
        next(error);
    }
};


// ORGANIZER: Create an event listing
export const createEvent = async (req, res, next) => {
    try {
        const {
            title,
            category,
            shortDescription,
            description,
            image,
            gallery,
            services,
            packages,
            estimatedDuration,
            startingPrice,
            tags
        } = req.body;

        if (!title || !category || !shortDescription || !description) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required event details."
            });
        }

        if (!mongoose.isValidObjectId(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event category."
            });
        }

        const categoryExists = await EventCategory.findById(category);

        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Event category not found."
            });
        }

        const baseSlug = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const slug = `${baseSlug}-${Date.now()}`;

        const event = await Event.create({
            organizer: req.user._id || req.user.id,
            title,
            slug,
            category,
            shortDescription,
            description,
            image,
            gallery,
            services,
            packages,
            estimatedDuration,
            startingPrice,
            tags
        });

        res.status(201).json({
            success: true,
            message: "Event listing created successfully.",
            data: event
        });

    } catch (error) {
        next(error);
    }
};


// ORGANIZER: Get active event listings only
export const getOrganizerEvents = async (req, res, next) => {
    try {
        const events = await Event.find({
            organizer: req.user._id || req.user.id,
            isActive: true
        })
            .populate("category", "name slug")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });

    } catch (error) {
        next(error);
    }
};


// ORGANIZER: Update an existing event listing
export const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const event = await Event.findOne({
            _id: id,
            organizer: req.user._id || req.user.id,
            isActive: true
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found or you are not authorized."
            });
        }

        const allowedFields = [
            "title",
            "category",
            "shortDescription",
            "description",
            "image",
            "gallery",
            "services",
            "packages",
            "estimatedDuration",
            "startingPrice",
            "tags"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (updates.title !== undefined) {
            if (!updates.title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Event title cannot be empty."
                });
            }

            const baseSlug = updates.title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

            event.slug = `${baseSlug}-${Date.now()}`;
        }

        if (updates.category !== undefined) {
            if (!mongoose.isValidObjectId(updates.category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid event category."
                });
            }

            const categoryExists = await EventCategory.findById(
                updates.category
            );

            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: "Event category not found."
                });
            }
        }

        Object.assign(event, updates);

        await event.save();

        res.status(200).json({
            success: true,
            message: "Event listing updated successfully.",
            data: event
        });

    } catch (error) {
        next(error);
    }
};


// ORGANIZER: Delete an event listing (soft delete)
export const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const event = await Event.findOne({
            _id: id,
            organizer: req.user._id || req.user.id,
            isActive: true
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found or you are not authorized."
            });
        }

        event.isActive = false;

        await event.save();

        res.status(200).json({
            success: true,
            message: "Event listing deleted successfully."
        });

    } catch (error) {
        next(error);
    }
};


// ORGANIZER: Upload or replace an event image
export const uploadEventImage = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image to upload."
            });
        }

        const event = await Event.findOne({
            _id: id,
            organizer: req.user._id || req.user.id,
            isActive: true
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found or you are not authorized."
            });
        }

        event.image = req.file.path;

        await event.save();

        res.status(200).json({
            success: true,
            message: "Event image uploaded successfully.",
            data: {
                image: event.image
            }
        });

    } catch (error) {
        next(error);
    }
};


export default {
    getEvents,
    getEventById,
    createEvent,
    getOrganizerEvents,
    updateEvent,
    deleteEvent,
    uploadEventImage
};
