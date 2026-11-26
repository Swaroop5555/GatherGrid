
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./VerifyOTP.css";

// Mask email: show first 2 characters and hide the remaining username
const maskEmail = (email) => {
    if (!email) return "";

    const [username, domain] = email.split("@");

    if (!domain) return email;

    const visiblePart = username.slice(0, 2);
    const maskedPart = "*".repeat(
        Math.max(username.length - 2, 0)
    );

    return `${visiblePart}${maskedPart}@${domain}`;
};

function VerifyOTP() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const registrationData = location.state?.registrationData;

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!registrationData) {
        return (
            <div className="verify-page">
                <div className="verify-card">
                    <h2>Registration details not found</h2>
                    <p>Please start registration again.</p>
                    <Link to="/register">Go to Register</Link>
                </div>
            </div>
        );
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");

        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        try {
            setLoading(true);

            const response = await API.post("/auth/register", {
                ...registrationData,
                otp
            });

            if (response.data.success) {
                login(response.data);

                if (
                    response.data.user.role === "organizer" &&
                    !response.data.user.isApproved
                ) {
                    navigate("/organizer-pending", {
                        replace: true
                    });
                } else {
                    navigate("/", { replace: true });
                }
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "OTP verification failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-page">

            <div className="verify-card">

                <div className="verify-icon">✉</div>

                <h1>Verify Your Email</h1>

                <p>
                    We sent a verification code to
                    <strong> {maskEmail(registrationData.email)}</strong>
                </p>

                <form onSubmit={handleVerify}>

                    <label>Enter 6-Digit OTP</label>

                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={otp}
                        onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        required
                    />

                    {error && (
                        <p className="verify-error">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Verify & Register"}
                    </button>

                </form>

                <Link to="/register" className="verify-back">
                    Back to Registration
                </Link>

            </div>

        </div>
    );
}

export default VerifyOTP;
