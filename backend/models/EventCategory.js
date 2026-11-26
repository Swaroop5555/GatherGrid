
import mongoose from "mongoose";

const eventCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        description: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: ""
        },

        icon: {
            type: String,
            default: "calendar"
        },

        isActive: {
            type: Boolean,
            default: true
        },

        sortOrder: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const EventCategory = mongoose.model(
    "EventCategory",
    eventCategorySchema
);

export default EventCategory;
