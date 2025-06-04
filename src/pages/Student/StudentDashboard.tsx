
import { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Clock3,
  Award,
  Calendar,
  Users,
  ExternalLink,
  Upload, // Add missing Upload import
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/useAuth";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import AnnouncementModal from "../../components/AnnouncementModal";
import SubmitAssignmentModal from "../../components/SubmitAssignmentModal";
import api from "../../services/api";
import type { AssignmentDTO } from "../../Context/auth-types";

interface StudentDashboardData {
  fullName: string;
  totalCourses: number;
  gpa: number;
  pendingAssignments: number;
  todaysClasses: Array<{
    time: string;
    subject: string;
    location:string;
  }>;
  upcomingAssignments: Array<unknown>;
  announcements: Array<{
    title: string;
    message: string;
    date: string;
  }>;
}

interface GroupWithCourse {
  groupid: string;
  date: string;
  day: string;
  time: string;
  subject: string;
  room: number;
  doctor: number;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [dashData, setDashData] = useState<StudentDashboardData | null>(null);
  const [groups, setGroups] = useState<GroupWithCourse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<{
    title: string;
    message: string;
    date: string;
  } | null>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  const [selectedAssignmentForSubmission, setSelectedAssignmentForSubmission] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const stored = localStorage.getItem("eduSyncUser");
        if (!stored) throw new Error("You are not logged in.");

        const { id: studentId, token } = JSON.parse(stored);
        if (!studentId) throw new Error("Missing user ID or token.");

        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch dashboard data
        const dashResponse = await api.get<StudentDashboardData>(
          `/api/dashboard/${studentId}`,
          { headers }
        );

        const dataFromServer = dashResponse.data;

        if (!Array.isArray(dataFromServer.announcements)) {
          dataFromServer.announcements = [];
        }

        setDashData(dataFromServer);

        // 2. Fetch groups (for courses and materials)
        const groupsResponse = await api.get<GroupWithCourse[]>(
          `/api/CourseSchedule/student/${studentId}`,
          { headers }
        );
        setGroups(groupsResponse.data);

        // 3. Fetch assignments
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
  }, []);

  const handleAnnouncementClick = (announcement: {
    title: string;
    message: string;
    date: string;
  }) => {
    setSelectedAnnouncement(announcement);
    setIsAnnouncementModalOpen(true);
  };

  const handleSubmitAssignment = (assignmentId: string, assignmentTitle: string) => {
    setSelectedAssignmentForSubmission({ id: assignmentId, title: assignmentTitle });
    setIsSubmitModalOpen(true);
  };

  const handleSubmitSuccess = () => {
    // Refresh assignments or update UI as needed
    console.log('Assignment submitted successfully');
  };

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
        {/* My Courses */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-edusync-primary" />
            My Courses
          </h2>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {groups.length > 0 ? (
              groups.map((group, index) => (
                <div
                  key={group.groupid}
                  className="group p-4 bg-gradient-to-r from-edusync-primary/5 to-edusync-accent/5 hover:from-edusync-primary/10 hover:to-edusync-accent/10 rounded-xl border border-edusync-primary/20 transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-edusync-primary transition-colors duration-200">
                        {group.subject}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {group.subject} • Dr. {group.doctor} • Room {group.room}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/courses')} // MODIFIED: Navigates directly to /courses
                      className="ml-3 px-3 py-1 text-xs bg-edusync-primary text-white rounded-lg hover:bg-edusync-secondary transition-colors duration-200 flex items-center"
                    >
                      <BookOpen className="h-3 w-3 inline mr-1" /> {/* MODIFIED: Icon */}
                      View Courses {/* MODIFIED: Text */}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  No courses enrolled yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <FileText className="h-6 w-6 text-edusync-warning" />
            Recent Assignments
          </h2>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {assignments.length > 0 ? (
              assignments.slice(0, 5).map((assignment, index) => (
                <div
                  key={assignment.id}
                  className="group p-4 bg-gradient-to-r from-edusync-primary/5 to-edusync-accent/5 hover:from-edusync-primary/10 hover:to-edusync-accent/10 rounded-xl border border-edusync-primary/20 transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-edusync-primary transition-colors duration-200">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {assignment.courseTitle} • Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                      <div className="mt-2">
                        {assignment.status === 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                        {assignment.status === 1 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Submitted
                          </span>
                        )}
                      </div>
                    </div>
                    {assignment.status === 0 && (
                      <button
                        onClick={() => handleSubmitAssignment(assignment.id, assignment.title)}
                        className="ml-3 px-3 py-1 text-xs bg-edusync-primary text-white rounded-lg hover:bg-edusync-secondary transition-colors duration-200 flex items-center"
                      >
                        <Upload className="h-3 w-3 inline mr-1" />
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  No assignments available
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

      {/* Submit Assignment Modal */}
      {selectedAssignmentForSubmission && (
        <SubmitAssignmentModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          assignmentId={selectedAssignmentForSubmission.id}
          assignmentTitle={selectedAssignmentForSubmission.title}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}
