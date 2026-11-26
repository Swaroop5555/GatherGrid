
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Search,
    CalendarDays,
    ArrowRight
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

import "./Events.css";

function Events() {

    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const { user, isAuthenticated } = useAuth();

    useEffect(() => {

        const fetchCategories = async () => {

            try {
                setLoading(true);
                setError("");

                const response = await API.get("/categories");

                setCategories(response.data.data || []);

            } catch (err) {

                console.error("Category loading error:", err);
                setError("Unable to load event categories. Please try again.");

            } finally {

                setLoading(false);

            }
        };

        fetchCategories();

    }, []);

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleCategoryClick = (categoryId) => {

        const destination = `/organizers?category=${categoryId}`;

        // If not logged in, redirect to Customer Login
        if (!isAuthenticated || !user) {
            navigate("/login?role=customer", {
                state: {
                    from: destination
                }
            });

            return;
        }

        // Only customers can explore organizers
        if (user.role !== "customer") {
            navigate("/login?role=customer", {
                state: {
                    from: destination
                }
            });

            return;
        }

        // Customer is already logged in
        navigate(destination);

    };

    return (

        <main className="events-page">

            <section className="events-header">

                <span className="events-badge">
                    <CalendarDays size={15} />
                    DISCOVER EXPERIENCES
                </span>

                <h1>
                    Find Your Perfect
                    <span> Event</span>
                </h1>

                <p>
                    From weddings to birthday celebrations,
                    choose your occasion and discover professional
                    event organizers on GatherGrid.
                </p>

            </section>

            <section className="events-controls">

                <div className="event-search">

                    <Search size={20} />

                    <input
                        type="text"
                        placeholder="Search event categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

            </section>

            <section className="events-list-section">

                <div className="events-list-heading">

                    <div>
                        <h2>Explore Event Categories</h2>

                        <p>
                            Choose an event category to find organizers.
                        </p>
                    </div>

                </div>

                {loading ? (

                    <div className="events-message">
                        Loading event categories...
                    </div>

                ) : error ? (

                    <div className="events-message error">
                        {error}
                    </div>

                ) : filteredCategories.length === 0 ? (

                    <div className="events-message">
                        <h3>No categories found</h3>
                        <p>Try searching for another category.</p>
                    </div>

                ) : (

                    <div className="event-categories-grid">

                        {filteredCategories.map((category) => (

                            <article
                                className="event-category-card"
                                key={category._id}
                                onClick={() => handleCategoryClick(category._id)}
                            >

                                <div className="event-category-icon">
                                    <CalendarDays size={28} />
                                </div>

                                <h3>{category.name}</h3>

                                <p>
                                    Explore professional organizers
                                    for your {category.name.toLowerCase()} event.
                                </p>

                                <button
                                    type="button"
                                    className="event-category-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCategoryClick(category._id);
                                    }}
                                >
                                    Explore Organizers
                                    <ArrowRight size={17} />
                                </button>

                            </article>

                        ))}

                    </div>

                )}

            </section>

        </main>

    );

}

export default Events;
