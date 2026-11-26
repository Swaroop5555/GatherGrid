
import jwt from "jsonwebtoken";
import User from "../models/User.js";


// Authentication middleware
export const protect = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                success: false,
                message: "Please log in to access this resource."
            });

        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {

            return res.status(401).json({
                success: false,
                message: "Invalid or inactive account."
            });

        }

        req.user = {
            id: user._id,
            role: user.role,
            isApproved: user.isApproved
        };

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token."
        });

    }

};


// Role-based access control
export const authorize = (...roles) => {

    return (req, res, next) => {

        console.log("Logged-in user role:", req.user?.role);
        console.log("Allowed roles:", roles);

        if (!req.user || !roles.includes(req.user.role)) {

            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource."
            });

        }

        next();

    };

};


// Approved organizer access
export const approvedOrganizer = (req, res, next) => {

    if (
        !req.user ||
        req.user.role !== "organizer" ||
        !req.user.isApproved
    ) {

        return res.status(403).json({
            success: false,
            message: "Your organization must be approved by the admin first."
        });

    }

    next();

};
