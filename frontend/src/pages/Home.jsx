
import {
    ArrowRight,
    CalendarCheck
} from "lucide-react";

import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
    return (
        <div className="home-page">

            <section className="hero">

                <div className="hero-content">

                    <div className="hero-badge">
                        <span className="badge-dot"></span>
                        Seamless Event Discovery & Booking
                    </div>

                    <h1>
                        Connecting Moments,
                        <span> Creating Memories</span>
                    </h1>

                    <p className="hero-description">
                        Discover trusted event organizers, explore
                        personalized services, and plan unforgettable
                        celebrations. GatherGrid brings everything
                        together in one simple platform.
                    </p>

                    <div className="hero-buttons">

                        <Link to="/events" className="primary-btn">
                            Explore Events
                            <ArrowRight size={19} />
                        </Link>

                        <Link to="/contact" className="secondary-btn">
                            <CalendarCheck size={18} />
                            Contact Us
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Home;
