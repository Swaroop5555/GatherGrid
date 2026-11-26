
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    Search,
    Building2,
    ArrowRight,
    Users,
    ShieldCheck
} from "lucide-react";

import API from "../services/api";

import "./Organizers.css";

function Organizers() {

    const [organizers, setOrganizers] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const selectedCategoryId = searchParams.get("category") || "";

    const selectedCategory = categories.find(
        (category) => category._id === selectedCategoryId
    );

    useEffect(() => {

        const fetchData = async () => {

            try {

                setLoading(true);
                setError("");

                const [organizerResponse, categoryResponse] =
                    await Promise.all([
                        API.get("/organizers"),
                        API.get("/categories")
                    ]);

                setOrganizers(
                    organizerResponse.data.organizers || []
                );

                setCategories(
                    categoryResponse.data.data || []
                );

            } catch (err) {

                console.error("Organizer loading error:", err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load organizers. Please try again."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchData();

    }, []);

    const filteredOrganizers = organizers.filter((organizer) => {

        const organizationName =
            organizer.organizationName || "";

        const organizerName =
            organizer.name || "";

        const searchValue = search.toLowerCase();

        return (
            organizationName.toLowerCase().includes(searchValue) ||
            organizerName.toLowerCase().includes(searchValue)
        );

    });

    const handleOrganizerClick = (organizerId) => {

        navigate(
            `/organizers/${organizerId}?category=${selectedCategoryId}`
        );

    };

    return (

        <main className="organizers-page">

            {/* PAGE HEADER */}

            <section className="organizers-header">

                <span className="organizers-badge">
                    <Users size={16} />
                    VERIFIED EVENT PROFESSIONALS
                </span>

                <h1>
                    Find Your Perfect
                    <span> Organizer</span>
                </h1>

                <p>
                    Explore professional event organizers and find
                    the right team to make your special occasion memorable.
                </p>

                {selectedCategory && (
                    <div className="selected-organizer-category">
                        Selected Event:
                        <strong>{selectedCategory.name}</strong>
                    </div>
                )}

            </section>


            {/* SEARCH SECTION */}

            <section className="organizers-controls">

                <div className="organizer-search">

                    <Search size={20} />

                    <input
                        type="text"
                        placeholder="Search organizers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

            </section>


            {/* ORGANIZER LIST */}

            <section className="organizers-list-section">

                <div className="organizers-list-heading">

                    <div>
                        <h2>Our Event Organizers</h2>

                        <p>
                            {loading
                                ? "Loading organizers..."
                                : `${filteredOrganizers.length} approved organizer(s) found`}
                        </p>
                    </div>

                </div>


                {loading ? (

                    <div className="organizers-message">
                        Loading professional organizers...
                    </div>

                ) : error ? (

                    <div className="organizers-message error">
                        {error}
                    </div>

                ) : filteredOrganizers.length === 0 ? (

                    <div className="organizers-message">

                        <Building2 size={40} />

                        <h3>No organizers found</h3>

                        <p>
                            Try another search or check back later.
                        </p>

                    </div>

                ) : (

                    <div className="organizers-grid">

                        {filteredOrganizers.map((organizer) => (

                            <article
                                className="organizer-card"
                                key={organizer._id}
                            >

                                <div className="organizer-card-image">

                                    {organizer.profileImage ? (

                                        <img
                                            src={organizer.profileImage}
                                            alt={
                                                organizer.organizationName ||
                                                "Event Organizer"
                                            }
                                        />

                                    ) : (

                                        <div className="organizer-image-placeholder">
                                            <Building2 size={48} />
                                        </div>

                                    )}

                                    <span className="organizer-verified">
                                        <ShieldCheck size={14} />
                                        Verified
                                    </span>

                                </div>


                                <div className="organizer-card-content">

                                    <span className="organizer-label">
                                        EVENT ORGANIZER
                                    </span>

                                    <h3>
                                        {organizer.organizationName ||
                                            organizer.name ||
                                            "Event Organizer"}
                                    </h3>

                                    <p>
                                        Professional event planning
                                        and management services for
                                        your special occasions.
                                    </p>

                                    <div className="organizer-card-footer">

                                        <span>
                                            <ShieldCheck size={16} />
                                            Admin Approved
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleOrganizerClick(
                                                    organizer._id
                                                )
                                            }
                                        >
                                            View Organizer
                                            <ArrowRight size={16} />
                                        </button>

                                    </div>

                                </div>

                            </article>

                        ))}

                    </div>

                )}

            </section>

        </main>

    );

}

export default Organizers;
