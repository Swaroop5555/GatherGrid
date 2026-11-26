
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    Building2,
    ShieldCheck,
    MapPin,
    ArrowRight,
    CalendarDays,
    IndianRupee
} from "lucide-react";

import API from "../services/api";
import "./OrganizersDetails.css";

function OrganizersDetails() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const categoryId = searchParams.get("category") || "";

    const [organizer, setOrganizer] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrganizerDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get(
                    `/organizers/${id}`,
                    {
                        params: categoryId
                            ? { category: categoryId }
                            : {}
                    }
                );

                setOrganizer(response.data.organizer);
                setEvents(response.data.events || []);

            } catch (err) {
                console.error("Organizer details error:", err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load organizer details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizerDetails();
    }, [id, categoryId]);

    const handleEventClick = (eventId) => {
        navigate(`/events/${eventId}`);
    };

    if (loading) {
        return (
            <main className="organizer-details-page">
                <div className="organizer-details-message">
                    Loading organizer details...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="organizer-details-page">
                <div className="organizer-details-message error">
                    {error}
                </div>
            </main>
        );
    }

    if (!organizer) {
        return null;
    }

    return (
        <main className="organizer-details-page">

            <section className="organizer-profile-section">

                <div className="organizer-profile-image">
                    {organizer.profileImage ? (
                        <img
                            src={organizer.profileImage}
                            alt={organizer.organizationName || "Organizer"}
                        />
                    ) : (
                        <Building2 size={65} />
                    )}
                </div>

                <div className="organizer-profile-info">

                    <span className="organizer-profile-badge">
                        <ShieldCheck size={15} />
                        VERIFIED ORGANIZER
                    </span>

                    <h1>
                        {organizer.organizationName ||
                            organizer.name ||
                            "Event Organizer"}
                    </h1>

                    <p>
                        Professional event planning and management
                        services for your special occasions.
                    </p>

                    {organizer.organizationName && (
                        <div className="organizer-profile-meta">
                            <Building2 size={17} />
                            <span>{organizer.organizationName}</span>
                        </div>
                    )}

                    <div className="organizer-profile-meta">
                        <ShieldCheck size={17} />
                        <span>Admin Approved</span>
                    </div>

                </div>

            </section>

            <section className="organizer-events-section">

                <div className="organizer-events-heading">
                    <div>
                        <span className="organizer-section-label">
                            OUR SERVICES
                        </span>

                        <h2>Event Packages</h2>

                        <p>
                            Explore the event services offered by this organizer.
                        </p>
                    </div>

                    <span className="organizer-events-count">
                        {events.length} Listings
                    </span>
                </div>

                {events.length === 0 ? (

                    <div className="organizer-details-message">
                        <CalendarDays size={42} />
                        <h3>No event packages available</h3>
                        <p>
                            This organizer has not added any listings
                            for the selected category yet.
                        </p>
                    </div>

                ) : (

                    <div className="organizer-events-grid">

                        {events.map((event) => (

                            <article
                                className="organizer-event-card"
                                key={event._id}
                            >

                                <div className="organizer-event-image">

                                    {event.image ? (
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                        />
                                    ) : (
                                        <div className="organizer-event-placeholder">
                                            <CalendarDays size={45} />
                                        </div>
                                    )}

                                    {event.category?.name && (
                                        <span className="organizer-event-category">
                                            {event.category.name}
                                        </span>
                                    )}

                                </div>

                                <div className="organizer-event-content">

                                    <h3>{event.title}</h3>

                                    <p>
                                        {event.shortDescription}
                                    </p>

                                    <div className="organizer-event-price">
                                        <span>Starting from</span>

                                        <strong>
                                            <IndianRupee size={17} />
                                            {Number(
                                                event.startingPrice || 0
                                            ).toLocaleString("en-IN")}
                                        </strong>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEventClick(event._id)
                                        }
                                    >
                                        View Details
                                        <ArrowRight size={17} />
                                    </button>

                                </div>

                            </article>

                        ))}

                    </div>

                )}

            </section>

        </main>
    );
}

export default OrganizersDetails;
