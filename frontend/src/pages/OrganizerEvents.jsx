
import React, { useEffect, useRef, useState } from "react";
import {
    PlusCircle,
    CalendarDays,
    RefreshCw,
    Upload,
    Image as ImageIcon,
    Pencil,
    Trash2,
    X
} from "lucide-react";

import API from "../services/api";
import "./OrganizerEvents.css";

function OrganizerEvents() {
    const [categories, setCategories] = useState([]);
    const [events, setEvents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingEventId, setUploadingEventId] = useState(null);
    const [deletingEventId, setDeletingEventId] = useState(null);

    const [selectedImages, setSelectedImages] = useState({});
    const [editingEventId, setEditingEventId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const formSectionRef = useRef(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const initialForm = {
        title: "",
        category: "",
        shortDescription: "",
        description: "",
        estimatedDuration: "",
        startingPrice: "",
        tags: "",
        serviceName: "",
        serviceDescription: "",
        serviceOptions: "",
        servicePrice: "",
        packageName: "",
        packageDescription: "",
        packagePrice: "",
        packageFeatures: ""
    };

    const [form, setForm] = useState(initialForm);

    // Fetch categories and organizer events
    const fetchPageData = async () => {
        try {
            setLoading(true);
            setError("");

            const [categoryResponse, eventResponse] = await Promise.all([
                API.get("/categories"),
                API.get("/events/my-events")
            ]);

            setCategories(categoryResponse.data.data || []);
            setEvents(eventResponse.data.data || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load categories or events."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPageData();
    }, []);

    // Scroll to the form after it opens
    useEffect(() => {
        if (showForm && formSectionRef.current) {
            formSectionRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }, [showForm]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Build event payload
    const buildPayload = () => {
        const editingEvent = events.find(
            (event) => event._id === editingEventId
        );

        const newService = {
            name: form.serviceName.trim(),
            description: form.serviceDescription.trim(),
            options: form.serviceOptions
                .split(",")
                .map((option) => option.trim())
                .filter(Boolean),
            startingPrice: Number(form.servicePrice),
            isAvailable: true
        };

        const newPackage = {
            name: form.packageName.trim(),
            description: form.packageDescription.trim(),
            price: Number(form.packagePrice),
            features: form.packageFeatures
                .split(",")
                .map((feature) => feature.trim())
                .filter(Boolean)
        };

        const services = editingEvent?.services?.length
            ? [newService, ...editingEvent.services.slice(1)]
            : [newService];

        const packages = editingEvent?.packages?.length
            ? [newPackage, ...editingEvent.packages.slice(1)]
            : [newPackage];

        return {
            title: form.title.trim(),
            category: form.category,
            shortDescription: form.shortDescription.trim(),
            description: form.description.trim(),
            estimatedDuration: form.estimatedDuration.trim(),
            startingPrice: Number(form.startingPrice),

            tags: form.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),

            services,
            packages
        };
    };

    // Create or update an event
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const payload = buildPayload();

            if (editingEventId) {
                await API.put(`/events/${editingEventId}`, payload);

                setSuccess("Event listing updated successfully!");
                setEditingEventId(null);

            } else {
                await API.post("/events", payload);

                setSuccess(
                    "Event created successfully! You can now upload its image below."
                );
            }

            setForm({ ...initialForm });
            setShowForm(false);

            await fetchPageData();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save event. Please check your details."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Load event details into the form
    const handleEditEvent = (event) => {
        if (!event.isActive) {
            setError("Inactive events cannot be edited.");
            return;
        }

        const service = event.services?.[0] || {};
        const eventPackage = event.packages?.[0] || {};

        setForm({
            title: event.title || "",
            category: event.category?._id || event.category || "",
            shortDescription: event.shortDescription || "",
            description: event.description || "",
            estimatedDuration: event.estimatedDuration || "",
            startingPrice: event.startingPrice ?? "",

            tags: (event.tags || []).join(", "),

            serviceName: service.name || "",
            serviceDescription: service.description || "",
            serviceOptions: (service.options || []).join(", "),
            servicePrice: service.startingPrice ?? "",

            packageName: eventPackage.name || "",
            packageDescription: eventPackage.description || "",
            packagePrice: eventPackage.price ?? "",
            packageFeatures: (eventPackage.features || []).join(", ")
        });

        setEditingEventId(event._id);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    // Open create event form
    const handleCreateEvent = () => {
        setEditingEventId(null);
        setForm({ ...initialForm });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    // Cancel create or edit form
    const handleCancelEdit = () => {
        setEditingEventId(null);
        setForm({ ...initialForm });
        setShowForm(false);
        setError("");
        setSuccess("");
    };

    // Delete an event
    const handleDeleteEvent = async (eventId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this event listing? It will no longer be visible to customers."
        );

        if (!confirmed) return;

        try {
            setDeletingEventId(eventId);
            setError("");
            setSuccess("");

            await API.delete(`/events/${eventId}`);

            setSuccess("Event listing deleted successfully!");

            if (editingEventId === eventId) {
                setEditingEventId(null);
                setForm({ ...initialForm });
                setShowForm(false);
            }

            await fetchPageData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete event. Please try again."
            );
        } finally {
            setDeletingEventId(null);
        }
    };

    // Select an image for an event
    const handleImageSelect = (eventId, file) => {
        if (!file) return;

        setError("");
        setSuccess("");

        setSelectedImages((prev) => ({
            ...prev,
            [eventId]: file
        }));
    };

    // Upload or replace an event image
    const handleUploadImage = async (eventId) => {
        const selectedFile = selectedImages[eventId];

        if (!selectedFile) {
            setError("Please select an image first.");
            return;
        }

        try {
            setUploadingEventId(eventId);
            setError("");
            setSuccess("");

            const formData = new FormData();
            formData.append("image", selectedFile);

            const response = await API.post(
                `/events/${eventId}/image`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            const uploadedImage = response.data.data.image;

            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event._id === eventId
                        ? { ...event, image: uploadedImage }
                        : event
                )
            );

            setSelectedImages((prev) => {
                const updated = { ...prev };
                delete updated[eventId];
                return updated;
            });

            setSuccess("Event image uploaded successfully!");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to upload image. Please try again."
            );
        } finally {
            setUploadingEventId(null);
        }
    };

    return (
        <div className="organizer-events-page">

            {/* Page Header */}
            <section className="organizer-events-header">

                <div>
                    <p className="organizer-events-label">
                        ORGANIZER WORKSPACE
                    </p>

                    <h1>My Events</h1>

                    <p>
                        Manage the event services offered by your organization.
                    </p>
                </div>

                <div className="organizer-events-header-actions">

                    <CalendarDays size={42} />

                    <button
                        type="button"
                        className="create-event-submit"
                        onClick={handleCreateEvent}
                    >
                        <PlusCircle size={18} />
                        Create New Event
                    </button>

                </div>

            </section>

            {/* Error and Success Messages */}
            {error && (
                <div className="organizer-event-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="organizer-event-success">
                    {success}
                </div>
            )}

            {/* Create / Edit Event Form */}
            {showForm && (
                <section
                    className="create-event-section"
                    ref={formSectionRef}
                >

                    <div className="create-event-heading">

                        {editingEventId ? (
                            <Pencil size={25} />
                        ) : (
                            <PlusCircle size={25} />
                        )}

                        <h2>
                            {editingEventId
                                ? "Edit Event Listing"
                                : "Create New Event"}
                        </h2>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <h3>Basic Information</h3>

                        <div className="organizer-event-form-grid">

                            <div className="organizer-event-field">
                                <label>Event Title *</label>

                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Example: Birthday Celebration Package"
                                    required
                                />
                            </div>

                            <div className="organizer-event-field">
                                <label>Event Category *</label>

                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select Category
                                    </option>

                                    {categories.map((category) => (
                                        <option
                                            key={category._id}
                                            value={category._id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="organizer-event-field full-width">
                                <label>Short Description *</label>

                                <input
                                    type="text"
                                    name="shortDescription"
                                    value={form.shortDescription}
                                    onChange={handleChange}
                                    placeholder="Write a short introduction"
                                    required
                                />
                            </div>

                            <div className="organizer-event-field full-width">
                                <label>Full Description *</label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Describe the event services you provide..."
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="organizer-event-field">
                                <label>Estimated Duration</label>

                                <input
                                    type="text"
                                    name="estimatedDuration"
                                    value={form.estimatedDuration}
                                    onChange={handleChange}
                                    placeholder="Example: 5 hours"
                                />
                            </div>

                            <div className="organizer-event-field">
                                <label>Starting Price (₹) *</label>

                                <input
                                    type="number"
                                    name="startingPrice"
                                    value={form.startingPrice}
                                    onChange={handleChange}
                                    placeholder="5000"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="organizer-event-field full-width">
                                <label>Tags</label>

                                <input
                                    type="text"
                                    name="tags"
                                    value={form.tags}
                                    onChange={handleChange}
                                    placeholder="birthday, decoration, party"
                                />

                                <small>
                                    Separate tags with commas.
                                </small>
                            </div>

                        </div>

                        <h3 className="organizer-form-subheading">
                            Service Information
                        </h3>

                        <div className="organizer-event-form-grid">

                            <div className="organizer-event-field">
                                <label>Service Name *</label>

                                <input
                                    type="text"
                                    name="serviceName"
                                    value={form.serviceName}
                                    onChange={handleChange}
                                    placeholder="Birthday Decoration"
                                    required
                                />
                            </div>

                            <div className="organizer-event-field">
                                <label>Service Starting Price (₹) *</label>

                                <input
                                    type="number"
                                    name="servicePrice"
                                    value={form.servicePrice}
                                    onChange={handleChange}
                                    placeholder="5000"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="organizer-event-field full-width">
                                <label>Service Description</label>

                                <textarea
                                    name="serviceDescription"
                                    value={form.serviceDescription}
                                    onChange={handleChange}
                                    placeholder="Describe this service..."
                                    rows="3"
                                />
                            </div>

                            <div className="organizer-event-field full-width">
                                <label>Service Options</label>

                                <input
                                    type="text"
                                    name="serviceOptions"
                                    value={form.serviceOptions}
                                    onChange={handleChange}
                                    placeholder="Balloon Decoration, Theme Decoration"
                                />

                                <small>
                                    Separate options with commas.
                                </small>
                            </div>

                        </div>

                        <h3 className="organizer-form-subheading">
                            Package Information
                        </h3>

                        <div className="organizer-event-form-grid">

                            <div className="organizer-event-field">
                                <label>Package Name *</label>

                                <input
                                    type="text"
                                    name="packageName"
                                    value={form.packageName}
                                    onChange={handleChange}
                                    placeholder="Premium Birthday Package"
                                    required
                                />
                            </div>

                            <div className="organizer-event-field">
                                <label>Package Price (₹) *</label>

                                <input
                                    type="number"
                                    name="packagePrice"
                                    value={form.packagePrice}
                                    onChange={handleChange}
                                    placeholder="15000"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="organizer-event-field full-width">
                                <label>Package Description</label>

                                <textarea
                                    name="packageDescription"
                                    value={form.packageDescription}
                                    onChange={handleChange}
                                    placeholder="Describe what this package includes..."
                                    rows="3"
                                />
                            </div>

                            <div className="organizer-event-field full-width">
                                <label>Package Features</label>

                                <input
                                    type="text"
                                    name="packageFeatures"
                                    value={form.packageFeatures}
                                    onChange={handleChange}
                                    placeholder="Stage Decoration, Photography, Catering"
                                />

                                <small>
                                    Separate features with commas.
                                </small>
                            </div>

                        </div>

                        {/* Form Buttons */}
                        <div className="organizer-event-form-actions">

                            <button
                                type="submit"
                                className="create-event-submit"
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Saving..."
                                    : editingEventId
                                        ? "Save Changes"
                                        : "Create Event"}
                            </button>

                            <button
                                type="button"
                                className="cancel-edit-button"
                                onClick={handleCancelEdit}
                                disabled={submitting}
                            >
                                <X size={17} />
                                {editingEventId
                                    ? "Cancel Edit"
                                    : "Cancel"}
                            </button>

                        </div>

                    </form>

                </section>
            )}

            {/* Organizer Event Listings */}
            <section className="my-events-section">

                <div className="my-events-heading">

                    <div>
                        <h2>My Event Listings</h2>

                        <p>
                            Events created by your organization.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="organizer-events-refresh"
                        onClick={fetchPageData}
                        disabled={loading}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                </div>

                {loading ? (
                    <p className="organizer-events-message">
                        Loading your events...
                    </p>
                ) : events.length === 0 ? (
                    <p className="organizer-events-message">
                        You haven't created any events yet.
                    </p>
                ) : (
                    <div className="organizer-event-list">

                        {events.map((event) => (
                            <div
                                className="organizer-event-card"
                                key={event._id}
                            >

                                {/* Event Image */}
                                <div className="organizer-event-image-section">

                                    {event.image ? (
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="organizer-event-image"
                                        />
                                    ) : (
                                        <div className="organizer-event-no-image">
                                            <ImageIcon size={38} />
                                            <span>
                                                No event image uploaded
                                            </span>
                                        </div>
                                    )}

                                    {event.isActive && (
                                        <div className="organizer-event-upload">

                                            <label>
                                                <Upload size={16} />
                                                Choose Image

                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={(e) =>
                                                        handleImageSelect(
                                                            event._id,
                                                            e.target.files[0]
                                                        )
                                                    }
                                                />
                                            </label>

                                            {selectedImages[event._id] && (
                                                <p className="selected-image-name">
                                                    {selectedImages[event._id].name}
                                                </p>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleUploadImage(event._id)
                                                }
                                                disabled={
                                                    !selectedImages[event._id] ||
                                                    uploadingEventId === event._id
                                                }
                                            >
                                                {uploadingEventId === event._id
                                                    ? "Uploading..."
                                                    : event.image
                                                        ? "Replace Image"
                                                        : "Upload Image"}
                                            </button>

                                        </div>
                                    )}

                                </div>

                                {/* Event Information */}
                                <div className="organizer-event-card-content">

                                    <div className="organizer-event-card-top">

                                        <h3>{event.title}</h3>

                                        <span className={
                                            event.isActive
                                                ? "event-active-status"
                                                : "event-inactive-status"
                                        }>
                                            {event.isActive ? "Active" : "Inactive"}
                                        </span>

                                    </div>

                                    <p className="organizer-event-category">
                                        {event.category?.name || "Event"}
                                    </p>

                                    <p>{event.shortDescription}</p>

                                    <strong>
                                        Starting from ₹
                                        {Number(
                                            event.startingPrice || 0
                                        ).toLocaleString("en-IN")}
                                    </strong>

                                    <p className="organizer-event-package-count">
                                        {event.packages?.length || 0} package(s)
                                        {" · "}
                                        {event.services?.length || 0} service(s)
                                    </p>

                                    {/* Edit and Delete Buttons */}
                                    {event.isActive && (
                                        <div className="organizer-event-actions">

                                            <button
                                                type="button"
                                                className="edit-event-button"
                                                onClick={() =>
                                                    handleEditEvent(event)
                                                }
                                            >
                                                <Pencil size={16} />
                                                Edit Event
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-event-button"
                                                onClick={() =>
                                                    handleDeleteEvent(event._id)
                                                }
                                                disabled={
                                                    deletingEventId === event._id
                                                }
                                            >
                                                <Trash2 size={16} />

                                                {deletingEventId === event._id
                                                    ? "Deleting..."
                                                    : "Delete Event"}
                                            </button>

                                        </div>
                                    )}

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </section>

        </div>
    );
}

export default OrganizerEvents;
