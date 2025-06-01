
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case 1: // Student
          navigate("/student-dashboard", { replace: true });
          break;
        case 2: // Admin
          navigate("/admin-dashboard", { replace: true });
          break;
        case 3: // Instructor
          navigate("/instructor-dashboard", { replace: true });
          break;
        default:
          navigate("/student-dashboard", { replace: true }); // Default fallback
      }
    }
  }, [user, isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edusync-primary"></div>
      </div>
    );
  }

  // This should rarely be shown as users will be redirected
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Redirecting to your dashboard...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-edusync-primary mx-auto"></div>
      </div>
    </div>
  );
};

export default Index;
