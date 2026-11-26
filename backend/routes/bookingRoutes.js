
import express from "express";

import {
    createBooking,
    getMyBookings,
    getOrganizerBookings,
    updateBookingStatus,
    getAllBookings,
    cancelBooking,
    updateBookingStatusByAdmin
} from "../controllers/bookingController.js";

import {
    protect,
    authorize,
    approvedOrganizer
} from "../middleware/authMiddleware.js";

const router = express.Router();

// CUSTOMER ROUTES
router.post(
    "/",
    protect,
    authorize("customer"),
    createBooking
);

router.get(
    "/my-bookings",
    protect,
    authorize("customer"),
    getMyBookings
);

// ORGANIZER ROUTES
router.get(
    "/organizer",
    protect,
    authorize("organizer"),
    approvedOrganizer,
    getOrganizerBookings
);

router.patch(
    "/:id/status",
    protect,
    authorize("organizer"),
    approvedOrganizer,
    updateBookingStatus
);

router.patch(
    "/:id/cancel",
    protect,
    authorize("customer"),
    cancelBooking
);

// ADMIN ROUTE
// ADMIN ROUTES
router.get(
    "/admin",
    protect,
    authorize("admin"),
    getAllBookings
);

router.patch(
    "/admin/:id/status",
    protect,
    authorize("admin"),
    updateBookingStatusByAdmin
);

export default router;
