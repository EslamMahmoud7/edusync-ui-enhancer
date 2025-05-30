
import React from 'react';
import { X, Calendar, Megaphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: {
    title: string;
    date: string;
    message?: string;
  } | null;
}

export default function AnnouncementModal({ isOpen, onClose, announcement }: AnnouncementModalProps) {
  const { t } = useTranslation();

  if (!isOpen || !announcement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-edusync-primary to-edusync-accent p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Megaphone className="h-6 w-6" />
              <h2 className="text-xl font-bold">{t('announcements.title')}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Calendar className="h-4 w-4" />
            {new Date(announcement.date).toLocaleDateString()}
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {announcement.title}
          </h3>
          
          <div className="prose max-w-none text-gray-700 dark:text-gray-300">
            {announcement.message || "This is a detailed announcement message that would come from your backend. It can contain multiple paragraphs and rich content about important updates, events, or information that students need to know."}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            className="w-full bg-edusync-primary hover:bg-edusync-secondary text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {t('announcements.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
