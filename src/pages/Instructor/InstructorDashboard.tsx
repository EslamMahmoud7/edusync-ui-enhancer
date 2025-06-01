
import { useState, useEffect } from "react";
import { BookOpen, Users, ClipboardList, Calendar, BarChart3, Plus } from "lucide-react";
import { useAuth } from "../../Context/useAuth";
import { useTranslation } from 'react-i18next';
import api from "../../services/api";
import type { GroupDTO } from "../../Context/auth-types";

interface InstructorDashboardData {
  fullName: string;
  totalGroups: number;
  totalStudents: number;
  activeAssignments: number;
  upcomingClasses: Array<{
    groupLabel: string;
    courseTitle: string;
    startTime: string;
    location: string;
  }>;
  groups: GroupDTO[];
}

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [dashData, setDashData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstructorData() {
      try {
        const stored = localStorage.getItem("eduSyncUser");
        if (!stored) throw new Error("You are not logged in.");

        const { id: instructorId, token } = JSON.parse(stored);
        if (!instructorId || !token) throw new Error("Missing user ID or token.");

        const headers = { Authorization: `Bearer ${token}` };
        const response = await api.get<InstructorDashboardData>(`/api/InstructorDashboard/${instructorId}`, { headers });
        setDashData(response.data);

      } catch (err: any) {
        console.error("Instructor dashboard fetch error:", err);
        setError(err.message || "Failed to load instructor dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchInstructorData();
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
          <h2 className="text-xl font-semibold mb-2">Error Loading Instructor Dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "My Groups",
      value: dashData?.totalGroups?.toString() || "0",
      icon: <Users className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
      change: "Active"
    },
    {
      title: "Total Students",
      value: dashData?.totalStudents?.toString() || "0",
      icon: <BookOpen className="h-6 w-6" />,
      color: "from-green-500 to-green-600",
      change: "Enrolled"
    },
    {
      title: "Active Assignments",
      value: dashData?.activeAssignments?.toString() || "0",
      icon: <ClipboardList className="h-6 w-6" />,
      color: "from-orange-500 to-orange-600",
      change: "Pending"
    },
    {
      title: "Today's Classes",
      value: dashData?.upcomingClasses?.length?.toString() || "0",
      icon: <Calendar className="h-6 w-6" />,
      color: "from-purple-500 to-purple-600",
      change: "Scheduled"
    }
  ];

  const quickActions = [
    {
      title: "Create Assignment",
      description: "Add new assignments for your groups",
      icon: <Plus className="h-8 w-8" />,
      color: "bg-blue-500",
      action: () => {/* Navigate to assignment creation */}
    },
    {
      title: "Manage Groups",
      description: "View and manage your assigned groups",
      icon: <Users className="h-8 w-8" />,
      color: "bg-green-500",
      action: () => {/* Navigate to group management */}
    },
    {
      title: "Grade Submissions", 
      description: "Review and grade student submissions",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "bg-purple-500",
      action: () => {/* Navigate to grading */}
    },
    {
      title: "View Schedule",
      description: "Check your teaching schedule",
      icon: <Calendar className="h-8 w-8" />,
      color: "bg-orange-500",
      action: () => {/* Navigate to schedule */}
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-edusync-primary via-edusync-secondary to-edusync-accent p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 animate-fade-in">
            Welcome, {dashData?.fullName || user?.name || 'Instructor'}! 👨‍🏫
          </h1>
          <p className="text-xl opacity-90 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
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

      {/* Quick Actions and Today's Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
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

        {/* Today's Classes */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <Calendar className="h-6 w-6 text-edusync-accent" />
            Today's Classes
          </h2>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {dashData?.upcomingClasses?.length ? (
              dashData.upcomingClasses.map((classItem, index) => (
                <div
                  key={index}
                  className="group p-4 bg-gradient-to-r from-edusync-primary/5 to-edusync-accent/5 hover:from-edusync-primary/10 hover:to-edusync-accent/10 rounded-xl border border-edusync-primary/20 transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {classItem.courseTitle}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Group: {classItem.groupLabel}
                      </p>
                      <p className="text-sm text-edusync-primary font-medium">
                        {classItem.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {new Date(classItem.startTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">No classes scheduled for today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Groups */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
          <Users className="h-6 w-6 text-edusync-primary" />
          My Groups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashData?.groups?.map((group, index) => (
            <div
              key={group.id}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gradient-to-r hover:from-edusync-primary/10 hover:to-edusync-accent/10 rounded-xl transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                {group.courseTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Group: {group.label}
              </p>
              <p className="text-sm text-edusync-primary">
                {group.numberOfStudents} students
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {group.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
