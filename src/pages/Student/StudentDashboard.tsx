
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Clock,
  Award,
  NotebookPen,
  Megaphone,
  TrendingUp,
  Calendar,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface ClassDTO {
  time: string;
  subject: string;
  doctor: string;
}

interface AchievementDTO {
  title: string;
  description: string;
}

interface AssignmentDTO {
  title: string;
  due: string;
}

interface AnnouncementDTO {
  title: string;
  date: string;
}

interface DashboardDTO {
  fullName: string;
  gpa: number;
  totalCourses: number;
  pendingAssignments: number;
  todaysClasses: ClassDTO[];
  achievements: AchievementDTO[];
  upcomingAssignments: AssignmentDTO[];
  announcements: AnnouncementDTO[];
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [dash, setDash] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const stored = localStorage.getItem("eduSyncUser");
        if (!stored) {
          throw new Error("You are not logged in.");
        }

        const { id: studentId, token } = JSON.parse(stored);
        if (!studentId || !token) {
          throw new Error("Missing user ID or token.");
        }

        const response = await api.get<DashboardDTO>(
          `/api/dashboard/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setDash(response.data);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-fade-in">
          <div className="w-12 h-12 border-4 border-edusync-primary/20 border-t-edusync-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!dash) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">No data available.</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Current GPA",
      value: dash.gpa.toFixed(2),
      icon: <GraduationCap className="w-6 h-6" />,
      color: "from-edusync-primary to-edusync-secondary",
      bgColor: "bg-edusync-primary/10",
    },
    {
      label: "Enrolled Courses",
      value: dash.totalCourses,
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-edusync-accent to-purple-600",
      bgColor: "bg-edusync-accent/10",
    },
    {
      label: "Pending Assignments",
      value: dash.pendingAssignments,
      icon: <FileText className="w-6 h-6" />,
      color: "from-edusync-warning to-yellow-600",
      bgColor: "bg-edusync-warning/10",
    },
    {
      label: "Today's Classes",
      value: dash.todaysClasses?.length || 0,
      icon: <Calendar className="w-6 h-6" />,
      color: "from-edusync-success to-green-600",
      bgColor: "bg-edusync-success/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-edusync-primary via-edusync-secondary to-edusync-accent rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {dash.fullName}! 👋
          </h1>
          <p className="text-white/90">Ready to continue your learning journey?</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft p-6 border border-gray-200/50 hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.icon}
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Classes */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft p-6 border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-edusync-primary/10 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-edusync-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Today's Classes</h2>
            </div>
            <button
              onClick={() => navigate("/schedule")}
              className="text-sm text-edusync-primary hover:text-edusync-secondary transition-colors duration-200"
            >
              View Schedule →
            </button>
          </div>
          
          <div className="space-y-3">
            {dash.todaysClasses?.length ? (
              dash.todaysClasses.map((cls, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-xl hover:bg-edusync-primary/5 transition-colors duration-200"
                >
                  <div className="w-12 h-12 bg-edusync-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-edusync-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{cls.subject}</p>
                    <p className="text-sm text-gray-600">{cls.doctor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-edusync-primary">{cls.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No classes scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft p-6 border border-gray-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Recent Achievements</h2>
          </div>
          
          <div className="space-y-4">
            {dash.achievements?.length ? (
              dash.achievements.map((ach, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 bg-yellow-50/80 rounded-xl"
                >
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center mt-1">
                    <Award className="w-4 h-4 text-yellow-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{ach.title}</p>
                    <p className="text-sm text-gray-600">{ach.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No achievements yet</p>
                <p className="text-sm text-gray-400">Keep working to unlock achievements!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Assignments */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft p-6 border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-edusync-warning/10 rounded-xl flex items-center justify-center">
                <NotebookPen className="w-5 h-5 text-edusync-warning" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Upcoming Assignments</h2>
            </div>
            <button
              onClick={() => navigate("/assignments")}
              className="text-sm text-edusync-primary hover:text-edusync-secondary transition-colors duration-200"
            >
              View All →
            </button>
          </div>
          
          <div className="space-y-3">
            {dash.upcomingAssignments?.length ? (
              dash.upcomingAssignments.map((a, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-orange-50/80 rounded-xl hover:bg-edusync-warning/5 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-edusync-warning/20 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-edusync-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{a.title}</p>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(a.due).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <NotebookPen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming assignments</p>
              </div>
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft p-6 border border-gray-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Recent Announcements</h2>
          </div>
          
          <div className="space-y-3">
            {dash.announcements?.length ? (
              dash.announcements.map((n, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-blue-50/80 rounded-xl hover:bg-edusync-primary/5 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                    <Megaphone className="w-4 h-4 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{n.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(n.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent announcements</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
