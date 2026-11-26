
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Organizers from "./pages/Organizers";

import { AuthProvider } from "./context/AuthContext";

import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import Login from "./pages/Login";
import OrganizerPending from "./pages/OrganizerPending";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute";

import CustomerDashboard from "./pages/CustomerDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import OrganizerEvents from "./pages/OrganizerEvents";
import OrganizersDetails from "./pages/OrganizersDetails";
import Contact from "./pages/Contact";
import About from "./pages/About";
import "./index.css";

function ComingSoon() {
    return (
        <div className="coming-soon">
            <h1>Page Under Development</h1>
            <p>This GatherGrid module will be available soon.</p>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />

                {/* Customer Event Routes */}
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/organizers" element={<Organizers />} />

                <Route path="/organizations" element={<ComingSoon />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />

                <Route
                    path="/organizer-pending"
                    element={<OrganizerPending />}
                />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Customer Routes */}
                <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
                    <Route
                        path="/customer-dashboard"
                        element={<CustomerDashboard />}
                    />
                </Route>

                {/* Approved Organizer Routes */}
                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={["organizer"]}
                            requireApprovedOrganizer={true}
                        />
                    }
                >
                    <Route
                        path="/organizer-dashboard"
                        element={<OrganizerDashboard />}
                    />

                    <Route
                        path="/organizer-events"
                        element={<OrganizerEvents />}
                    />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                    <Route
                        path="/admin-dashboard"
                        element={<AdminDashboard />}
                    />
                </Route>
                <Route
                    path="/organizers/:id"
                    element={<OrganizersDetails />}
                />
                
                {/* Fallback Route */}
                <Route path="*" element={<ComingSoon />} />
            </Routes>

            <Footer />
        </AuthProvider>
    );
}

export default App;
