
import { useState, useEffect } from "react";
import { Bell, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { announcementService } from "../services/announcement";
import type { AnnouncementDTO } from "../types/announcement";

export default function Notifications() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<AnnouncementDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await announcementService.getAll();
        setAnnouncements(data);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-fade-in">
          <div className="w-12 h-12 border-4 border-edusync-primary/20 border-t-edusync-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading announcements…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-edusync-primary hover:bg-edusync-primary/10 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-edusync-warning/10 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-edusync-warning" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-edusync-primary to-edusync-accent bg-clip-text text-transparent">
            All Announcements
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50">
        {announcements.length > 0 ? (
          <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {announcements.map((announcement, index) => (
              <div
                key={announcement.id}
                className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-edusync-warning/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6 text-edusync-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                          {announcement.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(announcement.dateCreated).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              No Announcements
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              There are no announcements to display at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
