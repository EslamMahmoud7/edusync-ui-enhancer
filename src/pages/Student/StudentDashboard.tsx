import { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Clock3,
  Award,
  Calendar,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/useAuth";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import AnnouncementModal from "../../components/AnnouncementModal";
import api from "../../services/api";
import type { CourseDto, AssignmentDTO } from "../../Context/auth-types";

interface StudentDashboardData {
  fullName: string;
  totalCourses: number; // ← renamed from totalGroups
  gpa: number;
  pendingAssignments: number;
  todaysClasses: Array<{
    time: string;
    subject: string;
    location: string;
  }>;
  // we never actually use upcomingAssignments in this component, but it exists on the API:
  upcomingAssignments: Array<unknown>;
  announcements: Array<{
    // no `id` field in the API response
    title: string;
    message: string; // ← renamed from content
    date: string;
  }>;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [dashData, setDashData] = useState<StudentDashboardData | null>(null);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [assignments, setAssignments] = useState<AssignmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<{
    title: string;
    message: string;
    date: string;
  } | null>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
<<<<<<< Updated upstream
        const stored = localStorage.getItem("eduSyncUser");
        if (!stored) throw new Error("You are not logged in.");

        const { id: studentId, token } = JSON.parse(stored);
        if (!studentId) throw new Error("Missing user ID or token.");
=======
        // 1. Make sure `user` is loaded from context
        if (!user || !user.id || !user.token) {
          throw new Error("User is not logged in or missing credentials.");
        }
>>>>>>> Stashed changes

        const studentId = user.id;
        const token = user.token;
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Fetch dashboard data
        const dashResponse = await api.get<StudentDashboardData>(
          `/api/dashboard/${studentId}`,
          { headers }
        );
        const dataFromServer = dashResponse.data;

        // Normalize announcements → always be an array
        if (!Array.isArray(dataFromServer.announcements)) {
          dataFromServer.announcements = [];
        }
        setDashData(dataFromServer);

        // 3. Fetch courses via groups
        const coursesResponse = await api.get<CourseDto[]>(
          `/api/Course/my-courses-via-groups/${studentId}`,
          { headers }
        );
        setCourses(coursesResponse.data);

        // 4. Fetch assignments
        const assignmentsResponse = await api.get<AssignmentDTO[]>(
          `/api/Assignment/student/${studentId}`,
          { headers }
        );
        setAssignments(assignmentsResponse.data);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]); // re-run if `user` changes

  const handleAnnouncementClick = (announcement: {
    title: string;
    message: string;
    date: string;
  }) => {
    setSelectedAnnouncement(announcement);
    setIsAnnouncementModalOpen(true);
  };

  // Only build stats once dashData is defined. Using totalCourses instead of totalGroups:
  const stats = dashData
    ? [
        {
          title: t("dashboard.activeCourses"),
          value: dashData.totalCourses.toString(),
          change: "+2.5%",
          icon: <BookOpen className="h-6 w-6" />,
          color: "from-edusync-primary to-edusync-secondary",
          onClick: () => navigate("/courses"),
        },
        {
          title: t("dashboard.currentGPA"),
          value: dashData.gpa.toFixed(2),
          change: "+0.2",
          icon: <GraduationCap className="h-6 w-6" />,
          color: "from-edusync-accent to-purple-600",
        },
        {
          title: t("dashboard.pendingAssignments"),
          value: assignments.filter((a) => a.status === 0).length.toString(),
          change: "0",
          icon: <FileText className="h-6 w-6" />,
          color: "from-edusync-warning to-orange-600",
          onClick: () => navigate("/assignments"),
        },
        {
          title: t("dashboard.todaysClasses"),
          value: (dashData.todaysClasses?.length ?? 0).toString(),
          change: "+1",
          icon: <Calendar className="h-6 w-6" />,
          color: "from-edusync-success to-green-600",
          onClick: () => navigate("/schedule"),
        },
      ]
    : [];

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
            {t("dashboard.errorLoading")}
          </h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // If dashData somehow is still null, bail out with a message
  if (!dashData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Dashboard data is missing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-edusync-primary via-edusync-secondary to-edusync-accent p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1
            className={`text-4xl font-bold mb-4 animate-fade-in ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {t("dashboard.welcome", {
              name: dashData.fullName || user?.name || "Student",
            })}{" "}
            👋
          </h1>
          <p
            className={`text-xl opacity-90 max-w-2xl animate-fade-in ${
              isRTL ? "text-right" : "text-left"
            }`}
            style={{ animationDelay: "0.2s" }}
          >
            {t("dashboard.subtitle")}
          </p>
        </div>
        <div
          className={`absolute top-0 ${
            isRTL ? "left-0 -translate-x-12" : "right-0 translate-x-12"
          } -translate-y-12`}
        >
          <div className="w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className={`group bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1 animate-scale-in ${
              stat.onClick ? "cursor-pointer" : ""
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white transform transition-transform duration-200 ${
                  activeCard === index ? "scale-110 rotate-3" : ""
                }`}
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

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <Award className="h-6 w-6 text-edusync-primary" />
            {t("Quick Actions")}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: t("View Courses"),
                icon: BookOpen,
                path: "/courses",
                color: "bg-blue-500",
              },
              {
                label: t("Check Assignments"),
                icon: FileText,
                path: "/assignments",
                color: "bg-orange-500",
              },
              {
                label: t("View Schedule"),
                icon: Clock3,
                path: "/schedule",
                color: "bg-green-500",
              },
              {
                label: t("Update Profile"),
                icon: Users,
                path: "/profile",
                color: "bg-purple-500",
              },
            ].map((action, index) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="group p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gradient-to-r hover:from-edusync-primary/10 hover:to-edusync-accent/10 rounded-xl transition-all duration-200 transform hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-200`}
                >
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  {action.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <Award className="h-6 w-6 text-edusync-accent" />
            {t("dashboard.announcements")}
          </h2>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {dashData.announcements.length > 0 ? (
              dashData.announcements.map((announcement, idx) => (
                <div
                  key={idx} // using index as key since there is no `id`
                  className="group p-4 bg-gradient-to-r from-edusync-primary/5 to-edusync-accent/5 hover:from-edusync-primary/10 hover:to-edusync-accent/10 rounded-xl border border-edusync-primary/20 transition-all duration-200 cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onClick={() => handleAnnouncementClick(announcement)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-edusync-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-edusync-primary transition-colors duration-200">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {announcement.message.length > 100
                          ? `${announcement.message.substring(0, 100)}...`
                          : announcement.message}
                      </p>
                      <p className="text-xs text-edusync-primary font-medium mt-2">
                        {new Date(announcement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("dashboard.noAnnouncements")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      {selectedAnnouncement && (
        <AnnouncementModal
          isOpen={isAnnouncementModalOpen}
          onClose={() => setIsAnnouncementModalOpen(false)}
          announcement={selectedAnnouncement}
        />
      )}
    </div>
  );
}
