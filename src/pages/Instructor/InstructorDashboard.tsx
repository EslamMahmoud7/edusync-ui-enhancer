import { useState, useEffect } from "react";
import { BookOpen, Users, ClipboardList, Calendar, Plus } from "lucide-react";
import { useAuth } from "../../Context/useAuth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface InstructorDashboardCountsDTO {
  totalGroups: number;
  totalStudents: number;
  activeAssignments: number;
  todaysClasses: number;
}

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [counts, setCounts] = useState<InstructorDashboardCountsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const stored = localStorage.getItem("eduSyncUser");
        if (!stored) throw new Error("You are not logged in.");

        const { id: instructorId, token } = JSON.parse(stored);


        const headers = { Authorization: `Bearer ${token}` };
        const response = await api.get<InstructorDashboardCountsDTO>(
          `/api/InstructorDashboard/${instructorId}/counts`,
          { headers }
        );
        setCounts(response.data);
      } catch (err: any) {
        console.error("Instructor dashboard counts fetch error:", err);
        setError(err.message || "Failed to load dashboard counts");
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
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
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Instructor Dashboard
          </h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const {
    totalGroups = 0,
    totalStudents = 0,
    activeAssignments = 0,
    todaysClasses = 0,
  } = counts || {};

  const stats = [
    {
      title: "My Groups",
      value: totalGroups.toString(),
      icon: <Users className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
      change: "Active",
    },
    {
      title: "Total Students",
      value: totalStudents.toString(),
      icon: <BookOpen className="h-6 w-6" />,
      color: "from-green-500 to-green-600",
      change: "Enrolled",
    },
    {
      title: "Active Assignments",
      value: activeAssignments.toString(),
      icon: <ClipboardList className="h-6 w-6" />,
      color: "from-orange-500 to-orange-600",
      change: "Pending",
    },
    {
      title: "Today's Classes",
      value: todaysClasses.toString(),
      icon: <Calendar className="h-6 w-6" />,
      color: "from-purple-500 to-purple-600",
      change: "Scheduled",
    },
  ];

  const quickActions = [
    {
      title: "Create Assignment",
      description: "Add new assignments for your groups",
      icon: <Plus className="h-8 w-8" />,
      color: "bg-blue-500",
      action: () => {
        navigate("/instructor/assignments")
      },
    },
    {
      title: "Manage Groups",
      description: "View and manage your assigned groups",
      icon: <Users className="h-8 w-8" />,
      color: "bg-green-500",
      action: () => {
        navigate("/instructor/groups")
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-edusync-primary via-edusync-secondary to-edusync-accent p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 animate-fade-in">
            Welcome, {user?.name || "Instructor"}! 👨‍🏫
          </h1>
          <p
            className="text-xl opacity-90 max-w-2xl animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Manage your groups, assignments, and track student progress
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
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white transform transition-transform duration-200 group-hover:scale-110`}
              >
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={action.title}
              onClick={action.action}
              className="group p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gradient-to-r hover:from-edusync-primary/10 hover:to-edusync-accent/10 rounded-xl transition-all duration-200 transform hover:scale-105 animate-fade-in text-left"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
              >
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1 text-sm">
                {action.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
