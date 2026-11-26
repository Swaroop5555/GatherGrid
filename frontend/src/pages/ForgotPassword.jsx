
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./ForgotPassword.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);

            const response = await API.post(
                "/auth/forgot-password",
                { email: email.trim() }
            );

            setMessage(response.data.message);

            navigate("/reset-password", {
                state: { email: email.trim() }
            });

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
        <div className="forgot-container">
            <div className="forgot-card">
                <h1>Forgot Password?</h1>

                <p>
                    Enter your registered email address.
                    We will send you an OTP to reset your password.
                </p>

                {error && <div className="forgot-error">{error}</div>}
                {message && <div className="forgot-success">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <label>Email Address</label>

                    <input
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                </form>

                <p className="forgot-back">
                    Remember your password?{" "}
                    <span onClick={() => navigate("/login")}>
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
