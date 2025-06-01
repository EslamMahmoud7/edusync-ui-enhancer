
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<0 | 1 | 2 | 3>; // 0: Student (legacy), 1: Student, 2: Admin, 3: Instructor
  redirectTo?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  redirectTo = "/login" 
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edusync-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role 0 to role 1 for checking
  const normalizedRole = user.role === 0 ? 1 : user.role;
  
  if (!allowedRoles.includes(user.role) && !allowedRoles.includes(normalizedRole)) {
    // Redirect to appropriate dashboard based on user's role
    const dashboardRoutes = {
      0: "/student-dashboard", // Legacy student role
      1: "/student-dashboard",
      2: "/admin-dashboard", 
      3: "/instructor-dashboard"
    };
    return <Navigate to={dashboardRoutes[user.role] || "/login"} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
