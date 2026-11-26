import express from "express";

import {
    getPublicOrganizers,
    getPublicOrganizerDetails
} from "../controllers/adminController.js";

const router = express.Router();

// GET ALL APPROVED ORGANIZERS
router.get("/", getPublicOrganizers);

// GET ORGANIZER DETAILS AND THEIR EVENTS
router.get("/:id", getPublicOrganizerDetails);

export default router;