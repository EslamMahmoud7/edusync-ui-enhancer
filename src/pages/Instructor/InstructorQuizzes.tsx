import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, BookOpen, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { quizService } from '../../services/quiz';
import type { QuizDTO } from '../../types/quiz';
import { useNavigate } from 'react-router-dom';
import CreateQuizModal from '../../components/CreateQuizModal';

export default function InstructorQuizzes() {
  const [quizzes, setQuizzes] = useState<QuizDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userString = localStorage.getItem('eduSyncUser');
    if (userString) {
      const user = JSON.parse(userString);
      if (user?.id) {
        fetchQuizzes(user.id);
      } else {
        console.error("User object in localStorage is missing an ID.");
        setLoading(false);
      }
    } else {
      console.error("User not found in localStorage. Please log in.");
      setLoading(false); 
    }
  }, []); 

  const fetchQuizzes = async (instructorId: string) => {
    setLoading(true);
    try {
      const data = await quizService.getMyQuizzesAsInstructor(instructorId);
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizCreated = (newQuiz: QuizDTO) => {
    setQuizzes(prev => [newQuiz, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleQuizClick = (quizId: string) => {
    navigate(`/instructor/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edusync-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Quiz Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and manage your quizzes
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-edusync-primary hover:bg-edusync-secondary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Quiz
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            onClick={() => handleQuizClick(quiz.id)}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white line-clamp-2">
                {quiz.title}
              </h3>
              <div className="flex items-center gap-2">
                {quiz.isPublished ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Draft
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <BookOpen className="h-4 w-4" />
                <span>{quiz.groupLabel}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Due: {new Date(quiz.dueDate).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{quiz.durationMinutes} minutes</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FileText className="h-4 w-4" />
                <span>{quiz.quizModels.length} model(s)</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4" />
                <span>Max {quiz.maxAttempts} attempts</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {quiz.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!loading && quizzes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No quizzes yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by creating your first quiz
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-edusync-primary hover:bg-edusync-secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Quiz
          </Button>
        </div>
      )}

      <CreateQuizModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onQuizCreated={handleQuizCreated}
      />
    </div>
  );
}