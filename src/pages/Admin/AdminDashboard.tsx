
import { useState, useEffect } from "react";
import { Users, BookOpen, UserCheck, BarChart3, Plus, Settings } from "lucide-react";
import { useAuth } from "../../Context/useAuth";
import { useTranslation } from 'react-i18next';
import api from "../../services/api";

interface AdminDashboardData {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalGroups: number;
  recentEnrollments: number;
  systemStats: {
    activeUsers: number;
    pendingAssignments: number;
    upcomingDeadlines: number;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [dashData, setDashData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const stored = localStorage.getItem("eduSyncUser");
        if (!stored) throw new Error("You are not logged in.");

        const { token } = JSON.parse(stored);
        if (!token) throw new Error("Missing authentication token.");

        const headers = { Authorization: `Bearer ${token}` };
        const response = await api.get<AdminDashboardData>(`/api/AdminDashboard`, { headers });
        setDashData(response.data);

      } catch (err: any) {
        console.error("Admin dashboard fetch error:", err);
        setError(err.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edusync-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-600 dark:text-red-400">
          <h2 className="text-xl font-semibold mb-2">Error Loading Admin Dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Students",
      value: dashData?.totalStudents?.toString() || "0",
      icon: <Users className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
      change: `+${dashData?.recentEnrollments || 0} this week`
    },
    {
      title: "Total Instructors", 
      value: dashData?.totalInstructors?.toString() || "0",
      icon: <UserCheck className="h-6 w-6" />,
      color: "from-green-500 to-green-600",
      change: "Active"
    },
    {
      title: "Total Courses",
      value: dashData?.totalCourses?.toString() || "0", 
      icon: <BookOpen className="h-6 w-6" />,
      color: "from-purple-500 to-purple-600",
      change: "Available"
    },
    {
      title: "Active Groups",
      value: dashData?.totalGroups?.toString() || "0",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "from-orange-500 to-orange-600",
      change: "Running"
    }
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "Add, edit, or remove students and instructors",
      icon: <Users className="h-8 w-8" />,
      color: "bg-blue-500",
      action: () => {/* Navigate to user management */}
    },
    {
      title: "Manage Courses",
      description: "Create and organize course templates",
      icon: <BookOpen className="h-8 w-8" />,
      color: "bg-green-500", 
      action: () => {/* Navigate to course management */}
    },
    {
      title: "Manage Groups",
      description: "Create groups and assign instructors",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "bg-purple-500",
      action: () => {/* Navigate to group management */}
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings",
      icon: <Settings className="h-8 w-8" />,
      color: "bg-orange-500",
      action: () => {/* Navigate to settings */}
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-edusync-primary via-edusync-secondary to-edusync-accent p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 animate-fade-in">
            Admin Dashboard 👨‍💼
          </h1>
          <p className="text-xl opacity-90 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Manage your educational platform with comprehensive administrative tools
          </p>
        </div>
        <div className="absolute top-0 right-0 translate-x-12 -translate-y-12">
          <div className="w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white transform transition-transform duration-200 group-hover:scale-110`}>
                {stat.icon}
              </div>
              <span className="text-sm font-medium text-edusync-success">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
          <Plus className="h-6 w-6 text-edusync-primary" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={action.title}
              onClick={action.action}
              className="group p-6 bg-gray-50 dark:bg-gray-700/50 hover:bg-gradient-to-r hover:from-edusync-primary/10 hover:to-edusync-accent/10 rounded-xl transition-all duration-200 transform hover:scale-105 animate-fade-in text-left"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {dashData?.recentEnrollments || 0} new student enrollments this week
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {dashData?.systemStats?.activeUsers || 0} active users today
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {dashData?.systemStats?.pendingAssignments || 0} pending assignments
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Response Time</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">< 200ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {dashData?.systemStats?.activeUsers || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
