
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    CalendarDays,
    Search,
    UserRound,
    ClipboardList,
    MapPin,
    Users,
    RefreshCw,
    Clock,
    History
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import API from "../services/api";

import "./CustomerDashboard.css";

function CustomerDashboard() {
    const { user } = useAuth();

    const [showProfile, setShowProfile] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);
    const [success, setSuccess] = useState("");

    // Fetch customer bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/bookings/my-bookings");

            setBookings(response.data.data || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your bookings."
            );
        } finally {
            setLoading(false);
        }
    };

    // Cancel customer booking
    const handleCancelBooking = async (bookingId) => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmCancel) return;

        try {
            setCancellingId(bookingId);
            setError("");
            setSuccess("");

            const response = await API.patch(
                `/bookings/${bookingId}/cancel`
            );

            setSuccess(
                response.data.message ||
                "Booking cancelled successfully."
            );

            await fetchBookings();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to cancel booking."
            );
        } finally {
            setCancellingId(null);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Format event date
    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Format history date
    const formatHistoryDate = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="customer-dashboard">

            {/* WELCOME SECTION */}
            <section className="dashboard-welcome">
                <div>
                    <p className="dashboard-label">
                        CUSTOMER DASHBOARD
                    </p>

                    <h1>
                        Welcome, {user?.name || "Customer"}!
                    </h1>

                    <p>
                        Discover events and find the perfect organizers
                        for your special occasions.
                    </p>
                </div>

                <div className="welcome-icon">
                    <CalendarDays size={55} />
                </div>
            </section>

            {/* CUSTOMER PROFILE */}
            <section className="customer-profile">
                <div className="profile-icon">
                    <UserRound size={28} />
                </div>

                <div>
                    <h2>{user?.name || "Customer"}</h2>
                    <p>{user?.email}</p>

                    <span className="customer-role">
                        Customer Account
                    </span>
                </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="dashboard-section">
                <h2>Quick Actions</h2>

                <div className="dashboard-cards">

                    <div className="dashboard-card">
                        <div className="dashboard-card-icon">
                            <Search size={26} />
                        </div>

                        <h3>Explore Events</h3>

                        <p>
                            Browse different event categories and
                            discover services for your celebration.
                        </p>

                        <Link to="/events">
                            Explore Events →
                        </Link>
                    </div>

                    <div className="dashboard-card">
                        <div className="dashboard-card-icon">
                            <ClipboardList size={26} />
                        </div>

                        <h3>My Bookings</h3>

                        <p>
                            View your booking history and track
                            the status of your event requests.
                        </p>

                        <a
                            href="#my-bookings"
                            className="profile-status dashboard-action-link"
                        >
                            View My Bookings →
                        </a>
                    </div>

                    <div className="dashboard-card">
                        <div className="dashboard-card-icon">
                            <UserRound size={26} />
                        </div>

                        <h3>My Profile</h3>

                        <p>
                            View your registered account information.
                        </p>

                        <button
                            className="profile-status dashboard-action-link"
                            onClick={() => setShowProfile(!showProfile)}
                        >
                            {showProfile
                                ? "Hide Profile ↑"
                                : "View Profile →"}
                        </button>
                    </div>

                </div>
            </section>

            {/* PROFILE DETAILS */}
            {showProfile && (
                <section className="customer-profile-details">
                    <h2>My Profile</h2>

                    <div>
                        <span>Full Name</span>
                        <strong>{user?.name || "N/A"}</strong>
                    </div>

                    <div>
                        <span>Email Address</span>
                        <strong>{user?.email || "N/A"}</strong>
                    </div>

                    <div>
                        <span>Account Role</span>
                        <strong>{user?.role || "Customer"}</strong>
                    </div>
                </section>
            )}

            {/* MY BOOKINGS */}
            <section
                className="customer-bookings-section"
                id="my-bookings"
            >

                <div className="customer-bookings-header">
                    <div>
                        <h2>My Bookings</h2>
                        <p>Track your event booking requests.</p>
                    </div>

                    <button
                        className="customer-refresh-btn"
                        onClick={fetchBookings}
                        disabled={loading}
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="customer-booking-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="customer-booking-success">
                        {success}
                    </div>
                )}

                {loading ? (
                    <p className="customer-booking-message">
                        Loading your bookings...
                    </p>
                ) : bookings.length === 0 ? (
                    <div className="customer-empty-bookings">
                        <ClipboardList size={45} />

                        <h3>No Bookings Yet</h3>

                        <p>
                            You haven't booked any events yet.
                            Explore our events and plan your celebration.
                        </p>

                        <Link to="/events">
                            Explore Events →
                        </Link>
                    </div>
                ) : (
                    <div className="customer-bookings-list">

                        {bookings.map((booking) => (

                            <article
                                className="customer-booking-card"
                                key={booking._id}
                            >

                                {/* BOOKING HEADER */}
                                <div className="customer-booking-top">

                                    <div>
                                        <h3>
                                            {booking.event?.title || "Event"}
                                        </h3>

                                        <span>
                                            Booking ID: {booking._id}
                                        </span>
                                    </div>

                                    <span
                                        className={`customer-booking-status status-${booking.status}`}
                                    >
                                        {booking.status}
                                    </span>

                                </div>

                                {/* BOOKING DETAILS */}
                                <div className="customer-booking-details">

                                    <div>
                                        <span>Organizer</span>
                                        <strong>
                                            {booking.organizer?.organizationName ||
                                                booking.organizer?.name ||
                                                "N/A"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Organizer Email</span>
                                        <strong>
                                            {booking.organizer?.email || "N/A"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Event Date</span>
                                        <strong>
                                            {formatDate(booking.eventDate)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Event Location</span>
                                        <strong>
                                            <MapPin size={15} />
                                            {booking.eventLocation}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Guest Count</span>
                                        <strong>
                                            <Users size={15} />
                                            {booking.guestCount}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Selected Package</span>
                                        <strong>
                                            {booking.packageName || "Standard"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Package Price</span>
                                        <strong>
                                            ₹{Number(
                                                booking.packagePrice || 0
                                            ).toLocaleString("en-IN")}
                                        </strong>
                                    </div>

                                </div>

                                {/* CUSTOMER MESSAGE */}
                                {booking.message && (
                                    <div className="customer-booking-message-box">
                                        <span>Your Message</span>
                                        <p>{booking.message}</p>
                                    </div>
                                )}

                                {/* BOOKING STATUS HISTORY */}
                                <div className="customer-booking-history">

                                    <h4>
                                        <History size={19} />
                                        Booking Status History
                                    </h4>

                                    {booking.statusHistory?.length > 0 ? (

                                        <div className="booking-history-timeline">

                                            {booking.statusHistory.map(
                                                (history, index) => (

                                                    <div
                                                        className="booking-history-item"
                                                        key={history._id || index}
                                                    >

                                                        <div className="booking-history-marker">
                                                            <span></span>
                                                        </div>

                                                        <div className="booking-history-content">

                                                            <strong>
                                                                {history.status.charAt(0).toUpperCase() +
                                                                    history.status.slice(1)}
                                                            </strong>

                                                            <p>
                                                                {history.note ||
                                                                    "Booking status updated."}
                                                            </p>

                                                            <small>
                                                                <Clock size={13} />
                                                                {formatHistoryDate(
                                                                    history.changedAt
                                                                )}
                                                            </small>

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    ) : (
                                        <p className="booking-history-empty">
                                            No status history available for this booking.
                                        </p>
                                    )}

                                </div>

                                {/* CANCEL BOOKING */}
                                {["pending", "approved"].includes(booking.status) && (
                                    <div className="customer-booking-actions">

                                        <button
                                            className="customer-cancel-booking-btn"
                                            onClick={() =>
                                                handleCancelBooking(booking._id)
                                            }
                                            disabled={cancellingId === booking._id}
                                        >
                                            {cancellingId === booking._id
                                                ? "Cancelling..."
                                                : "Cancel Booking"}
                                        </button>

                                    </div>
                                )}

                            </article>

                        ))}

                    </div>
                )}

            </section>

        </div>
    );
}

export default CustomerDashboard;
