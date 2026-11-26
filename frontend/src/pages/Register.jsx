
import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import API from "../services/api";
import "./Register.css";

function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const initialRole = searchParams.get("role");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: initialRole === "organizer" ? "organizer" : "customer",
        organizationName: "",
        licenseNumber: "",
        officialEmail: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoleChange = (role) => {
        setFormData((prev) => ({
            ...prev,
            role
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        try {
            setLoading(true);

            const response = await API.post("/auth/send-otp", {
                email: formData.email,
                role: formData.role
            });

            if (response.data.success) {

                // Preserve registration details for OTP verification
                const registrationData = { ...formData };

                // Clear registration fields
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: registrationData.role,
                    organizationName: "",
                    licenseNumber: "",
                    officialEmail: ""
                });

                // Navigate to OTP verification
                navigate("/verify-otp", {
                    state: {
                        registrationData
                    }
                });
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to send OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-card">

                <div className="register-heading">
                    <span className="register-logo">GatherGrid</span>

                    <h1>Create Your Account</h1>

                    <p>
                        Join GatherGrid and make every event memorable.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    autoComplete="off"
                >

                    <label>Account Type</label>

                    <div className="role-options">

                        <button
                            type="button"
                            className={
                                formData.role === "customer"
                                    ? "role-option active"
                                    : "role-option"
                            }
                            onClick={() => handleRoleChange("customer")}
                        >
                            Customer
                        </button>

                        <button
                            type="button"
                            className={
                                formData.role === "organizer"
                                    ? "role-option active"
                                    : "role-option"
                            }
                            onClick={() => handleRoleChange("organizer")}
                        >
                            Organizer
                        </button>

                    </div>

                    <label>Full Name</label>

                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                    />

                    <label>Email Address</label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                    />

                    {formData.role === "organizer" && (
                        <div className="organizer-fields">

                            <h3>Organization Details</h3>

                            <label>Organization Name</label>

                            <input
                                type="text"
                                name="organizationName"
                                placeholder="Enter organization name"
                                value={formData.organizationName}
                                onChange={handleChange}
                                autoComplete="off"
                                required
                            />

                            <label>License Number</label>

                            <input
                                type="text"
                                name="licenseNumber"
                                placeholder="Enter license number"
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                autoComplete="off"
                                required
                            />

                            <label>Official Email</label>

                            <input
                                type="email"
                                name="officialEmail"
                                placeholder="Enter official email"
                                value={formData.officialEmail}
                                onChange={handleChange}
                                autoComplete="off"
                                required
                            />

                        </div>
                    )}

                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        minLength={8}
                        required
                    />

                    <label>Confirm Password</label>

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                    />

                    {error && (
                        <p className="register-error">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="register-submit"
                        disabled={loading}
                    >
                        {loading ? "Sending OTP..." : "Send Verification OTP"}
                    </button>

                </form>

                <p className="register-login">
                    Already have an account?
                    {" "}
                    <Link
                        to={
                            formData.role === "organizer"
                                ? "/login?role=organizer"
                                : "/login"
                        }
                    >
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Register;
