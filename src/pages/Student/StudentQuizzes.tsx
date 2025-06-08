import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Play, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../Context/useAuth';
import { quizService } from '../../services/quiz';
import type { StudentQuizListItemDTO } from '../../types/quiz';
import { useNavigate } from 'react-router-dom';

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState<StudentQuizListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchQuizzes();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const data = await quizService.getAvailableQuizzes(user.id);
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionButton = (quiz: StudentQuizListItemDTO) => {
    const { lastAttemptStatus, attemptsMade, maxAttempts, lastAttemptId } = quiz;

    if (attemptsMade >= maxAttempts && lastAttemptStatus !== 'InProgress') {
      return (
        <Button
          onClick={() => navigate(`/student/quiz-result/${lastAttemptId}`)}
          variant="outline"
          className="w-full"
          disabled={!lastAttemptId}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Results
        </Button>
      );
    }
    
    if (lastAttemptStatus === 'InProgress') {
      return (
        <Button
          onClick={() => navigate(`/student/quiz-info/${quiz.quizId}?action=resume`)}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Resume Quiz
        </Button>
      );
    }

    if ((lastAttemptStatus === 'Submitted' || lastAttemptStatus === 'Graded') && attemptsMade < maxAttempts) {
      return (
        <div className="space-y-2">
          <Button
            onClick={() => navigate(`/student/quiz-result/${lastAttemptId}`)}
            variant="outline"
            className="w-full"
            disabled={!lastAttemptId}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Last Result
          </Button>
          <Button
            onClick={() => navigate(`/student/quiz-info/${quiz.quizId}?action=start`)}
            className="w-full bg-edusync-primary hover:bg-edusync-secondary"
          >
            <Play className="h-4 w-4 mr-2" />
            Start New Attempt
          </Button>
        </div>
      );
    }
    
    return (
      <Button
        onClick={() => navigate(`/student/quiz-info/${quiz.quizId}?action=start`)}
        className="w-full bg-edusync-primary hover:bg-edusync-secondary"
      >
        <Play className="h-4 w-4 mr-2" />
        Start Quiz
      </Button>
    );
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Available Quizzes</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Take quizzes assigned to your courses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.quizId}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6 flex flex-col hover:shadow-elevation transition-all duration-300"
          >
            <div className="flex-grow">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {quiz.title}
                </h3>
                <p className="text-sm text-edusync-primary font-medium mb-2">
                  {quiz.courseTitle}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                  {quiz.description}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {new Date(quiz.dueDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{quiz.durationMinutes} minutes</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>
                    Attempts: {quiz.attemptsMade}/{quiz.maxAttempts}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              {getActionButton(quiz)}
            </div>
          </div>
        ))}
      </div>

      {!loading && quizzes.length === 0 && (
        <div className="text-center py-12 col-span-full">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No quizzes available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Check back later for new quizzes from your instructors.
          </p>
        </div>
      )}
    </div>
  );
}