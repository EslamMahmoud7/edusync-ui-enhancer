
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  console.log('PrivateRoute: Auth state', { isAuthenticated, loading });

  if (loading) {
    console.log('PrivateRoute: Still loading auth state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edusync-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('PrivateRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('PrivateRoute: User authenticated, rendering protected content');
  return <Outlet />;
};

export default PrivateRoute;
