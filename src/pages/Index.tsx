
import { useState, useEffect } from "react";
import { BookOpen, FileText, GraduationCap, Clock3, Award, NotebookPen, Megaphone, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/useAuth";
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import AnnouncementModal from '../components/AnnouncementModal';
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
  message?: string;
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
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [dash, setDash] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementDTO | null>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

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

  const handleAnnouncementClick = (announcement: AnnouncementDTO) => {
    setSelectedAnnouncement(announcement);
    setIsAnnouncementModalOpen(true);
  };

  const stats = [
    {
      title: t('dashboard.activeCourses'),
      value: dash?.totalCourses?.toString() || "0",
      change: "+2.5%",
      icon: <BookOpen className="h-6 w-6" />,
      color: "from-edusync-primary to-edusync-secondary"
    },
    {
      title: t('dashboard.currentGPA'),
      value: dash?.gpa?.toFixed(2) || "0.00",
      change: "+0.2",
      icon: <GraduationCap className="h-6 w-6" />,
      color: "from-edusync-accent to-purple-600"
    },
    {
      title: t('dashboard.pendingAssignments'),
      value: dash?.pendingAssignments?.toString() || "0",
      change: "0",
      icon: <FileText className="h-6 w-6" />,
      color: "from-edusync-warning to-orange-600"
    },
    {
      title: t('dashboard.todaysClasses'),
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-600 dark:text-red-400">
          <h2 className="text-xl font-semibold mb-2">{t('dashboard.errorLoading')}</h2>
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
          <h1 className={`text-4xl font-bold mb-4 animate-fade-in ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('dashboard.welcome', { name: dash?.fullName || user?.name || 'Student' })} 👋
          </h1>
          <p className={`text-xl opacity-90 max-w-2xl animate-fade-in ${isRTL ? 'text-right' : 'text-left'}`} style={{ animationDelay: '0.2s' }}>
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className={`absolute top-0 ${isRTL ? 'left-0 -translate-x-12' : 'right-0 translate-x-12'} -translate-y-12`}>
          <div className="w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-soft transition-all duration-300 hover:shadow-elevation cursor-pointer transform hover:-translate-y-1 ${
              activeCard === index ? 'ring-2 ring-edusync-primary/20' : ''
            }`}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} justify-between`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                <p className="text-sm text-edusync-success mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white transform transition-transform duration-200 ${
                activeCard === index ? 'scale-110' : ''
              }`}>
                {stat.icon}
              </div>
            </div>
            <div className={`absolute bottom-0 ${isRTL ? 'right-0' : 'left-0'} h-1 bg-gradient-to-r ${stat.color} transition-all duration-300 ${
              activeCard === index ? 'w-full' : 'w-0'
            }`}></div>
          </div>
        ))}
      </div>

      {/* Today's Classes */}
      {dash?.todaysClasses && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-soft hover:shadow-elevation transition-all duration-300">
          <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className={`text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Clock3 className="h-6 w-6 text-edusync-primary" />
              {t('dashboard.todaysClasses')}
            </h2>
            <button
              onClick={() => navigate("/schedule")}
              className="text-edusync-primary hover:text-edusync-accent font-medium transition-colors duration-200"
            >
              {t('dashboard.viewFullSchedule')} →
            </button>
          </div>
          <div className="space-y-3">
            {dash.todaysClasses.length ? (
              dash.todaysClasses.map((cls, idx) => (
                <div key={idx} className={`flex items-center gap-4 p-4 bg-edusync-primary/5 rounded-xl border border-edusync-primary/10 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-2 h-2 bg-edusync-primary rounded-full"></div>
                  <span className="font-semibold text-edusync-primary">{cls.time}</span>
                  <span className="text-gray-700 dark:text-gray-300">{cls.subject}</span>
                  <span className="text-gray-500 dark:text-gray-400 italic">({cls.doctor})</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">{t('dashboard.noClassesToday')}</p>
            )}
          </div>
        </div>
      )}

      {/* Achievements */}
      {dash?.achievements && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-soft hover:shadow-elevation transition-all duration-300">
          <h2 className={`text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Award className="h-6 w-6 text-yellow-500" />
            {t('dashboard.myAchievements')}
          </h2>
          <div className="space-y-4">
            {dash.achievements.length ? (
              dash.achievements.map((ach, i) => (
                <div key={i} className={`flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-800/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Award className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{ach.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{ach.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">{t('dashboard.noAchievements')}</p>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Assignments & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Assignments */}
        {dash?.upcomingAssignments && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-soft hover:shadow-elevation transition-all duration-300">
            <h2 className={`text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <NotebookPen className="h-6 w-6 text-edusync-primary" />
              {t('dashboard.upcomingAssignments')}
            </h2>
            <div className="space-y-3">
              {dash.upcomingAssignments.length ? (
                dash.upcomingAssignments.map((a, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 bg-edusync-primary/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-edusync-primary rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">{a.title}</span>
                    <span className={`text-gray-500 dark:text-gray-400 text-sm ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                      Due {new Date(a.due).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">{t('dashboard.noUpcomingAssignments')}</p>
              )}
            </div>
          </div>
        )}

        {/* Announcements */}
        {dash?.announcements && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-soft hover:shadow-elevation transition-all duration-300">
            <h2 className={`text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Megaphone className="h-6 w-6 text-edusync-accent" />
              {t('dashboard.announcements')}
            </h2>
            <div className="space-y-3">
              {dash.announcements.length ? (
                dash.announcements.map((n, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 p-3 bg-edusync-accent/5 rounded-lg cursor-pointer hover:bg-edusync-accent/10 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                    onClick={() => handleAnnouncementClick(n)}
                  >
                    <div className="w-2 h-2 bg-edusync-accent rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300 hover:text-edusync-accent transition-colors">{n.title}</span>
                    <span className={`text-gray-500 dark:text-gray-400 text-sm ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                      {new Date(n.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">{t('dashboard.noAnnouncements')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        announcement={selectedAnnouncement}
      />
    </div>
  );
};

export default Index;
