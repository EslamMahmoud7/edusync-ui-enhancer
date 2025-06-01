
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    console.log('Index: Auth state changed', { user: user ? { id: user.id, role: user.role } : null, isAuthenticated, loading });
    
    if (!loading) {
      if (isAuthenticated && user) {
        console.log('Index: User authenticated, redirecting based on role:', user.role);
        // Redirect to appropriate dashboard based on role
        switch (user.role) {
          case 0: // Legacy student role
          case 1: // Student
            console.log('Index: Redirecting to student dashboard');
            navigate("/student-dashboard", { replace: true });
            break;
          case 2: // Admin
            console.log('Index: Redirecting to admin dashboard');
            navigate("/admin-dashboard", { replace: true });
            break;
          case 3: // Instructor
            console.log('Index: Redirecting to instructor dashboard');
            navigate("/instructor-dashboard", { replace: true });
            break;
          default:
            console.log('Index: Unknown role, redirecting to student dashboard');
            navigate("/student-dashboard", { replace: true }); // Default fallback
        }
      } else {
        console.log('Index: User not authenticated, redirecting to login');
        navigate("/login", { replace: true });
      }
    }
  }, [user, isAuthenticated, loading, navigate]);

  if (loading) {
    console.log('Index: Still loading auth state');
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
