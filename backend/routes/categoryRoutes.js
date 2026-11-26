
import express from "express";

const router = express.Router();

import {
    getCategories,
    getCategoryById
} from "../controllers/categoryController.js";


router.get("/", getCategories);

router.get("/:id", getCategoryById);


export default router;