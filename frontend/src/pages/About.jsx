
import React from "react";
import {
    CalendarDays,
    Users,
    Sparkles,
    
} from "lucide-react";

import "./About.css";

function About() {
    return (
        <div className="about-page">

            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-hero-content">
                    <span className="about-tag">ABOUT GATHERGRID</span>

                    <h1>
                        Bringing People Together,
                        <span> Creating Memories.</span>
                    </h1>

                    <p>
                        Every celebration deserves to be special.
                        We make finding the right event organizers
                        simple, convenient, and memorable.
                    </p>
                </div>
            </section>

            {/* Project Overview */}
            <section className="about-overview">
                <div className="about-section-heading">
                    <span>WHO WE ARE</span>
                    <h2>Discover GatherGrid</h2>
                </div>

                <div className="about-overview-card">
                    <p>
                        GatherGrid is an event booking platform that connects
                        customers with professional event organizers.
                        From weddings and birthdays to anniversaries and
                        special celebrations, users can explore event services,
                        compare packages, and submit booking requests in one place.
                        Our goal is to make event planning easier, more organized,
                        and stress-free.
                    </p>
                </div>
            </section>

            {/* What We Offer */}
            <section className="about-features">
                <div className="about-section-heading">
                    <span>WHAT WE OFFER</span>
                    <h2>Everything for Your Celebration</h2>
                    <p>
                        A simple platform designed to make every event easier to plan.
                    </p>
                </div>

                <div className="about-feature-grid">

                    <div className="about-feature-card">
                        <div className="about-feature-icon">
                            <CalendarDays size={28} />
                        </div>
                        <h3>Explore Events</h3>
                        <p>
                            Discover organizers and services for different
                            types of celebrations.
                        </p>
                    </div>

                    <div className="about-feature-card">
                        <div className="about-feature-icon">
                            <Users size={28} />
                        </div>
                        <h3>Connect with Organizers</h3>
                        <p>
                            Explore organizer profiles, services, and packages
                            before making a booking request.
                        </p>
                    </div>

                    <div className="about-feature-card">
                        <div className="about-feature-icon">
                            <Sparkles size={28} />
                        </div>
                        <h3>Create Memories</h3>
                        <p>
                            Plan your special occasions with a more convenient
                            and organized booking experience.
                        </p>
                    </div>

                </div>
            </section>

            {/* Closing Section */}
            <section className="about-closing">
                <h2>Let's Make Every Moment Special.</h2>
                <p>
                    Your celebrations matter. Let GatherGrid help you
                    bring your ideas to life.
                </p>
            </section>

        </div>
    );
}

export default About;
