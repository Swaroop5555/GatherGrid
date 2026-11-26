
import "dotenv/config";

import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure image storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "gathergrid/events",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [
            {
                width: 1600,
                height: 1200,
                crop: "limit",
                quality: "auto",
                fetch_format: "auto"
            }
        ]
    }
});

// Configure Multer
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

export { cloudinary, upload };
