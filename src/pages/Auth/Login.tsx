
import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../Context/useAuth";
import { jwtDecode } from "jwt-decode";
import api from "../../services/api";
import type { UserDTO } from "../../Context/auth-types";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log('User already authenticated, redirecting...');
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('Login attempt for:', formData.email);

      // Client-side validation
      if (!formData.email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Call the login endpoint
      const { data } = await api.post<UserDTO>(
        "/api/StudentAccount/Login",
        { Email: formData.email, Password: formData.password }
      );

      console.log('Login response:', data);

      // Store user data in localStorage
      localStorage.setItem("eduSyncUser", JSON.stringify(data));
      
      // Update auth context
      const userObj = {
        id: data.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role,
        token: data.token,
      };

      console.log('Calling login with user object:', userObj);
      login(userObj);

      // Navigate will be handled by the useEffect above
      console.log('Login successful, navigation will be handled by useEffect');

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if auth is still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edusync-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-edusync-surface via-white to-edusync-surface/50 relative overflow-hidden">
      {/* Enhanced background pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,theme(colors.edusync.primary)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,theme(colors.edusync.accent)_0%,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Welcome Section */}
        <div className="hidden lg:flex lg:flex-1 relative">
          <div className="w-full bg-gradient-to-br from-edusync-primary via-edusync-secondary to-edusync-accent p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
            {/* Logo */}
            <div className="absolute top-8 left-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <img src="/favicon.ico" alt="EduSync Logo" className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">EduSync</span>
            </div>

            {/* Welcome Content */}
            <div className="max-w-lg text-center space-y-6 animate-fade-in">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Welcome to
                <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  EduSync LMS
                </span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Your gateway to group-based learning and knowledge sharing. Join thousands of students on their educational journey.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>

            {/* Decorative shapes */}
            <div className="absolute top-1/4 right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 lg:flex-none lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-glass border border-white/20 p-8 animate-scale-in">
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                <div className="w-10 h-10 bg-edusync-primary/10 rounded-xl flex items-center justify-center">
                  <img src="/favicon.ico" alt="EduSync Logo" className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-edusync-primary">EduSync</span>
              </div>

              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-edusync-primary to-edusync-accent bg-clip-text text-transparent mb-2">
                  Welcome Back!
                </h2>
                <p className="text-gray-600">Please enter your credentials to continue</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-edusync-primary/20 focus:border-edusync-primary transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-edusync-primary/20 focus:border-edusync-primary transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 text-edusync-primary bg-gray-100 border-gray-300 rounded focus:ring-edusync-primary/20 focus:ring-2"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-edusync-primary hover:text-edusync-secondary transition-colors duration-200"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button className="text-edusync-primary hover:text-edusync-secondary font-medium transition-colors duration-200">
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
