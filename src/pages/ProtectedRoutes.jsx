import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const ProtectedRoutes = ({ children, allowedRoles }) => {
    const { role } = useUser();

    // useEffect(() => {
    //     console.log("Role in ProtectedRoutes: ", role);
    // }, [role]);

    if (role === null) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoutes;