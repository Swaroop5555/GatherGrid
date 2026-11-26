
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock,
    Utensils,
    Camera,
    Music,
    Palette,
    Building2,
    UserRound
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

import "./EventDetails.css";

function EventDetails() {
    const { id } = useParams();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedPackage, setSelectedPackage] = useState(null);

    const [bookingForm, setBookingForm] = useState({
        eventDate: "",
        eventLocation: "",
        guestCount: "",
        message: ""
    });

    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [bookingSuccess, setBookingSuccess] = useState("");
    const [createdBooking, setCreatedBooking] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get(`/events/${id}`);
                setEvent(response.data.data);

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load event details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    const getServiceIcon = (name = "") => {
        const value = name.toLowerCase();

        if (value.includes("food") || value.includes("catering")) {
            return <Utensils />;
        }

        if (value.includes("photo") || value.includes("video")) {
            return <Camera />;
        }

        if (value.includes("music") || value.includes("entertainment")) {
            return <Music />;
        }

        if (
            value.includes("decoration") ||
            value.includes("stage") ||
            value.includes("mandap")
        ) {
            return <Palette />;
        }

        if (value.includes("venue")) {
            return <Building2 />;
        }

        return <CheckCircle2 />;
    };

    const handlePackageSelect = (item) => {
        setSelectedPackage(item);
        setBookingError("");
        setBookingSuccess("");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setBookingForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setBookingError("Please log in as a customer to book this event.");
            return;
        }

        if (user.role !== "customer") {
            setBookingError("Only customer accounts can book events.");
            return;
        }

        if (!selectedPackage) {
            setBookingError("Please select a package first.");
            return;
        }

        try {
            setBookingLoading(true);
            setBookingError("");
            setBookingSuccess("");

            const payload = {
                eventId: event._id,
                eventDate: bookingForm.eventDate,
                eventLocation: bookingForm.eventLocation,
                guestCount: Number(bookingForm.guestCount),
                packageId: selectedPackage._id,
                message: bookingForm.message
            };

            const response = await API.post("/bookings", payload);

                setCreatedBooking(response.data.data);

                setBookingSuccess(
                    response.data.message ||
                    "Booking request submitted successfully!"
            );

            setBookingForm({
                eventDate: "",
                eventLocation: "",
                guestCount: "",
                message: ""
            });

            setSelectedPackage(null);

        } catch (err) {
            setBookingError(
                err.response?.data?.message ||
                "Unable to submit your booking request."
            );
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="details-message">
                Loading event details...
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="details-message">
                <h2>{error || "Event not found"}</h2>
                <Link to="/events">Back to Events</Link>
            </div>
        );
    }

    return (
        <main className="event-details-page">
            <div className="details-container">

                <Link to="/events" className="back-events">
                    <ArrowLeft size={17} />
                    Back to Events
                </Link>

                {/* EVENT HERO */}
                <section className="event-detail-hero">

                    <div className="detail-image">
                        {event.image ? (
                            <img src={event.image} alt={event.title} />
                        ) : (
                            <div className="detail-image-placeholder">
                                <CalendarDays size={55} />
                            </div>
                        )}
                    </div>

                    <div className="detail-content">

                        <span className="detail-category">
                            {event.category?.name}
                        </span>

                        <h1>{event.title}</h1>

                        <p>{event.shortDescription}</p>

                        <div className="detail-meta">

                            <span>
                                <Clock size={17} />
                                {event.estimatedDuration || "Flexible Duration"}
                            </span>

                            <span>
                                <CalendarDays size={17} />
                                Customized Planning
                            </span>

                        </div>

                        <div className="detail-price">
                            <small>Packages starting from</small>

                            <strong>
                                ₹{Number(event.startingPrice || 0).toLocaleString("en-IN")}
                            </strong>
                        </div>

                        {event.organizer && (
                            <div className="event-organizer-info">
                                <Building2 size={18} />

                                <span>
                                    Organized by:{" "}
                                    <strong>
                                        {event.organizer.organizationName ||
                                            event.organizer.name ||
                                            "Event Organizer"}
                                    </strong>
                                </span>
                            </div>
                        )}

                    </div>

                </section>

                {/* DESCRIPTION */}
                <section className="detail-section">

                    <h2>About This Event</h2>

                    <p className="detail-description">
                        {event.description}
                    </p>

                </section>

                {/* SERVICES */}
                <section className="detail-section">

                    <div className="detail-section-heading">
                        <span>WHAT WE OFFER</span>
                        <h2>Event Services & Requirements</h2>
                        <p>Explore the services available for this event.</p>
                    </div>

                    <div className="services-grid">

                        {event.services?.filter(
                            service => service.isAvailable !== false
                        ).map((service, index) => (

                            <article
                                className="service-card"
                                key={service._id || index}
                            >

                                <div className="service-icon">
                                    {getServiceIcon(service.name)}
                                </div>

                                <h3>{service.name}</h3>

                                <p>{service.description}</p>

                                <div className="service-options">

                                    <strong>Available options</strong>

                                    {service.options?.map((option, i) => (
                                        <span key={i}>
                                            <CheckCircle2 size={14} />
                                            {option}
                                        </span>
                                    ))}

                                </div>

                                <div className="service-price">
                                    Starting from ₹
                                    {Number(service.startingPrice || 0).toLocaleString("en-IN")}
                                </div>

                            </article>

                        ))}

                    </div>

                </section>

                {/* PACKAGES */}
                <section className="detail-section">

                    <div className="detail-section-heading">
                        <span>CHOOSE YOUR EXPERIENCE</span>
                        <h2>Available Event Packages</h2>
                        <p>Select a package that suits your event needs.</p>
                    </div>

                    <div className="packages-grid">

                        {event.packages?.map((item, index) => (

                            <article
                                className={`package-card ${
                                    index === 1 ? "popular-package" : ""
                                } ${
                                    selectedPackage?._id === item._id
                                        ? "selected-package"
                                        : ""
                                }`}
                                key={item._id || index}
                            >

                                {index === 1 && (
                                    <span className="popular-label">
                                        Popular
                                    </span>
                                )}

                                <h3>{item.name}</h3>

                                <p>{item.description}</p>

                                <div className="package-price">
                                    ₹{Number(item.price || 0).toLocaleString("en-IN")}
                                </div>

                                <div className="package-features">

                                    {item.features?.map((feature, i) => (
                                        <span key={i}>
                                            <CheckCircle2 size={16} />
                                            {feature}
                                        </span>
                                    ))}

                                </div>

                                <button
                                    type="button"
                                    className="package-button"
                                    onClick={() => handlePackageSelect(item)}
                                >
                                    {selectedPackage?._id === item._id
                                        ? "Selected"
                                        : "Choose Package"}

                                    <ArrowRight size={16} />
                                </button>

                            </article>

                        ))}

                    </div>

                </section>

                {/* BOOKING FORM */}
                {selectedPackage && (

                    <section className="detail-section customer-booking-section">

                        <div className="detail-section-heading">
                            <span>BOOK YOUR EVENT</span>

                            <h2>Complete Your Booking Request</h2>

                            <p>
                                Selected Package:{" "}
                                <strong>{selectedPackage.name}</strong>
                                {" "} — ₹
                                {Number(selectedPackage.price || 0).toLocaleString("en-IN")}
                            </p>
                        </div>

                        {bookingError && (
                            <div className="booking-form-error">
                                {bookingError}
                            </div>
                        )}

                        <form
                            className="customer-booking-form"
                            onSubmit={handleBookingSubmit}
                        >

                            <div className="booking-form-group">
                                <label>Event Date</label>

                                <input
                                    type="date"
                                    name="eventDate"
                                    min={new Date().toLocaleDateString("en-CA")}
                                    value={bookingForm.eventDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="booking-form-group">
                                <label>Event Location</label>

                                <input
                                    type="text"
                                    name="eventLocation"
                                    placeholder="Enter event location"
                                    value={bookingForm.eventLocation}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="booking-form-group">
                                <label>Expected Guest Count</label>

                                <input
                                    type="number"
                                    name="guestCount"
                                    placeholder="Enter number of guests"
                                    min="1"
                                    value={bookingForm.guestCount}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="booking-form-group">
                                <label>Additional Message</label>

                                <textarea
                                    name="message"
                                    placeholder="Tell us about your event requirements"
                                    rows="4"
                                    value={bookingForm.message}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <button
                                type="submit"
                                className="book-organization-btn"
                                disabled={bookingLoading}
                            >
                                {bookingLoading
                                    ? "Submitting..."
                                    : "Submit Booking Request"}
                            </button>

                        </form>

                    </section>

                )}

                {/* BOOKING SUCCESS */}
                
{/* BOOKING SUCCESS */}
{bookingSuccess && createdBooking && (
    <section className="booking-confirmation">

        <div className="booking-confirmation-icon">
            <CheckCircle2 size={35} />
        </div>

        <h2>Booking Request Submitted!</h2>

        <p>{bookingSuccess}</p>

        <div className="booking-confirmation-details">

            <div>
                <span>Booking ID</span>
                <strong>{createdBooking._id}</strong>
            </div>

            <div>
                <span>Event</span>
                <strong>{event.title}</strong>
            </div>

            <div>
                <span>Package</span>
                <strong>{createdBooking.packageName || "Standard"}</strong>
            </div>

            <div>
                <span>Event Date</span>
                <strong>
                    {new Date(createdBooking.eventDate).toLocaleDateString("en-IN")}
                </strong>
            </div>

            <div>
                <span>Total Price</span>
                <strong>
                    ₹{Number(createdBooking.packagePrice || 0).toLocaleString("en-IN")}
                </strong>
            </div>

            <div>
                <span>Booking Status</span>
                <strong className="confirmation-pending">
                    {createdBooking.status?.toUpperCase()}
                </strong>
            </div>

        </div>

        <Link
            to="/customer-dashboard"
            className="booking-confirmation-btn"
        >
            View My Bookings
            <ArrowRight size={18} />
        </Link>

    </section>
)}


                {/* BOOKING BANNER */}
                <section className="event-booking-banner">

                    <div>
                        <h2>Ready to Plan Your Event?</h2>

                        <p>
                            Select a package above and submit your booking request.
                        </p>
                    </div>

                
                    <Link
                        to={`/organizers?category=${event.category?._id || ""}`}
                        className="book-organization-btn"
                    >
                        Find Organizer
                        <ArrowRight size={18} />
                    </Link>


                </section>

            </div>
        </main>
    );
}

export default EventDetails;
