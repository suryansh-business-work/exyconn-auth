import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Typography, Container, Paper } from "@mui/material";
import { Block } from "@mui/icons-material";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "admin" | "god";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isGodAuthenticated, godUser } = useAuth();
  const location = useLocation();

  const isGodRoute = location.pathname.startsWith("/god");

  // For god routes, strictly check god authentication
  if (isGodRoute) {
    if (!isGodAuthenticated || !godUser || godUser.role !== "god") {
      return <Navigate to="/login/god" state={{ from: location }} replace />;
    }
  } else {
    // For user routes
    if (!isAuthenticated) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }

  // Check role requirements
  if (requiredRole) {
    const roleHierarchy: { [key: string]: number } = {
      user: 1,
      admin: 2,
      god: 3,
    };

    const userRoleLevel = roleHierarchy[godUser?.role || "user"];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      // User doesn't have sufficient permissions
      return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Block sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You don't have permission to access this page.
              {requiredRole && ` Required role: ${requiredRole.toUpperCase()}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your current role: {godUser?.role.toUpperCase()}
            </Typography>
          </Paper>
        </Container>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
