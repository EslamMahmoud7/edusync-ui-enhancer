
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, Trophy, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { quizService } from '../../services/quiz';
import type { QuizAttemptResultDTO } from '../../types/quiz';
import { useAuth } from '../../Context/useAuth';

export default function QuizResult() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState<QuizAttemptResultDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (attemptId && user?.id) {
      fetchResult();
    }
  }, [attemptId, user?.id]);

  const fetchResult = async () => {
    try {
      if (attemptId && user?.id) {
        const data = await quizService.getAttemptResult(attemptId, user.id);
        setResult(data);
      }
    } catch (error) {
      console.error('Error fetching quiz result:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScorePercentage = () => {
    if (!result) return 0;
    return Math.round((result.score / result.totalPointsPossible) * 100);
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'graded':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'timeexpired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edusync-primary"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Result not found</h2>
          <Button onClick={() => navigate('/quizzes')}>
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/quizzes')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </Button>
      </div>

      {/* Score Summary */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-8">
        <div className="text-center mb-8">
          <div className="mb-4">
            <Trophy className={`h-16 w-16 mx-auto ${getScoreColor()}`} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Quiz Results
          </h1>
          
          <div className={`text-6xl font-bold mb-4 ${getScoreColor()}`}>
            {result.score}/{result.totalPointsPossible}
          </div>
          
          <div className="text-2xl text-gray-600 dark:text-gray-400 mb-4">
            {getScorePercentage()}%
          </div>

          <div className="max-w-md mx-auto mb-6">
            <Progress value={getScorePercentage()} className="h-3" />
          </div>

          <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getStatusColor(result.status)}`}>
            <Clock className="h-4 w-4 mr-2" />
            Status: {result.status}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {result.answerResults?.filter(a => a.isCorrect).length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {result.answerResults?.filter(a => !a.isCorrect).length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Incorrect Answers</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {new Date(result.startTime).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed Date</div>
          </div>
        </div>
      </div>

      {/* Detailed Review */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Detailed Review
        </h2>

        <div className="space-y-6">
          {result.answerResults?.map((answer, index) => (
            <div
              key={index}
              className={`border-l-4 pl-6 py-4 ${
                answer.isCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Question {index + 1}
                </h3>
                <div className="flex items-center gap-2">
                  {answer.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    answer.isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {answer.pointsAwarded}/{answer.pointsPossibleForQuestion}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {answer.questionText}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Your Answer:
                  </p>
                  <p className={`p-3 rounded-lg ${
                    answer.isCorrect
                      ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                  }`}>
                    {answer.selectedOptionText || 'No answer selected'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Correct Answer:
                  </p>
                  <p className="p-3 rounded-lg bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                    {answer.correctOptionText}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => navigate('/quizzes')}
          className="bg-edusync-primary hover:bg-edusync-secondary"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
