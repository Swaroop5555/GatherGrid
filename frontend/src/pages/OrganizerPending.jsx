
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./OrganizerPending.css";

function OrganizerPending() {
    const { user, logout } = useAuth();

    return (
        <div className="pending-page">

            <div className="pending-card">

                <div className="pending-icon">
                    ⏳
                </div>

                <span className="pending-label">
                    Approval Pending
                </span>

                <h1>Thank You for Joining GatherGrid!</h1>

                <p>
                    Hello {user?.organizationName || "Organizer"},
                    your organizer account has been registered successfully.
                </p>

                <p>
                    Our admin team is reviewing your organization details.
                    You will be able to access organizer features after
                    your account is approved.
                </p>

                <div className="pending-status">
                    <span>Account Status</span>
                    <strong>Pending Approval</strong>
                </div>

                <p className="pending-email">
                    Registered email: {user?.email}
                </p>

                <div className="pending-actions">
                    <Link to="/" className="pending-home">
                        Back to Home
                    </Link>

                    <button
                        onClick={logout}
                        className="pending-logout"
                    >
                        Logout
                    </button>
                </div>

            </div>

        </div>
    );
}

export default OrganizerPending;
