
import express from "express";

import {
    getOrganizers,
    approveOrganizer,
    rejectOrganizer,
    getUsers,
    updateUserStatus
} from "../controllers/adminController.js";

import {
    protect,
    authorize
} from "../middleware/authMiddleware.js";

const router = express.Router();

// All admin routes require admin authentication
router.use(protect, authorize("admin"));

// Organizer management
router.get("/organizers", getOrganizers);
router.patch("/organizers/:id/approve", approveOrganizer);
router.patch("/organizers/:id/reject", rejectOrganizer);

// User management
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);

export default router;
