import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useUser } from "../context/UserContext";

const Unauthorized = () => {
    const navigate = useNavigate();
    const { role } = useUser();

    const roleMessages = {
        admin: "You are logged in as an admin. Please switch to a user account to access this page.",
        user: "You are logged in as a regular user. You may not have permission to access this resource.",
        guest: "Guests have limited access. Please log in to continue.",
    };

    const containerStyle = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f9fafb, #dbeafe)",
        padding: "20px",
        animation: "fadeIn 0.6s ease-out",
    };

    const cardStyle = {
        textAlign: "center",
        backgroundColor: "#fff",
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        padding: "40px 50px",
        maxWidth: "500px",
        width: "100%",
        border: "1px solid #f3f4f6",
    };

    const headingStyle = {
        fontSize: "28px",
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: "10px",
    };

    const textStyle = {
        color: "#4b5563",
        marginBottom: "25px",
        fontSize: "16px",
        lineHeight: "1.6",
    };

    const buttonContainer = {
        display: "flex",
        justifyContent: "center",
        gap: "16px",
        flexWrap: "wrap",
    };

    const buttonBase = {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontWeight: "500",
        padding: "10px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        border: "none",
        transition: "all 0.2s ease",
    };

    const backButton = {
        ...buttonBase,
        backgroundColor: "#e5e7eb",
        color: "#374151",
    };

    const homeButton = {
        ...buttonBase,
        backgroundColor: "#2563eb",
        color: "white",
    };

    const footerStyle = {
        marginTop: "30px",
        fontSize: "14px",
        color: "#6b7280",
        textAlign: "center",
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                    <ShieldAlert size={64} color="#ef4444" />
                </div>

                <h1 style={headingStyle}>Access Denied</h1>
                <p style={textStyle}>
                    {roleMessages[role] || "You don't have permission to view this page."}
                </p>

                <div style={buttonContainer}>
                    <button
                        style={backButton}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d1d5db")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} /> Go Back
                    </button>

                    <button
                        style={homeButton}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                        onClick={() => navigate("/")}
                    >
                        <Home size={18} /> Home
                    </button>
                </div>
            </div>

            <p style={footerStyle}>
                If you believe this is a mistake, please contact your administrator.
            </p>
        </div>
    );
};

export default Unauthorized;
