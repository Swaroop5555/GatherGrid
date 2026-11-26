
import { useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    const initialRole = searchParams.get("role");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: ["customer", "organizer", "admin"].includes(initialRole)
            ? initialRole
            : "customer"
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

        try {
            setLoading(true);

            const response = await API.post("/auth/login", formData);

            if (response.data.success) {
                login(response.data);

                const user = response.data.user;

                // Clear email and password after successful login
                setFormData((prev) => ({
                    ...prev,
                    email: "",
                    password: ""
                }));

                if (user.role === "admin") {
                    navigate("/admin-dashboard", {
                        replace: true
                    });

                } else if (
                    user.role === "organizer" &&
                    !user.isApproved
                ) {
                    navigate("/organizer-pending", {
                        replace: true
                    });

                } else if (user.role === "organizer") {
                    navigate("/organizer-dashboard", {
                        replace: true
                    });

                } else if (user.role === "customer") {
                    navigate(location.state?.from || "/events", {
                        replace: true
                    });
                }
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login failed. Please check your credentials."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-heading">
                    <span className="login-logo">GatherGrid</span>

                    <h1>Welcome Back</h1>

                    <p>
                        Login to continue planning your events.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    autoComplete="off"
                >

                    {/* Hidden fields to discourage browser autofill */}
                    <input
                        type="text"
                        name="fake-username"
                        autoComplete="username"
                        tabIndex="-1"
                        aria-hidden="true"
                        className="login-autofill-hidden"
                    />

                    <input
                        type="password"
                        name="fake-password"
                        autoComplete="new-password"
                        tabIndex="-1"
                        aria-hidden="true"
                        className="login-autofill-hidden"
                    />

                    <label>Login As</label>

                    <div className="login-role-options">

                        <button
                            type="button"
                            className={
                                formData.role === "customer"
                                    ? "login-role active"
                                    : "login-role"
                            }
                            onClick={() => handleRoleChange("customer")}
                        >
                            Customer
                        </button>

                        <button
                            type="button"
                            className={
                                formData.role === "organizer"
                                    ? "login-role active"
                                    : "login-role"
                            }
                            onClick={() => handleRoleChange("organizer")}
                        >
                            Organizer
                        </button>

                        <button
                            type="button"
                            className={
                                formData.role === "admin"
                                    ? "login-role active"
                                    : "login-role"
                            }
                            onClick={() => handleRoleChange("admin")}
                        >
                            Admin
                        </button>

                    </div>

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

                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                    />

                    <div className="login-forgot">
                        <Link to="/forgot-password">
                            Forgot Password?
                        </Link>
                    </div>

                    {error && (
                        <p className="login-error">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="login-submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {formData.role !== "admin" && (
                    <p className="login-register">
                        Don't have an account?
                        {" "}
                        <Link
                            to={
                                formData.role === "organizer"
                                    ? "/register?role=organizer"
                                    : "/register"
                            }
                        >
                            Create Account
                        </Link>
                    </p>
                )}

            </div>

        </div>
    );
}

export default Login;
