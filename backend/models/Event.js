
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        default: ""
    },

    options: [{
        type: String
    }],

    startingPrice: {
        type: Number,
        default: 0
    },

    isAvailable: {
        type: Boolean,
        default: true
    }
});

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: String,

    price: {
        type: Number,
        required: true,
        min: 0
    },

    features: [{
        type: String
    }]
});

const eventSchema = new mongoose.Schema(
    {
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EventCategory",
            required: true
        },

        shortDescription: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: ""
        },

        gallery: [{
            type: String
        }],

        services: [serviceSchema],

        packages: [packageSchema],

        estimatedDuration: {
            type: String,
            default: ""
        },

        startingPrice: {
            type: Number,
            default: 0,
            min: 0
        },

        tags: [{
            type: String
        }],

        isFeatured: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

eventSchema.index({
    title: "text",
    shortDescription: "text",
    description: "text",
    tags: "text"
});

eventSchema.index({ organizer: 1, category: 1 });
export default mongoose.model("Event", eventSchema);
