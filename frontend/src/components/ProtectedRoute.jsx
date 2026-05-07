import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem('user');

    if (!user) {
        // Redirect to auth page if not logged in
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;
