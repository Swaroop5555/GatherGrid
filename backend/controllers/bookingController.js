
import mongoose from "mongoose";
import { sendEmail } from "../utils/sendEmail.js";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import User from "../models/User.js";

// Helper: get logged-in user ID
const getUserId = (req) => req.user?._id || req.user?.id;


// CUSTOMER: Create a booking request
export const createBooking = async (req, res, next) => {
    try {
        const {
            eventId,
            eventDate,
            eventLocation,
            guestCount,
            packageId,
            message
        } = req.body;

        const customerId = getUserId(req);

        if (!eventId || !eventDate || !eventLocation || !guestCount) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required booking details."
            });
        }

        if (!mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        if (!Number.isInteger(Number(guestCount)) || Number(guestCount) < 1) {
            return res.status(400).json({
                success: false,
                message: "Guest count must be at least 1."
            });
        }

        const selectedDate = new Date(eventDate);

        if (Number.isNaN(selectedDate.getTime()) || selectedDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid future event date."
            });
        }

        const event = await Event.findOne({
            _id: eventId,
            isActive: true
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event listing not found."
            });
        }

        const organizer = await User.findOne({
            _id: event.organizer,
            role: "organizer",
            isActive: true,
            isApproved: true,
            approvalStatus: "approved"
        });

        if (!organizer) {
            return res.status(400).json({
                success: false,
                message: "This organizer is currently unavailable."
            });
        }

        let packageName = "";
        let packagePrice = event.startingPrice || 0;

        if (event.packages.length > 0) {
            if (!packageId || !mongoose.isValidObjectId(packageId)) {
                return res.status(400).json({
                    success: false,
                    message: "Please select a valid package."
                });
            }

            const selectedPackage = event.packages.id(packageId);

            if (!selectedPackage) {
                return res.status(404).json({
                    success: false,
                    message: "Selected package not found."
                });
            }

            packageName = selectedPackage.name;
            packagePrice = selectedPackage.price;
        }

        // Create booking with initial status history
        const booking = await Booking.create({
            customer: customerId,
            organizer: organizer._id,
            event: event._id,
            eventDate: selectedDate,
            eventLocation: eventLocation.trim(),
            guestCount: Number(guestCount),
            packageName,
            packagePrice,
            message: message || "",
            status: "pending",

            statusHistory: [
                {
                    status: "pending",
                    changedBy: customerId,
                    note: "Booking request created."
                }
            ]
        });

        // Notify organizer
        try {
            const customer = await User.findById(customerId)
                .select("name email");

            await sendEmail({
                to: organizer.email,
                subject: "New Booking Request - GatherGrid",
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>New Booking Request!</h2>
                        <p>Hello ${organizer.organizationName || "Organizer"},</p>
                        <p>You have received a new booking request through GatherGrid.</p>

                        <h3>Booking Details</h3>
                        <p><strong>Event:</strong> ${event.title}</p>
                        <p><strong>Customer:</strong> ${customer?.name || "Customer"}</p>
                        <p><strong>Customer Email:</strong> ${customer?.email || "Not available"}</p>
                        <p><strong>Event Date:</strong> ${selectedDate.toLocaleDateString("en-IN")}</p>
                        <p><strong>Location:</strong> ${eventLocation}</p>
                        <p><strong>Guests:</strong> ${guestCount}</p>
                        <p><strong>Package:</strong> ${packageName || "Standard"}</p>
                        <p><strong>Price:</strong> ₹${Number(packagePrice).toLocaleString("en-IN")}</p>

                        <p>Please log in to GatherGrid to review this booking request.</p>
                        <p>Regards,<br />GatherGrid Team</p>
                    </div>
                `
            });

            console.log("Booking notification email sent to organizer.");
        } catch (emailError) {
            console.error("Organizer notification email failed:", emailError.message);
        }

        res.status(201).json({
            success: true,
            message: "Booking request submitted successfully.",
            data: booking
        });

    } catch (error) {
        next(error);
    }
};


// CUSTOMER: Get my bookings
export const getMyBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({
            customer: getUserId(req)
        })
            .populate("event", "title image startingPrice")
            .populate("organizer", "organizationName email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        next(error);
    }
};


// ORGANIZER: Get bookings received by me
export const getOrganizerBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({
            organizer: getUserId(req)
        })
            .populate("customer", "name email")
            .populate("event", "title image")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        next(error);
    }
};


// ORGANIZER: Approve or reject a booking
export const updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Only approved or rejected status is allowed."
            });
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID."
            });
        }

        const booking = await Booking.findOne({
            _id: req.params.id,
            organizer: getUserId(req)
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        if (booking.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending bookings can be updated."
            });
        }

        // Update status and record history
        booking.status = status;

        booking.statusHistory.push({
            status,
            changedBy: getUserId(req),
            note: status === "approved"
                ? "Booking approved by organizer."
                : "Booking rejected by organizer."
        });

        await booking.save();

        // Notify customer
        try {
            const customer = await User.findById(booking.customer)
                .select("name email");

            const event = await Event.findById(booking.event)
                .select("title");

            if (customer?.email) {
                const isApproved = status === "approved";

                await sendEmail({
                    to: customer.email,
                    subject: isApproved
                        ? "Your Booking Has Been Approved - GatherGrid"
                        : "Your Booking Has Been Rejected - GatherGrid",

                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>${isApproved ? "Booking Approved!" : "Booking Update"}</h2>

                            <p>Hello ${customer.name || "Customer"},</p>

                            <p>
                                Your booking request for
                                <strong>${event?.title || "your event"}</strong>
                                has been
                                <strong>${status.toUpperCase()}</strong>.
                            </p>

                            <p>
                                ${isApproved
                                    ? "Great news! The organizer has approved your booking request."
                                    : "Unfortunately, the organizer could not accept your booking request at this time."
                                }
                            </p>

                            <p><strong>Event Date:</strong> ${new Date(booking.eventDate).toLocaleDateString("en-IN")}</p>
                            <p><strong>Location:</strong> ${booking.eventLocation}</p>
                            <p><strong>Package:</strong> ${booking.packageName || "Standard"}</p>
                            <p><strong>Booking Status:</strong> ${status.toUpperCase()}</p>

                            <p>Regards,<br />GatherGrid Team</p>
                        </div>
                    `
                });

                console.log(`Booking ${status} notification sent to customer.`);
            }

        } catch (emailError) {
            console.error("Customer notification email failed:", emailError.message);
        }

        res.status(200).json({
            success: true,
            message: `Booking ${status} successfully.`,
            data: booking
        });

    } catch (error) {
        next(error);
    }
};


