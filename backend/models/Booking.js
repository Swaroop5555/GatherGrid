
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },

        eventDate: {
            type: Date,
            required: true
        },

        eventLocation: {
            type: String,
            required: true,
            trim: true
        },

        guestCount: {
            type: Number,
            required: true,
            min: 1
        },

        packageName: {
            type: String,
            trim: true,
            default: ""
        },

        packagePrice: {
            type: Number,
            default: 0,
            min: 0
        },

        message: {
            type: String,
            trim: true,
            default: ""
        },

        status: {
    type: String,
    enum: [
        "pending",
        "approved",
        "rejected",
        "completed",
        "cancelled"
    ],
    default: "pending"
},

statusHistory: [
    {
        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected",
                "completed",
                "cancelled"
            ],
            required: true
        },

        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        changedAt: {
            type: Date,
            default: Date.now
        },

        note: {
            type: String,
            default: ""
        }
    }
]
    },
    {
        timestamps: true
    }
);

// Useful for retrieving bookings by customer or organizer
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ organizer: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
