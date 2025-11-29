// src/components/PermissionRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface PermissionRouteProps {
  children: React.ReactNode;
  requiredResource: string; // Changed from requiredPath to requiredResource
  requiredAction?: string;
  fallbackPath?: string;
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  children,
  requiredResource,
  requiredAction = "view",
  fallbackPath = "/dashboard",
}) => {
  const { user, loading, hasPermission } = useAuth();

  // Show loading while checking auth and permissions
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required permission
  const hasAccess = hasPermission(requiredResource, requiredAction);
  
  if (!hasAccess) {
    // Redirect to dashboard or specified fallback path
    return <Navigate to={fallbackPath} replace />;
  }

  // User has permission - render children
  return <>{children}</>;
};