// ADMIN: Get all bookings
export const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find()
            .populate("customer", "name email")
            .populate("organizer", "organizationName email")
            .populate({
                path: "event",
                select: "title image category",
                populate: {
                    path: "category",
                    select: "name"
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        next(error);
    }
};


// CUSTOMER: Cancel a booking
export const cancelBooking = async (req, res, next) => {
    try {
        const customerId = getUserId(req);
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID."
            });
        }

        const booking = await Booking.findOne({
            _id: id,
            customer: customerId
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        if (!["pending", "approved"].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: "This booking cannot be cancelled."
            });
        }

        // Update status and record history
        booking.status = "cancelled";

        booking.statusHistory.push({
            status: "cancelled",
            changedBy: customerId,
            note: "Booking cancelled by customer."
        });

        await booking.save();

        // Notify organizer
        try {
            const organizer = await User.findById(booking.organizer)
                .select("name email");

            const event = await Event.findById(booking.event)
                .select("title");

            if (organizer?.email) {
                await sendEmail({
                    to: organizer.email,
                    subject: "Booking Cancelled - GatherGrid",
                    html: `
                        <h2>Booking Cancelled</h2>
                        <p>Hello ${organizer.name || "Organizer"},</p>
                        <p>A customer has cancelled their booking.</p>
                        <p><strong>Event:</strong> ${event?.title || "Event"}</p>
                        <p><strong>Event Date:</strong> ${new Date(booking.eventDate).toDateString()}</p>
                        <p><strong>Status:</strong> Cancelled</p>
                        <p>Regards,<br />GatherGrid Team</p>
                    `
                });
            }

        } catch (emailError) {
            console.error("Cancellation email failed:", emailError.message);
        }

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully.",
            data: booking
        });

    } catch (error) {
        next(error);
    }
};

// Admin: Update booking status
export const updateBookingStatusByAdmin = async (req, res) => {
    try {
        const { status, note } = req.body;

        const allowedStatuses = [
            "pending",
            "approved",
            "rejected",
            "completed",
            "cancelled"
        ];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking status."
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        // Update booking status
        booking.status = status;

        // Record the admin action
        booking.statusHistory.push({
            status,
            changedBy: req.user._id,
            note: note || `Booking status updated to ${status} by admin.`
        });

        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Booking status updated successfully.",
            data: booking
        });

    } catch (error) {
        console.error("Admin booking status update error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update booking status."
        });
    }
};
