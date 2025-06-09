import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../Context/useAuth";
import api from "../../services/api";
import type { UserDTO } from "../../Context/auth-types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (formData: LoginFormValues) => {
    try {
      const { data } = await api.post<UserDTO>(
        "/api/StudentAccount/Login",
        { Email: formData.email, Password: formData.password }
      );
      
      localStorage.setItem("eduSyncUser", JSON.stringify(data));
      
      login({
        id: data.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role,
        token: data.token,
      });

      toast.success("Login Successful!", {
        description: `Welcome back, ${data.firstName}!`,
      });

      const userRole = data.role === 0 ? 1 : data.role;
      
      switch (userRole) {
        case 1:
          navigate("/student-dashboard");
          break;
        case 2:
          navigate("/admin-dashboard");
          break;
        case 3:
          navigate("/instructor-dashboard");
          break;
        default:
          navigate("/student-dashboard");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials and try again.";
      toast.error("Login Failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-edusync-surface via-white to-edusync-surface/50 relative overflow-hidden">
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,theme(colors.edusync.primary)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,theme(colors.edusync.accent)_0%,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        <div className="hidden lg:flex lg:flex-1 relative">
          <div className="w-full bg-gradient-to-br from-edusync-primary via-edusync-secondary to-edusync-accent p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute top-8 left-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <img src="/favicon.ico" alt="EduSync Logo" className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">EduSync</span>
            </div>
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
            <div className="absolute top-1/4 right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        <div className="flex-1 lg:flex-none lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-glass border border-white/20 p-8 animate-scale-in">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                <div className="w-10 h-10 bg-edusync-primary/10 rounded-xl flex items-center justify-center">
                  <img src="/favicon.ico" alt="EduSync Logo" className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-edusync-primary">EduSync</span>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-edusync-primary to-edusync-accent bg-clip-text text-transparent mb-2">
                  Welcome Back!
                </h2>
                <p className="text-gray-600">Please enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      placeholder="Enter your email"
                      {...register("email")}
                      className={`w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-200/50 focus:ring-edusync-primary/20 focus:border-edusync-primary'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

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
                      placeholder="Enter your password"
                      {...register("password")}
                      className={`w-full pl-12 pr-12 py-3 bg-white/80 backdrop-blur-sm border rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.password ? 'border-red-400 focus:ring-red-200' : 'border-gray-200/50 focus:ring-edusync-primary/20 focus:border-edusync-primary'
                      }`}
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
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("rememberMe")}
                      className="w-4 h-4 text-edusync-primary bg-gray-100 border-gray-300 rounded focus:ring-edusync-primary/20 focus:ring-2"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;