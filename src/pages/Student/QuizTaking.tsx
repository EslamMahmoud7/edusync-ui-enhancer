import React, { useState, useEffect, useRef } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (quizId && user?.id) {
      initializeQuiz();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizId, user?.id]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (!loading && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [timeRemaining, loading]);

  const initializeQuiz = async () => {
    setLoading(true);
    try {
      if (!quizId || !user?.id) return;

      let attemptData: StudentQuizAttemptDTO;
      
      if (action === 'resume') {
        attemptData = await quizService.resumeQuizAttempt(quizId, user.id);
      } else {
        attemptData = await quizService.startQuizAttempt(quizId, user.id);
      }

      setAttempt(attemptData);
      
      const initialAnswers: Record<string, string> = {};
      attemptData.answers?.forEach(answer => {
        if(answer.selectedOptionId) {
          initialAnswers[answer.questionId] = answer.selectedOptionId;
        }
      });
      setAnswers(initialAnswers);

      if (action === 'resume') {
        const startTime = new Date(attemptData.startTime).getTime();
        const durationMs = attemptData.durationMinutes * 60 * 1000;
        const endTime = startTime + durationMs;
        const remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        
        if (remainingSeconds <= 0) {
          handleAutoSubmit();
        } else {
          setTimeRemaining(remainingSeconds);
        }
      } else {
        setTimeRemaining(attemptData.durationMinutes * 60);
      }

    } catch (error) {
      console.error('Error initializing quiz:', error);
      alert('Error starting or resuming quiz. You may not have attempts left or the quiz is not available.');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };
  
  const submitQuizFlow = async () => {
    if (isSubmitting || !attempt || !user?.id) return;
    setIsSubmitting(true);
    
    if (timerRef.current) {
        clearInterval(timerRef.current);
    }

    try {
      const submission: StudentQuizSubmissionDTO = {
        requestingStudentId: user.id,
        attemptId: attempt.attemptId,
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId
        }))
      };
      const result = await quizService.submitQuizAttempt(submission);
      navigate(`/student/quiz-result/${result.attemptId}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (confirm('Are you sure you want to submit your quiz?')) {
      submitQuizFlow();
    }
  };
  
  const handleAutoSubmit = () => {
    if (!isSubmitting) {
      alert("Time's up! Your quiz will now be submitted automatically.");
      submitQuizFlow();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!attempt) return 0;
    const answeredQuestions = Object.values(answers).filter(Boolean).length;
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Could Not Load Quiz</h2>
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
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {attempt.quizTitle}
              </h1>
              <div className="mt-2">
                <Progress value={getProgress()} className="w-64" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {Object.values(answers).filter(Boolean).length} of {attempt.questions.length} questions answered
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
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky top-24">
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
                  </button>
                ))}
              </div>
            </div>
          </div>

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
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors flex items-center ${
                      answers[currentQuestion.id] === option.id
                        ? 'border-edusync-primary bg-edusync-primary/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-edusync-primary'
                    }`}
                  >
                    {answers[currentQuestion.id] === option.id ? (
                      <CheckCircle className="h-5 w-5 text-edusync-primary mr-3 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    )}
                    <span className="text-gray-800 dark:text-white">{option.text}</span>
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
                    disabled={isSubmitting}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
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