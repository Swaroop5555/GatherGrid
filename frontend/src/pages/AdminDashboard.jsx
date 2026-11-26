
import { useEffect, useState } from "react";
import API from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [organizers, setOrganizers] = useState([]);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);

    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [bookingSearch, setBookingSearch] = useState("");
    const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingStatusDraft, setBookingStatusDraft] = useState("");
    const [bookingStatusNote, setBookingStatusNote] = useState("");
    const [bookingActionLoading, setBookingActionLoading] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                organizerResponse,
                userResponse,
                bookingResponse
            ] = await Promise.all([
                API.get("/admin/organizers"),
                API.get("/admin/users"),
                API.get("/bookings/admin")
            ]);

            setOrganizers(organizerResponse.data.organizers || []);
            setUsers(userResponse.data.users || []);

            const fetchedBookings =
                bookingResponse.data.data ||
                bookingResponse.data.bookings ||
                [];

            setBookings(fetchedBookings);

            return fetchedBookings;

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load admin dashboard data."
            );
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Open booking details and initialize status controls
    const handleViewBooking = (booking) => {
        setSelectedBooking(booking);
        setBookingStatusDraft(booking.status || "pending");
        setBookingStatusNote("");
    };

    // Admin booking status update
    const handleAdminBookingStatus = async () => {
        if (!selectedBooking) return;

        if (!bookingStatusDraft) {
            alert("Please select a booking status.");
            return;
        }

        if (bookingStatusDraft === selectedBooking.status) {
            alert("Please select a different status.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to change this booking status to "${bookingStatusDraft}"?`
        );

        if (!confirmed) return;

        try {
            setBookingActionLoading(true);

            await API.patch(
                `/bookings/admin/${selectedBooking._id}/status`,
                {
                    status: bookingStatusDraft,
                    note: bookingStatusNote.trim()
                }
            );

            alert("Booking status updated successfully.");

            const updatedBookings = await fetchDashboardData();

            const updatedBooking = updatedBookings.find(
                (booking) => booking._id === selectedBooking._id
            );

            if (updatedBooking) {
                setSelectedBooking(updatedBooking);
                setBookingStatusDraft(updatedBooking.status);
                setBookingStatusNote("");
            } else {
                setSelectedBooking(null);
            }

        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to update booking status."
            );
        } finally {
            setBookingActionLoading(false);
        }
    };

    // Filter bookings
    const filteredBookings = bookings.filter((booking) => {
        const search = bookingSearch.toLowerCase().trim();

        const matchesSearch =
            (booking.event?.title || "").toLowerCase().includes(search) ||
            (booking.customer?.name || "").toLowerCase().includes(search) ||
            (booking.customer?.email || "").toLowerCase().includes(search) ||
            (booking.organizer?.name || "").toLowerCase().includes(search) ||
            (booking.organizer?.organizationName || "").toLowerCase().includes(search) ||
            (booking.organizer?.email || "").toLowerCase().includes(search) ||
            (booking._id || "").toLowerCase().includes(search);

        const matchesStatus =
            bookingStatusFilter === "all" ||
            booking.status === bookingStatusFilter;

        return matchesSearch && matchesStatus;
    });

    const getOrganizerStatus = (organizer) => {
        if (organizer.approvalStatus) {
            return organizer.approvalStatus;
        }

        return organizer.isApproved ? "approved" : "pending";
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Export bookings to CSV
    const exportBookingsToCSV = (data, fileName) => {
        if (!data.length) {
            alert("No bookings available to export.");
            return;
        }

        const headers = [
            "Booking ID",
            "Customer Name",
            "Customer Email",
            "Organizer Name",
            "Organizer Email",
            "Event Name",
            "Event Date",
            "Event Location",
            "Guest Count",
            "Package Name",
            "Package Price",
            "Booking Status"
        ];

        const rows = data.map((booking) => [
            booking._id,
            booking.customer?.name || "N/A",
            booking.customer?.email || "N/A",
            booking.organizer?.organizationName ||
                booking.organizer?.name || "N/A",
            booking.organizer?.email || "N/A",
            booking.event?.title || "N/A",
            booking.eventDate
                ? new Date(booking.eventDate).toLocaleDateString("en-IN")
                : "N/A",
            booking.eventLocation || "N/A",
            booking.guestCount || 0,
            booking.packageName || "Standard",
            booking.packagePrice || 0,
            booking.status || "N/A"
        ]);

        const escapeCSV = (value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`;

        const csvContent = [
            headers,
            ...rows
        ]
            .map((row) => row.map(escapeCSV).join(","))
            .join("\n");

        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleOrganizerAction = async (id, action) => {
        const actionText = action === "approve" ? "approve" : "reject";

        if (!window.confirm(`Are you sure you want to ${actionText} this organizer?`)) {
            return;
        }

        try {
            setActionLoading(id);

            await API.patch(`/admin/organizers/${id}/${action}`);

            await fetchDashboardData();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                `Unable to ${actionText} organizer.`
            );
        } finally {
            setActionLoading("");
        }
    };

    const handleUserStatus = async (user) => {
        const id = user._id || user.id;
        const newStatus = !user.isActive;
        const actionText = newStatus ? "activate" : "deactivate";

        if (!window.confirm(`Are you sure you want to ${actionText} this account?`)) {
            return;
        }

        try {
            setActionLoading(id);

            await API.patch(`/admin/users/${id}/status`, {
                isActive: newStatus
            });

            await fetchDashboardData();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to update user status."
            );
        } finally {
            setActionLoading("");
        }
    };

    // Organizer statistics
    const totalOrganizers = organizers.length;

    const pendingOrganizers = organizers.filter(
        (org) => getOrganizerStatus(org) === "pending"
    ).length;

    const approvedOrganizers = organizers.filter(
        (org) => getOrganizerStatus(org) === "approved"
    ).length;

    const rejectedOrganizers = organizers.filter(
        (org) => getOrganizerStatus(org) === "rejected"
    ).length;

    // User statistics
    const totalCustomers = users.filter(
        (user) => user.role === "customer"
    ).length;

    const totalUsers = users.length;

    // Booking statistics
    const totalBookings = bookings.length;

    const pendingBookings = bookings.filter(
        (booking) => booking.status === "pending"
    ).length;

    const approvedBookings = bookings.filter(
        (booking) => booking.status === "approved"
    ).length;

    const rejectedBookings = bookings.filter(
        (booking) => booking.status === "rejected"
    ).length;

    const completedBookings = bookings.filter(
        (booking) => booking.status === "completed"
    ).length;

    const cancelledBookings = bookings.filter(
        (booking) => booking.status === "cancelled"
    ).length;

    // Monthly booking trends - last 6 months
    const monthlyBookings = Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - (5 - index));

        const month = date.toLocaleString("en-IN", {
            month: "short"
        });

        const year = date.getFullYear();

        const count = bookings.filter((booking) => {
            if (!booking.createdAt) return false;

            const bookingDate = new Date(booking.createdAt);

            return (
                bookingDate.getMonth() === date.getMonth() &&
                bookingDate.getFullYear() === year
            );
        }).length;

        return { month, year, count };
    });

    // Booking value
    const totalBookingValue = bookings.reduce(
        (total, booking) => total + (Number(booking.packagePrice) || 0),
        0
    );

    // Popular event categories
    const categoryCounts = {};

    bookings.forEach((booking) => {
        const category =
            booking.event?.category?.name || "Uncategorized";

        categoryCounts[category] =
            (categoryCounts[category] || 0) + 1;
    });

    const popularCategories = Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    // Filter organizers
    const filteredOrganizers = organizers.filter((org) => {
        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            (org.organizationName || "").toLowerCase().includes(search) ||
            (org.name || "").toLowerCase().includes(search) ||
            (org.email || "").toLowerCase().includes(search);

        const matchesStatus =
            statusFilter === "all" ||
            getOrganizerStatus(org) === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-spinner"></div>
                <p>Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">

            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <h2>Gather<span>Grid</span></h2>
                    <p>ADMIN PANEL</p>
                </div>

                <nav className="admin-nav">
                    <button
                        className={activeTab === "overview" ? "active" : ""}
                        onClick={() => setActiveTab("overview")}
                    >
                        <span>▦</span> Overview
                    </button>

                    <button
                        className={activeTab === "organizers" ? "active" : ""}
                        onClick={() => setActiveTab("organizers")}
                    >
                        <span>♙</span> Organizers
                    </button>

                    <button
                        className={activeTab === "users" ? "active" : ""}
                        onClick={() => setActiveTab("users")}
                    >
                        <span>♧</span> Users
                    </button>

                    <button
                        className={activeTab === "bookings" ? "active" : ""}
                        onClick={() => setActiveTab("bookings")}
                    >
                        <span>▤</span> Bookings
                    </button>
                </nav>

                <div className="admin-sidebar-bottom">
                    <p>GatherGrid Management</p>
                    <small>Admin Control Center</small>
                </div>
            </aside>

            <main className="admin-main">

                <header className="admin-header">
                    <div>
                        <h1>
                            {activeTab === "overview" && "Dashboard Overview"}
                            {activeTab === "organizers" && "Organizer Management"}
                            {activeTab === "users" && "User Management"}
                            {activeTab === "bookings" && "Booking Management"}
                        </h1>
                        <p>Manage your GatherGrid platform</p>
                    </div>

                    <button
                        className="admin-refresh-btn"
                        onClick={fetchDashboardData}
                    >
                        ↻ Refresh
                    </button>
                </header>

                {error && (
                    <div className="admin-error">
                        {error}
                        <button onClick={fetchDashboardData}>Retry</button>
                    </div>
                )}

                {/* OVERVIEW */}
                {activeTab === "overview" && (
                    <section className="admin-content">

                        <div className="admin-welcome">
                            <div>
                                <h2>Welcome to GatherGrid Admin</h2>
                                <p>
                                    Monitor users, manage organizers and keep
                                    your event marketplace running smoothly.
                                </p>
                            </div>
                            <div className="admin-welcome-icon">✦</div>
                        </div>

                        <h2 className="admin-section-title">
                            Platform Statistics
                        </h2>

                        <div className="admin-stats-grid">

                            <div className="admin-stat-card">
                                <div className="stat-icon purple">♧</div>
                                <p>Total Users</p>
                                <h2>{totalUsers}</h2>
                                <small>Customers and organizers</small>
                            </div>

                            <div className="admin-stat-card">
                                <div className="stat-icon blue">♙</div>
                                <p>Total Organizers</p>
                                <h2>{totalOrganizers}</h2>
                                <small>Registered organizations</small>
                            </div>

                            <div className="admin-stat-card">
                                <div className="stat-icon orange">◷</div>
                                <p>Pending Approval</p>
                                <h2>{pendingOrganizers}</h2>
                                <small>Awaiting your review</small>
                            </div>

                            <div className="admin-stat-card">
                                <div className="stat-icon green">✓</div>
                                <p>Approved</p>
                                <h2>{approvedOrganizers}</h2>
                                <small>Approved organizers</small>
                            </div>

                            <div className="admin-stat-card">
                                <div className="stat-icon red">✕</div>
                                <p>Rejected</p>
                                <h2>{rejectedOrganizers}</h2>
                                <small>Rejected applications</small>
                            </div>

                            <div className="admin-stat-card">
                                <div className="stat-icon teal">♧</div>
                                <p>Total Customers</p>
                                <h2>{totalCustomers}</h2>
                                <small>Registered customers</small>
                            </div>

                        </div>

                        <h2 className="admin-section-title">
                            Booking Statistics
                        </h2>

                        <div className="admin-stats-grid">

                            <div className="admin-stat-card">
                                <div className="stat-icon purple">▤</div>
                                <p>Total Bookings</p>
                                <h2>{totalBookings}</h2>
                                <small>All customer bookings</small>
                            </div>

                            <div className="admin-stat-card">
                                <div className="stat-icon orange">◷</div>
                                <p>Pending Bookings</p>
                                <h2>{pendingBookings}</h2>
                                <small>Awaiting organizer response</small>
                            </div>

                            <div className="admin-stat-card">
                                <div className="stat-icon green">✓</div>
                                <p>Approved Bookings</p>
                                <h2>{approvedBookings}</h2>
                                <small>Confirmed bookings</small>
                            </div>

                            <div className="admin-stat-card">
                                <div className="stat-icon red">✕</div>
                                <p>Rejected Bookings</p>
                                <h2>{rejectedBookings}</h2>
                                <small>Rejected booking requests</small>
                            </div>

                            <div className="admin-stat-card">
                                <div className="stat-icon teal">★</div>
                                <p>Completed Bookings</p>
                                <h2>{completedBookings}</h2>
                                <small>Successfully completed</small>
                            </div>

                            <div className="admin-stat-card">
                                <div className="stat-icon blue">↶</div>
                                <p>Cancelled Bookings</p>
                                <h2>{cancelledBookings}</h2>
                                <small>Cancelled requests</small>
                            </div>

                        </div>

                        {/* BOOKING ANALYTICS */}
                        <h2 className="admin-section-title">
                            Booking Analytics
                        </h2>

                        <div className="analytics-summary-card">
                            <div>
                                <span>Total Booking Value</span>
                                <h2>
                                    ₹{totalBookingValue.toLocaleString("en-IN")}
                                </h2>
                                <small>Combined package value of all bookings</small>
                            </div>
                            <div className="analytics-summary-icon">₹</div>
                        </div>

                        <div className="admin-analytics-grid">

                            <div className="analytics-card">
                                <h3>Monthly Booking Trends</h3>
                                <p className="analytics-subtitle">
                                    Bookings over the last six months
                                </p>

                                <div className="monthly-chart">
                                    {monthlyBookings.map((item, index) => {
                                        const maxCount = Math.max(
                                            ...monthlyBookings.map((month) => month.count),
                                            1
                                        );

                                        const width = (item.count / maxCount) * 100;

                                        return (
                                            <div className="monthly-chart-row" key={index}>
                                                <span className="monthly-chart-label">
                                                    {item.month}
                                                </span>

                                                <div className="monthly-chart-track">
                                                    <div
                                                        className="monthly-chart-bar"
                                                        style={{ width: `${width}%` }}
                                                    />
                                                </div>

                                                <strong>{item.count}</strong>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="analytics-card">
                                <h3>Booking Status Distribution</h3>
                                <p className="analytics-subtitle">
                                    Current booking status breakdown
                                </p>

                                <div className="status-analytics-list">
                                    {[
                                        { name: "Pending", count: pendingBookings },
                                        { name: "Approved", count: approvedBookings },
                                        { name: "Rejected", count: rejectedBookings },
                                        { name: "Completed", count: completedBookings },
                                        { name: "Cancelled", count: cancelledBookings }
                                    ].map((item) => {
                                        const percentage = totalBookings > 0
                                            ? (item.count / totalBookings) * 100
                                            : 0;

                                        return (
                                            <div className="status-analytics-item" key={item.name}>
                                                <div className="status-analytics-heading">
                                                    <span>{item.name}</span>
                                                    <strong>
                                                        {item.count} ({percentage.toFixed(1)}%)
                                                    </strong>
                                                </div>

                                                <div className="status-analytics-track">
                                                    <div
                                                        className={`status-analytics-bar ${item.name.toLowerCase()}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="analytics-card">
                                <h3>Popular Event Categories</h3>
                                <p className="analytics-subtitle">
                                    Categories ranked by booking count
                                </p>

                                {popularCategories.length === 0 ? (
                                    <p className="analytics-empty">
                                        No category booking data available.
                                    </p>
                                ) : (
                                    <div className="popular-category-list">
                                        {popularCategories.map((category, index) => (
                                            <div
                                                className="popular-category-item"
                                                key={category.name}
                                            >
                                                <div className="popular-category-rank">
                                                    {index + 1}
                                                </div>

                                                <div className="popular-category-info">
                                                    <strong>{category.name}</strong>
                                                    <small>
                                                        {category.count} booking(s)
                                                    </small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="admin-overview-bottom">
                            <div>
                                <h3>Organizer Applications</h3>
                                <p>
                                    {pendingOrganizers > 0
                                        ? `You have ${pendingOrganizers} application(s) waiting for review.`
                                        : "There are no pending applications."}
                                </p>
                                <button onClick={() => setActiveTab("organizers")}>
                                    Manage Organizers →
                                </button>
                            </div>

                            <div>
                                <h3>Registered Users</h3>
                                <p>
                                    View customer and organizer accounts and
                                    manage their access.
                                </p>
                                <button onClick={() => setActiveTab("users")}>
                                    Manage Users →
                                </button>
                            </div>
                        </div>

                    </section>
                )}

                {/* ORGANIZER MANAGEMENT */}
                {activeTab === "organizers" && (
                    <section className="admin-content">

                        <div className="admin-list-heading">
                            <div>
                                <h2>Organizer Applications</h2>
                                <p>Search and manage registered organizations.</p>
                            </div>

                            <span className="admin-count">
                                {filteredOrganizers.length} Results
                            </span>
                        </div>

                        <div className="organizer-filters">
                            <input
                                type="text"
                                placeholder="Search by organization, name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Applications</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                }}
                            >
                                Clear
                            </button>
                        </div>

                        {filteredOrganizers.length === 0 ? (
                            <div className="admin-empty">
                                <h3>No organizers found</h3>
                                <p>
                                    No organizer applications match your search or selected status.
                                </p>
                            </div>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Organization</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredOrganizers.map((org) => {
                                            const id = org._id || org.id;
                                            const status = getOrganizerStatus(org);

                                            return (
                                                <tr key={id}>
                                                    <td>
                                                        <strong>
                                                            {org.organizationName ||
                                                                org.name ||
                                                                "Unnamed Organization"}
                                                        </strong>
                                                        <small>{org.name || "Organizer"}</small>
                                                    </td>

                                                    <td>{org.email}</td>

                                                    <td>
                                                        <span className={`status-badge ${status}`}>
                                                            {status}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {status === "pending" ? (
                                                            <div className="admin-actions">
                                                                <button
                                                                    className="approve-btn"
                                                                    disabled={actionLoading === id}
                                                                    onClick={() =>
                                                                        handleOrganizerAction(id, "approve")
                                                                    }
                                                                >
                                                                    Approve
                                                                </button>

                                                                <button
                                                                    className="reject-btn"
                                                                    disabled={actionLoading === id}
                                                                    onClick={() =>
                                                                        handleOrganizerAction(id, "reject")
                                                                    }
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="admin-no-action">
                                                                No action needed
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </section>
                )}

                {/* USER MANAGEMENT */}
                {activeTab === "users" && (
                    <section className="admin-content">

                        <div className="admin-list-heading">
                            <div>
                                <h2>Registered Users</h2>
                                <p>Manage customer and organizer accounts.</p>
                            </div>
                            <span className="admin-count">
                                {totalUsers} Users
                            </span>
                        </div>

                        {users.length === 0 ? (
                            <div className="admin-empty">
                                <h3>No users found</h3>
                                <p>Registered users will appear here.</p>
                            </div>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Account Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {users.map((user) => {
                                            const id = user._id || user.id;

                                            return (
                                                <tr key={id}>
                                                    <td>
                                                        <strong>
                                                            {user.name || user.organizationName || "User"}
                                                        </strong>
                                                    </td>

                                                    <td>{user.email}</td>

                                                    <td>
                                                        <span className="role-badge">
                                                            {user.role}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className={`status-badge ${user.isActive ? "approved" : "rejected"}`}>
                                                            {user.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <button
                                                            className={user.isActive ? "deactivate-btn" : "activate-btn"}
                                                            disabled={actionLoading === id}
                                                            onClick={() => handleUserStatus(user)}
                                                        >
                                                            {user.isActive ? "Deactivate" : "Activate"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </section>
                )}

                {/* BOOKING MANAGEMENT */}
                {activeTab === "bookings" && (
                    <section className="admin-content">

                        <div className="admin-list-heading">
                            <div>
                                <h2>All Bookings</h2>
                                <p>Monitor customer bookings across GatherGrid.</p>
                            </div>

                            <div className="admin-booking-export-actions">
                                <span className="admin-count">
                                    {bookings.length} Bookings
                                </span>

                                <button
                                    type="button"
                                    className="admin-export-btn"
                                    onClick={() =>
                                        exportBookingsToCSV(
                                            bookings,
                                            "GatherGrid_All_Bookings.csv"
                                        )
                                    }
                                >
                                    ↓ Export All
                                </button>

                                <button
                                    type="button"
                                    className="admin-export-btn"
                                    onClick={() =>
                                        exportBookingsToCSV(
                                            filteredBookings,
                                            "GatherGrid_Filtered_Bookings.csv"
                                        )
                                    }
                                >
                                    ↓ Export Filtered
                                </button>
                            </div>
                        </div>

                        <div className="admin-booking-filters">
                            <input
                                type="text"
                                placeholder="Search customer, organizer, event..."
                                value={bookingSearch}
                                onChange={(e) => setBookingSearch(e.target.value)}
                            />

                            <select
                                value={bookingStatusFilter}
                                onChange={(e) => setBookingStatusFilter(e.target.value)}
                            >
                                <option value="all">All Bookings</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => {
                                    setBookingSearch("");
                                    setBookingStatusFilter("all");
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>

                        <p className="admin-booking-results">
                            Showing {filteredBookings.length} of {bookings.length} bookings
                        </p>

                        {filteredBookings.length === 0 ? (
                            <div className="admin-empty">
                                <h3>No bookings found</h3>
                                <p>No bookings match your search or selected status.</p>
                            </div>
                        ) : (
                            <div className="admin-bookings-list">
                                {filteredBookings.map((booking) => (
                                    <div
                                        className="admin-booking-card"
                                        key={booking._id}
                                    >
                                        <div className="admin-booking-header">
                                            <div>
                                                <h3>
                                                    {booking.event?.title || "Event"}
                                                </h3>
                                                <small>
                                                    Booking ID: {booking._id}
                                                </small>
                                            </div>

                                            <div className="admin-booking-header-actions">
                                                <span className={`status-badge ${booking.status}`}>
                                                    {booking.status}
                                                </span>

                                                <button
                                                    type="button"
                                                    className="admin-view-details-btn"
                                                    onClick={() => handleViewBooking(booking)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>

                                        <div className="admin-booking-details">
                                            <div>
                                                <span>Customer</span>
                                                <strong>{booking.customer?.name || "N/A"}</strong>
                                            </div>

                                            <div>
                                                <span>Customer Email</span>
                                                <strong>{booking.customer?.email || "N/A"}</strong>
                                            </div>

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
                                                <strong>{booking.organizer?.email || "N/A"}</strong>
                                            </div>

                                            <div>
                                                <span>Event Date</span>
                                                <strong>{formatDate(booking.eventDate)}</strong>
                                            </div>

                                            <div>
                                                <span>Event Location</span>
                                                <strong>{booking.eventLocation || "N/A"}</strong>
                                            </div>

                                            <div>
                                                <span>Guest Count</span>
                                                <strong>{booking.guestCount || 0}</strong>
                                            </div>

                                            <div>
                                                <span>Package</span>
                                                <strong>{booking.packageName || "Standard"}</strong>
                                            </div>

                                            <div>
                                                <span>Package Price</span>
                                                <strong>
                                                    ₹{booking.packagePrice?.toLocaleString("en-IN") || 0}
                                                </strong>
                                            </div>
                                        </div>

                                        {booking.message && (
                                            <div className="admin-booking-message">
                                                <strong>Customer Message</strong>
                                                <p>{booking.message}</p>
                                            </div>
                                        )}

                                        <div className="admin-booking-history">
                                            <h4>Booking Status History</h4>

                                            {booking.statusHistory?.length > 0 ? (
                                                <div className="admin-history-list">
                                                    {booking.statusHistory.map((history, index) => (
                                                        <div
                                                            className="admin-history-item"
                                                            key={history._id || index}
                                                        >
                                                            <span className="admin-history-dot"></span>
                                                            <div>
                                                                <strong>{history.status}</strong>
                                                                <p>{history.note || "Status updated."}</p>
                                                                <small>{formatDate(history.changedAt)}</small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="admin-history-empty">
                                                    No status history available.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </section>
                )}

                {/* BOOKING DETAILS MODAL */}
                {selectedBooking && (
                    <div
                        className="admin-modal-overlay"
                        onClick={() => setSelectedBooking(null)}
                    >
                        <div
                            className="admin-booking-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="admin-modal-header">
                                <div>
                                    <h2>Booking Details</h2>
                                    <p>Complete booking information</p>
                                </div>

                                <button
                                    type="button"
                                    className="admin-modal-close"
                                    onClick={() => setSelectedBooking(null)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="admin-modal-content">

                                <div className="admin-modal-status">
                                    <span>Booking Status</span>
                                    <span className={`status-badge ${selectedBooking.status}`}>
                                        {selectedBooking.status}
                                    </span>
                                </div>

                                {/* ADMIN STATUS UPDATE */}
                                <div className="admin-modal-section admin-status-update-section">
                                    <h3>Update Booking Status</h3>

                                    <label htmlFor="admin-booking-status">
                                        Select New Status
                                    </label>

                                    <select
                                        id="admin-booking-status"
                                        className="admin-status-select"
                                        value={bookingStatusDraft}
                                        onChange={(e) =>
                                            setBookingStatusDraft(e.target.value)
                                        }
                                        disabled={bookingActionLoading}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>

                                    <label htmlFor="admin-booking-note">
                                        Status Update Note
                                    </label>

                                    <textarea
                                        id="admin-booking-note"
                                        className="admin-status-note"
                                        rows="3"
                                        placeholder="Enter a reason or note for this status change..."
                                        value={bookingStatusNote}
                                        onChange={(e) =>
                                            setBookingStatusNote(e.target.value)
                                        }
                                        disabled={bookingActionLoading}
                                    />

                                    <button
                                        type="button"
                                        className="admin-update-status-btn"
                                        onClick={handleAdminBookingStatus}
                                        disabled={
                                            bookingActionLoading ||
                                            bookingStatusDraft === selectedBooking.status
                                        }
                                    >
                                        {bookingActionLoading
                                            ? "Updating..."
                                            : "Update Booking Status"}
                                    </button>
                                </div>

                                <div className="admin-modal-section">
                                    <h3>Booking Information</h3>

                                    <div className="admin-modal-grid">
                                        <div>
                                            <span>Booking ID</span>
                                            <strong>{selectedBooking._id}</strong>
                                        </div>

                                        <div>
                                            <span>Event Name</span>
                                            <strong>{selectedBooking.event?.title || "N/A"}</strong>
                                        </div>

                                        <div>
                                            <span>Event Date</span>
                                            <strong>{formatDate(selectedBooking.eventDate)}</strong>
                                        </div>

                                        <div>
                                            <span>Event Location</span>
                                            <strong>{selectedBooking.eventLocation || "N/A"}</strong>
                                        </div>

                                        <div>
                                            <span>Guest Count</span>
                                            <strong>{selectedBooking.guestCount || 0}</strong>
                                        </div>

                                        <div>
                                            <span>Package</span>
                                            <strong>{selectedBooking.packageName || "Standard"}</strong>
                                        </div>

                                        <div>
                                            <span>Package Price</span>
                                            <strong>
                                                ₹{Number(selectedBooking.packagePrice || 0).toLocaleString("en-IN")}
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="admin-modal-section">
                                    <h3>Customer Information</h3>

                                    <div className="admin-modal-grid">
                                        <div>
                                            <span>Customer Name</span>
                                            <strong>{selectedBooking.customer?.name || "N/A"}</strong>
                                        </div>

                                        <div>
                                            <span>Customer Email</span>
                                            <strong>{selectedBooking.customer?.email || "N/A"}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="admin-modal-section">
                                    <h3>Organizer Information</h3>

                                    <div className="admin-modal-grid">
                                        <div>
                                            <span>Organization</span>
                                            <strong>
                                                {selectedBooking.organizer?.organizationName ||
                                                    selectedBooking.organizer?.name ||
                                                    "N/A"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Organizer Email</span>
                                            <strong>{selectedBooking.organizer?.email || "N/A"}</strong>
                                        </div>
                                    </div>
                                </div>

                                {selectedBooking.message && (
                                    <div className="admin-modal-section">
                                        <h3>Customer Message</h3>
                                        <p className="admin-modal-message">
                                            {selectedBooking.message}
                                        </p>
                                    </div>
                                )}

                                <div className="admin-modal-section">
                                    <h3>Booking Status History</h3>

                                    {selectedBooking.statusHistory?.length > 0 ? (
                                        <div className="admin-history-list">
                                            {selectedBooking.statusHistory.map((history, index) => (
                                                <div
                                                    className="admin-history-item"
                                                    key={history._id || index}
                                                >
                                                    <span className="admin-history-dot"></span>
                                                    <div>
                                                        <strong>{history.status}</strong>
                                                        <p>{history.note || "Status updated."}</p>
                                                        <small>{formatDate(history.changedAt)}</small>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="admin-history-empty">
                                            No status history available.
                                        </p>
                                    )}
                                </div>

                            </div>

                            <div className="admin-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setSelectedBooking(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

export default AdminDashboard;
