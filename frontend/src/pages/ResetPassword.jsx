
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./ResetPassword.css";

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!email) {
        return (
            <div className="reset-container">
                <div className="reset-card">
                    <h2>Reset Password</h2>
                    <p>Please request a password reset OTP first.</p>
                    <button onClick={() => navigate("/forgot-password")}>
                        Go to Forgot Password
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await API.post(
                "/auth/reset-password",
                {
                    email,
                    otp,
                    newPassword,
                    confirmPassword
                }
            );

            setSuccess(response.data.message || "Password reset successful.");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to reset password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-card">
                <h1>Reset Password</h1>

                <p>
                    Enter the OTP sent to <strong>{email}</strong>
                    and create your new password.
                </p>

                {error && <div className="reset-error">{error}</div>}
                {success && <div className="reset-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <label>6-Digit OTP</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength="6"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        required
                    />

                    <label>New Password</label>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />

                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
