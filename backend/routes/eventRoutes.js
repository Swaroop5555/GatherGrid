
import express from "express";

import {
    getEvents,
    getEventById,
    createEvent,
    getOrganizerEvents,
    uploadEventImage,
    updateEvent,
    deleteEvent
} from "../controllers/eventController.js";

import {
    protect,
    authorize,
    approvedOrganizer
} from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// ORGANIZER ROUTES
// Keep /my-events before /:id
router.post(
    "/",
    protect,
    authorize("organizer"),
    approvedOrganizer,
    createEvent
);
// ORGANIZER: Upload event image
router.post(
    "/:id/image",
    protect,
    authorize("organizer"),
    approvedOrganizer,
    upload.single("image"),
    uploadEventImage
);

router.get(
    "/my-events",
    protect,
    authorize("organizer"),
    approvedOrganizer,
    getOrganizerEvents
);
// ORGANIZER: Update an event
router.put(
    "/:id",
    protect,
    authorize("organizer"),
    approvedOrganizer,
    updateEvent
);

// ORGANIZER: Delete an event
router.delete(
    "/:id",
    protect,
    authorize("organizer"),
    approvedOrganizer,
    deleteEvent
);

// PUBLIC ROUTES
router.get("/", getEvents);

router.get("/:id", getEventById);

export default router;
