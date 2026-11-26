
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Mail,
    Send,
    MessageCircle,
    ArrowRight,
    ShieldCheck
} from "lucide-react";
import API from "../services/api";
import "./Contact.css";

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSuccess("");
        setError("");

        try {
            const response = await API.post("/contact", formData);

            setSuccess(response.data.message);

            setFormData({
                name: "",
                email: "",
                subject: "",
                message: ""
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to send your message. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page">

            {/* HERO SECTION */}
            <section className="contact-hero">
                <div className="contact-hero-content">

                    <div className="contact-badge">
                        <span className="contact-badge-dot"></span>
                        WE ARE HERE TO HELP
                    </div>

                    <h1>
                        Let's Start a
                        <span> Conversation</span>
                    </h1>

                    <p>
                        Have questions about GatherGrid? Need help with
                        bookings or organizing an event? Our team is here
                        to help you make every celebration special.
                    </p>

                    <a href="#contact-content" className="contact-hero-btn">
                        Contact Us <ArrowRight size={18} />
                    </a>

                </div>
            </section>

            {/* CONTACT SECTION */}
            <section className="contact-content" id="contact-content">

                <div className="contact-heading">
                    <span>GET IN TOUCH</span>
                    <h2>We'd Love to Hear From You</h2>
                    <p>
                        Reach out to our team. We are happy to assist you
                        with your questions and event-related needs.
                    </p>
                </div>

                <div className="contact-layout">

                    {/* ADMIN CONTACT */}
                    <div className="contact-info">

                        <div className="contact-info-card">

                            <div className="contact-icon">
                                <Mail size={28} />
                            </div>

                            <h3>GatherGrid Admin</h3>

                            <p>
                                For general enquiries, technical support,
                                booking assistance, and other questions,
                                feel free to contact our administration team.
                            </p>

                            <div className="contact-detail">
                                <span>Email Address</span>

                                <a href="mailto:gathergrid@gmail.com">
                                    <Mail size={17} />
                                    gathergrid@gmail.com
                                </a>
                            </div>

                            <a
                                href="mailto:gathergrid@gmail.com"
                                className="contact-email-btn"
                            >
                                Send an Email <ArrowRight size={17} />
                            </a>

                        </div>

                        <div className="contact-note">
                            <ShieldCheck size={22} />

                            <div>
                                <h4>We're Here to Help</h4>
                                <p>
                                    Your questions and feedback are important
                                    to us. Get in touch with the GatherGrid team.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* CONTACT FORM */}
                    <div className="contact-form-card">

                        <div className="contact-form-heading">
                            <div className="contact-form-icon">
                                <MessageCircle size={23} />
                            </div>

                            <div>
                                <h3>Send Us a Message</h3>
                                <p>Fill in the details below to contact us.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="contact-input-row">

                                <div className="contact-form-group">
                                    <label>Your Name</label>

                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="contact-form-group">
                                    <label>Email Address</label>

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                            </div>

                            <div className="contact-form-group">
                                <label>Subject</label>

                                <input
                                    type="text"
                                    name="subject"
                                    placeholder="What is this regarding?"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="contact-form-group">
                                <label>Your Message</label>

                                <textarea
                                    name="message"
                                    placeholder="Write your message here..."
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            {success && (
                                <div className="contact-success-message">
                                    {success}
                                </div>
                            )}

                            {error && (
                                <div className="contact-error-message">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="contact-submit-btn"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Message"}
                                {!loading && <Send size={17} />}
                            </button>

                            <p className="contact-form-note">
                                Your message will be sent directly to
                                the GatherGrid administration team.
                            </p>

                        </form>

                    </div>

                </div>

                <div className="contact-back-home">
                    <Link to="/">
                        Back to Home <ArrowRight size={17} />
                    </Link>
                </div>

            </section>

        </div>
    );
}

export default Contact;
