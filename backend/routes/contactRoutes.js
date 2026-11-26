
import express from "express";
import { submitContactMessage } from "../controllers/ContactController.js";

const router = express.Router();

router.post("/", submitContactMessage);

export default router;
