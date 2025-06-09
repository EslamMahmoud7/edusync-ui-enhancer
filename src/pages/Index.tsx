
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      switch (user.role) {
        case 0: 
        case 1:
          navigate("/student-dashboard", { replace: true });
          break;
        case 2:
          navigate("/admin-dashboard", { replace: true });
          break;
        case 3:
          navigate("/instructor-dashboard", { replace: true });
          break;
        default:
          navigate("/student-dashboard", { replace: true });
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
