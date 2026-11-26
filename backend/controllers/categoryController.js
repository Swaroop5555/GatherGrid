
import EventCategory from "../models/EventCategory.js";

// GET all active event categories
 export const getCategories = async (req, res, next) => {
    try {
        const categories = await EventCategory.find({
            isActive: true
        }).sort({ sortOrder: 1, name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });

    } catch (error) {
        next(error);
    }
};

// GET category by ID
export const getCategoryById = async (req, res, next) => {
    try {
        const category = await EventCategory.findOne({
            _id: req.params.id,
            isActive: true
        });

        if (!category) {
            res.status(404);
            throw new Error("Event category not found");
        }

        res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {
        next(error);
    }
};

