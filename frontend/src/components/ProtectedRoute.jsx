
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
    allowedRoles,
    requireApprovedOrganizer = false
}) {
    const { user, isAuthenticated } = useAuth();

    // Check whether the user is logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check the user's role
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    // Check organizer approval
    if (
        requireApprovedOrganizer &&
        user?.role === "organizer" &&
        !user?.isApproved
    ) {
        return <Navigate to="/organizer-pending" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
