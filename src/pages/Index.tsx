
import { useState, useEffect } from "react";
import { BookOpen, FileText, GraduationCap, Clock3, Award, NotebookPen, Megaphone, Users, BarChart2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/useAuth";
import api from "../services/api";

// Dashboard DTOs
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

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [dash, setDash] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
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

  const stats = [
    {
      title: "Active Courses",
      value: dash?.totalCourses?.toString() || "0",
      change: "+2.5%",
      icon: <BookOpen className="h-6 w-6" />,
      color: "from-edusync-primary to-edusync-secondary"
    },
    {
      title: "Current GPA",
      value: dash?.gpa?.toFixed(2) || "0.00",
      change: "+0.2",
      icon: <GraduationCap className="h-6 w-6" />,
      color: "from-edusync-accent to-purple-600"
    },
    {
      title: "Pending Assignments",
      value: dash?.pendingAssignments?.toString() || "0",
      change: "-2",
      icon: <FileText className="h-6 w-6" />,
      color: "from-edusync-warning to-orange-600"
    },
    {
      title: "Today's Classes",
      value: dash?.todaysClasses?.length?.toString() || "0",
      change: "+1",
      icon: <Calendar className="h-6 w-6" />,
      color: "from-edusync-success to-green-600"
    }
  ];

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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600">
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-edusync-primary via-edusync-secondary to-edusync-accent p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 animate-fade-in">
            Welcome back, {dash?.fullName || user?.name || 'Student'} 👋
          </h1>
          <p className="text-xl opacity-90 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Your comprehensive educational dashboard with real-time updates and modern design.
          </p>
        </div>
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12">
          <div className="w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-xl bg-white border border-gray-200/50 p-6 shadow-soft transition-all duration-300 hover:shadow-elevation cursor-pointer transform hover:-translate-y-1 ${
              activeCard === index ? 'ring-2 ring-edusync-primary/20' : ''
            }`}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-edusync-success mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white transform transition-transform duration-200 ${
                activeCard === index ? 'scale-110' : ''
              }`}>
                {stat.icon}
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.color} transition-all duration-300 ${
              activeCard === index ? 'w-full' : 'w-0'
            }`}></div>
          </div>
        ))}
      </div>

      {/* Today's Classes */}
      {dash?.todaysClasses && (
        <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-soft hover:shadow-elevation transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Clock3 className="h-6 w-6 text-edusync-primary" />
              Today's Classes
            </h2>
            <button
              onClick={() => navigate("/schedule")}
              className="text-edusync-primary hover:text-edusync-accent font-medium transition-colors duration-200"
            >
              View Full Schedule →
            </button>
          </div>
          <div className="space-y-3">
            {dash.todaysClasses.length ? (
              dash.todaysClasses.map((cls, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-edusync-primary/5 rounded-xl border border-edusync-primary/10">
                  <div className="w-2 h-2 bg-edusync-primary rounded-full"></div>
                  <span className="font-semibold text-edusync-primary">{cls.time}</span>
                  <span className="text-gray-700">{cls.subject}</span>
                  <span className="text-gray-500 italic">({cls.doctor})</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No classes today.</p>
            )}
          </div>
        </div>
      )}

      {/* Achievements */}
      {dash?.achievements && (
        <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-soft hover:shadow-elevation transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Award className="h-6 w-6 text-yellow-500" />
            My Achievements
          </h2>
          <div className="space-y-4">
            {dash.achievements.length ? (
              dash.achievements.map((ach, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200/50">
                  <Award className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{ach.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{ach.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No achievements yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Assignments & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Assignments */}
        {dash?.upcomingAssignments && (
          <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-soft hover:shadow-elevation transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <NotebookPen className="h-6 w-6 text-edusync-primary" />
              Upcoming Assignments
            </h2>
            <div className="space-y-3">
              {dash.upcomingAssignments.length ? (
                dash.upcomingAssignments.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-edusync-primary/5 rounded-lg">
                    <div className="w-2 h-2 bg-edusync-primary rounded-full"></div>
                    <span className="text-gray-700">{a.title}</span>
                    <span className="text-gray-500 text-sm ml-auto">
                      Due {new Date(a.due).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No upcoming assignments.</p>
              )}
            </div>
          </div>
        )}

        {/* Announcements */}
        {dash?.announcements && (
          <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-soft hover:shadow-elevation transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Megaphone className="h-6 w-6 text-edusync-accent" />
              Announcements
            </h2>
            <div className="space-y-3">
              {dash.announcements.length ? (
                dash.announcements.map((n, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-edusync-accent/5 rounded-lg">
                    <div className="w-2 h-2 bg-edusync-accent rounded-full"></div>
                    <span className="text-gray-700">{n.title}</span>
                    <span className="text-gray-500 text-sm ml-auto">
                      {new Date(n.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No announcements.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
