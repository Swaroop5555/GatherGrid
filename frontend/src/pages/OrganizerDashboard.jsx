
import { useState } from "react";
import { Link } from "react-router-dom";

import {
    Building2,
    CalendarDays,
    ClipboardList,
    ShieldCheck,
    Mail,
    PlusCircle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Clock,
    History
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./OrganizerDashboard.css";

function OrganizerDashboard() {
    const { user } = useAuth();

    const isApproved = user?.isApproved === true;

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const [showBookings, setShowBookings] = useState(false);
    const [bookingsLoaded, setBookingsLoaded] = useState(false);

    // Fetch organizer bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/bookings/organizer");

            setBookings(response.data.data || []);
            setBookingsLoaded(true);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load booking requests."
            );
        } finally {
            setLoading(false);
        }
    };

    // Show or hide booking requests
    const handleToggleBookings = async () => {
        if (showBookings) {
            setShowBookings(false);
            return;
        }

        setShowBookings(true);

        if (!bookingsLoaded) {
            await fetchBookings();
        }
    };

    // Approve or reject booking
    const handleBookingStatus = async (bookingId, status) => {
        try {
            setUpdatingId(bookingId);
            setError("");

            await API.patch(`/bookings/${bookingId}/status`, {
                status
            });

            await fetchBookings();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update booking status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // Format event date
    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Format history date
    const formatHistoryDate = (date) => {
        if (!date) return "Date unavailable";

        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="organizer-dashboard">

            {/* Welcome Section */}
            <section className="organizer-welcome">
                <div>
                    <p className="organizer-label">ORGANIZER DASHBOARD</p>

                    <h1>
                        Welcome, {user?.organizationName || user?.name || "Organizer"}!
                    </h1>

                    <p>
                        Manage your organization and grow your event business
                        with GatherGrid.
                    </p>
                </div>

                <div className="organizer-welcome-icon">
                    <Building2 size={55} />
                </div>
            </section>

            {/* Approval Status */}
            <section className="organizer-status-card">
                <div className="organizer-status-icon">
                    <ShieldCheck size={30} />
                </div>

                <div className="organizer-status-info">
                    <h2>Organization Approval</h2>

                    <p>
                        {isApproved
                            ? "Your organization has been approved. You can access organizer services."
                            : "Your organization is waiting for administrator approval."}
                    </p>
                </div>

                <span className={isApproved ? "approval-approved" : "approval-pending"}>
                    {isApproved ? "Approved" : "Pending"}
                </span>
            </section>

            {/* Organization Information */}
            <section className="organizer-profile-card">
                <h2>Organization Information</h2>

                <div className="organizer-info-row">
                    <Building2 size={20} />
                    <div>
                        <span>Organization Name</span>
                        <strong>
                            {user?.organizationName || "Not available"}
                        </strong>
                    </div>
                </div>

                <div className="organizer-info-row">
                    <Mail size={20} />
                    <div>
                        <span>Registered Email</span>
                        <strong>{user?.email || "Not available"}</strong>
                    </div>
                </div>

                <div className="organizer-info-row">
                    <ShieldCheck size={20} />
                    <div>
                        <span>Account Role</span>
                        <strong>Event Organizer</strong>
                    </div>
                </div>
            </section>

            {/* Organization Management */}
            <section className="organizer-section">
                <h2>Manage Your Organization</h2>

                <div className="organizer-cards">

                    {/* My Events */}
                    <div className="organizer-card">
                        <div className="organizer-card-icon">
                            <CalendarDays size={27} />
                        </div>

                        <h3>My Events</h3>

                        <p>
                            Create and manage the events and services
                            offered by your organization.
                        </p>

                        {isApproved ? (
                            <Link to="/organizer-events">
                                Manage My Events →
                            </Link>
                        ) : (
                            <span className="organizer-locked">
                                Available After Approval
                            </span>
                        )}
                    </div>

                    {/* Booking Requests */}
                    <div className="organizer-card">
                        <div className="organizer-card-icon">
                            <ClipboardList size={27} />
                        </div>

                        <h3>Booking Requests</h3>

                        <p>
                            View customer booking requests and manage
                            their booking status.
                        </p>

                        {isApproved ? (
                            <button
                                type="button"
                                className="organizer-booking-toggle"
                                onClick={handleToggleBookings}
                                aria-expanded={showBookings}
                            >
                                {showBookings
                                    ? "Hide Booking Requests ↑"
                                    : "View Booking Requests →"}
                            </button>
                        ) : (
                            <span className="organizer-locked">
                                Available After Approval
                            </span>
                        )}

                        {bookingsLoaded && (
                            <span className="organizer-coming-soon">
                                {bookings.length} Booking(s)
                            </span>
                        )}
                    </div>

                    {/* Explore Events */}
                    <div className="organizer-card">
                        <div className="organizer-card-icon">
                            <PlusCircle size={27} />
                        </div>

                        <h3>Explore Events</h3>

                        <p>
                            Browse the event marketplace and see
                            how GatherGrid presents events.
                        </p>

                        <Link to="/events">
                            Explore Events →
                        </Link>
                    </div>

                </div>
            </section>

            {/* Booking Management - Visible Only When Clicked */}
            {isApproved && showBookings && (
                <section className="organizer-bookings-section">

                    <div className="organizer-bookings-header">
                        <div>
                            <h2>Booking Requests</h2>
                            <p>Manage bookings received from customers.</p>
                        </div>

                        <button
                            className="organizer-refresh-btn"
                            onClick={fetchBookings}
                            disabled={loading}
                        >
                            <RefreshCw size={17} />
                            Refresh
                        </button>
                    </div>

                    {error && (
                        <div className="organizer-booking-error">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <p className="organizer-booking-message">
                            Loading booking requests...
                        </p>
                    ) : bookings.length === 0 ? (
                        <p className="organizer-booking-message">
                            No booking requests received yet.
                        </p>
                    ) : (
                        <div className="organizer-bookings-list">

                            {bookings.map((booking) => (
                                <div
                                    className="organizer-booking-card"
                                    key={booking._id}
                                >

                                    <div className="organizer-booking-top">
                                        <div>
                                            <h3>
                                                {booking.event?.title || "Event"}
                                            </h3>

                                            <span>
                                                Booking ID: {booking._id}
                                            </span>
                                        </div>

                                        <span
                                            className={`booking-status status-${booking.status}`}
                                        >
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="organizer-booking-details">

                                        <div>
                                            <span>Customer</span>
                                            <strong>
                                                {booking.customer?.name || "N/A"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Email</span>
                                            <strong>
                                                {booking.customer?.email || "N/A"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Event Date</span>
                                            <strong>
                                                {formatDate(booking.eventDate)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Location</span>
                                            <strong>
                                                {booking.eventLocation}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Guest Count</span>
                                            <strong>
                                                {booking.guestCount}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Package</span>
                                            <strong>
                                                {booking.packageName || "Standard"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Package Price</span>
                                            <strong>
                                                ₹{booking.packagePrice?.toLocaleString("en-IN") || 0}
                                            </strong>
                                        </div>

                                    </div>

                                    {booking.message && (
                                        <div className="organizer-booking-message-box">
                                            <span>Customer Message</span>
                                            <p>{booking.message}</p>
                                        </div>
                                    )}

                                    {/* Booking Status History */}
                                    <div className="organizer-booking-history">

                                        <h4>
                                            <History size={19} />
                                            Booking Status History
                                        </h4>

                                        {booking.statusHistory?.length > 0 ? (
                                            <div className="organizer-history-timeline">

                                                {booking.statusHistory.map((history, index) => (
                                                    <div
                                                        className="organizer-history-item"
                                                        key={history._id || index}
                                                    >
                                                        <div className="organizer-history-marker">
                                                            <span></span>
                                                        </div>

                                                        <div className="organizer-history-content">

                                                            <strong>
                                                                {history.status}
                                                            </strong>

                                                            <p>
                                                                {history.note || "Status updated."}
                                                            </p>

                                                            <small>
                                                                <Clock size={13} />
                                                                {formatHistoryDate(history.changedAt)}
                                                            </small>

                                                        </div>
                                                    </div>
                                                ))}

                                            </div>
                                        ) : (
                                            <p className="organizer-history-empty">
                                                No status history available for this booking.
                                            </p>
                                        )}

                                    </div>

                                    {/* Approve / Reject */}
                                    {booking.status === "pending" && (
                                        <div className="organizer-booking-actions">

                                            <button
                                                className="booking-approve-btn"
                                                onClick={() =>
                                                    handleBookingStatus(
                                                        booking._id,
                                                        "approved"
                                                    )
                                                }
                                                disabled={updatingId === booking._id}
                                            >
                                                <CheckCircle size={17} />
                                                {updatingId === booking._id
                                                    ? "Updating..."
                                                    : "Approve"}
                                            </button>

                                            <button
                                                className="booking-reject-btn"
                                                onClick={() =>
                                                    handleBookingStatus(
                                                        booking._id,
                                                        "rejected"
                                                    )
                                                }
                                                disabled={updatingId === booking._id}
                                            >
                                                <XCircle size={17} />
                                                Reject
                                            </button>

                                        </div>
                                    )}

                                </div>
                            ))}

                        </div>
                    )}

                </section>
            )}

        </div>
    );
}

export default OrganizerDashboard;
