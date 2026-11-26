
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Grid2X2,
    CalendarCheck,
    Menu,
    X,
    LogOut
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        closeMenu();
        navigate("/login");
    };

    // Get dashboard route based on user role
    const getDashboardRoute = () => {
        if (user?.role === "customer") {
            return "/customer-dashboard";
        }

        if (user?.role === "organizer") {
            return user?.isApproved
                ? "/organizer-dashboard"
                : "/organizer-pending";
        }

        return "/";
    };

    return (
        <nav className="navbar">

            <Link to="/" className="brand" onClick={closeMenu}>
                <span className="brand-icon">
                    <Grid2X2 size={25} />
                </span>
                <span>GatherGrid</span>
            </Link>

            <div className={`nav-links ${menuOpen ? "show-menu" : ""}`}>
                <Link to="/" onClick={closeMenu}>Home</Link>
                <Link to="/events" onClick={closeMenu}>Events</Link>

                <Link
                    to="/login?role=organizer"
                    onClick={closeMenu}
                >
                    Organizers
                </Link>

                <Link to="/contact" onClick={closeMenu}>Contact</Link>
                <Link to="/about" onClick={closeMenu}>About</Link>
            </div>

            <div className={`nav-actions ${menuOpen ? "show-actions" : ""}`}>

                {!isAuthenticated ? (
                    <>
                        <Link
                            to="/login"
                            className="login-btn"
                            onClick={closeMenu}
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="register-btn"
                            onClick={closeMenu}
                        >
                            Register
                        </Link>
                    </>
                ) : (
                    <>
                        <span className="user-role">
                            {user?.role === "organizer"
                                ? "Organizer"
                                : user?.role === "admin"
                                    ? "Admin"
                                    : "Customer"}
                        </span>

                        {/* Customer and Organizer Dashboard */}
                        {(user?.role === "customer" ||
                            user?.role === "organizer") && (
                            <Link
                                to={getDashboardRoute()}
                                className="pending-btn"
                                onClick={closeMenu}
                            >
                                Dashboard
                            </Link>
                        )}

                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </>
                )}

                <Link
                    to="/events"
                    className="book-btn"
                    onClick={closeMenu}
                >
                    <CalendarCheck size={16} />
                    Book Event
                </Link>

            </div>

            <button
                className="mobile-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen(!menuOpen)}
            >
                {menuOpen ? <X size={25} /> : <Menu size={25} />}
            </button>

        </nav>
    );
}

export default Navbar;
