
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, CheckCircle, Circle, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { quizService } from '../../services/quiz';
import type { StudentQuizAttemptDTO, StudentQuizSubmissionDTO } from '../../types/quiz';
import { useAuth } from '../../Context/useAuth';

export default function QuizTaking() {
  const { quizId } = useParams<{ quizId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const action = searchParams.get('action');

  const [attempt, setAttempt] = useState<StudentQuizAttemptDTO | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quizId && user?.id) {
      initializeQuiz();
    }
  }, [quizId, user?.id, action]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const initializeQuiz = async () => {
    try {
      if (!quizId || !user?.id) return;

      let attemptData: StudentQuizAttemptDTO;
      
      if (action === 'resume') {
        attemptData = await quizService.resumeQuiz(quizId, user.id);
      } else {
        attemptData = await quizService.startQuiz(quizId, user.id);
      }

      setAttempt(attemptData);
      
      // Initialize answers from existing answers if resuming
      const initialAnswers: Record<string, string> = {};
      attemptData.answers?.forEach(answer => {
        initialAnswers[answer.questionId] = answer.selectedOptionId;
      });
      setAnswers(initialAnswers);

      // Calculate time remaining
      const startTime = new Date(attemptData.startTime);
      const durationMs = attemptData.durationMinutes * 60 * 1000;
      const elapsed = Date.now() - startTime.getTime();
      const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000));
      setTimeRemaining(remaining);

    } catch (error) {
      console.error('Error initializing quiz:', error);
      alert('Error starting quiz');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    if (!attempt || !user?.id) return;

    if (confirm('Are you sure you want to submit your quiz? This action cannot be undone.')) {
      try {
        const submission: StudentQuizSubmissionDTO = {
          attemptId: attempt.attemptId,
          answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
            questionId,
            selectedOptionId
          }))
        };

        const result = await quizService.submitQuiz(submission);
        navigate(`/student/quiz-result/${result.attemptId}`);
      } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('Error submitting quiz');
      }
    }
  };

  const handleAutoSubmit = () => {
    if (!attempt || !user?.id) return;

    const submission: StudentQuizSubmissionDTO = {
      attemptId: attempt.attemptId,
      answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId
      }))
    };

    quizService.submitQuiz(submission).then(result => {
      navigate(`/student/quiz-result/${result.attemptId}`);
    }).catch(error => {
      console.error('Error auto-submitting quiz:', error);
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!attempt) return 0;
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / attempt.questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edusync-primary"></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Quiz not found</h2>
          <Button onClick={() => navigate('/student/quizzes')}>
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = attempt.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === attempt.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {attempt.quizTitle}
              </h1>
              <div className="mt-2">
                <Progress value={getProgress()} className="w-64" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {Object.keys(answers).length} of {attempt.questions.length} questions answered
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-edusync-primary'}`}>
                <Clock className="h-8 w-8 inline mr-2" />
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Time Remaining</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky top-6">
              <h3 className="font-semibold mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {attempt.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? 'border-edusync-primary bg-edusync-primary text-white'
                        : answers[question.id]
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-edusync-primary'
                    }`}
                  >
                    {index + 1}
                    {answers[question.id] && (
                      <CheckCircle className="h-3 w-3 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-edusync-primary">
                    Question {currentQuestionIndex + 1} of {attempt.questions.length}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  {currentQuestion.text}
                </h2>
              </div>

              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      answers[currentQuestion.id] === option.id
                        ? 'border-edusync-primary bg-edusync-primary/10'
                        : 'border-gray-200 bg-gray-50 hover:border-edusync-primary hover:bg-edusync-primary/5'
                    }`}
                  >
                    <div className="flex items-center">
                      {answers[currentQuestion.id] === option.id ? (
                        <CheckCircle className="h-5 w-5 text-edusync-primary mr-3" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 mr-3" />
                      )}
                      <span className="text-gray-800 dark:text-white">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  disabled={isFirstQuestion}
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {isLastQuestion ? (
                  <Button
                    onClick={handleSubmit}
                    className="bg-edusync-success hover:bg-green-600"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="bg-edusync-primary hover:bg-edusync-secondary"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
