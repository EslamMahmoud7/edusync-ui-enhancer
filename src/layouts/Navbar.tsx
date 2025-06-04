
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, LogOut, Menu, AlertCircle, Moon, Sun, Globe } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { announcementService } from '../services/announcement';
import type { AnnouncementDTO } from '../types/announcement';

interface NavbarProps {
  toggleSidebar: () => void;
  role: 1 | 2 | 3; // Updated to accept numeric roles
}

export default function Navbar({ toggleSidebar, role }: NavbarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementDTO[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await announcementService.getAll();
        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleLogout = () => {
    navigate("/login");
  };

  // Convert numeric role to string for navigation paths, handle legacy role 0
  const roleString = (role === 2) ? "admin" : "student";

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-edusync-primary hover:bg-edusync-primary/10 transition-all duration-200 transform hover:scale-105 active:scale-95"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <img 
                  src="/favicon.ico" 
                  alt="EduSync Logo" 
                  className="h-9 w-9 transition-transform duration-200 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-edusync-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-edusync-primary to-edusync-accent bg-clip-text text-transparent hidden sm:block group-hover:animate-bounce-gentle">
                EduSync
              </span>
            </button>
          </div>


          {/* Right Section */}
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Mobile Search */}
            <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-edusync-primary hover:bg-edusync-primary/10 transition-all duration-200 md:hidden">
              <Search className="h-5 w-5" />
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-edusync-primary hover:bg-edusync-primary/10 transition-all duration-200"
              >
                <Globe className="h-5 w-5" />
              </button>

              {showLanguageMenu && (
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-32 animate-scale-in`}>
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-glass overflow-hidden">
                    <button
                      onClick={() => {
                        changeLanguage('en');
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        currentLanguage === 'en' ? 'bg-edusync-primary/10 text-edusync-primary' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        changeLanguage('ar');
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        currentLanguage === 'ar' ? 'bg-edusync-primary/10 text-edusync-primary' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      العربية
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-edusync-primary hover:bg-edusync-primary/10 transition-all duration-200"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-edusync-warning hover:bg-edusync-warning/10 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <Bell className="h-5 w-5" />
                {announcements.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-edusync-error to-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-bounce-gentle">
                    {announcements.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 animate-scale-in`}>
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-600/50 rounded-2xl shadow-glass overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-edusync-primary/5 to-edusync-accent/5 border-b border-gray-200/50 dark:border-gray-600/50">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        {t('navigation.notifications')}
                      </h4>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {announcements.length > 0 ? announcements.map((announcement, index) => (
                        <div
                          key={announcement.id}
                          className="p-4 border-b border-gray-100/50 dark:border-gray-700/50 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                  {announcement.title}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {announcement.message}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {new Date(announcement.dateCreated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                          No announcements available
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 bg-gray-50/50 dark:bg-gray-700/50 border-t border-gray-200/50 dark:border-gray-600/50">
                      <button
                        onClick={() => {
                          const path = roleString === "admin" ? "/admin/notifications" : "/notifications";
                          navigate(path);
                          setShowNotifications(false);
                        }}
                        className="w-full text-center text-sm text-edusync-primary hover:text-edusync-accent font-medium transition-colors duration-200"
                      >
                        {t('announcements.viewAll')} →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-edusync-error hover:bg-edusync-error/10 transition-all duration-200 transform hover:scale-105 active:scale-95"
              title={t('navigation.logout')}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Click outside overlays */}
      {(showNotifications || showLanguageMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowNotifications(false);
            setShowLanguageMenu(false);
          }}
        />
      )}
    </nav>
  );
}
