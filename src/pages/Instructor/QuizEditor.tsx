import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus, Users, FileText, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { quizService } from '../../services/quiz';
import type { QuizDTO, QuizAttemptResultDTO } from '../../types/quiz';
import { useAuth } from '../../Context/useAuth';
import EditQuizModal from '../../components/EditQuizModal';
import AddQuizModelModal from '../../components/AddQuizModelModal';
import QuizModelsSection from '../../components/QuizModelsSection';
import QuizAttemptsTable from '../../components/QuizAttemptsTable';

export default function QuizEditor() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<QuizDTO | null>(null);
  const [attempts, setAttempts] = useState<QuizAttemptResultDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModelModalOpen, setIsAddModelModalOpen] = useState(false);

  useEffect(() => {
    if (quizId && user?.id) {
      fetchQuizData();
      fetchAttempts();
    }
  }, [quizId, user?.id]);

  const fetchQuizData = async () => {
    try {
      if (quizId && user?.id) {
        const data = await quizService.getQuizForInstructor(quizId, user.id);
        setQuiz(data);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttempts = async () => {
    try {
      if (quizId && user?.id) {
        // ✅ Corrected: Called the correct function 'getAllAttemptsForQuiz'
        const data = await quizService.getAllAttemptsForQuiz(quizId, user.id);
        setAttempts(data);
      }
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!quiz || !user?.id) return;
    
    if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await quizService.deleteQuiz(quiz.id, user.id);
        navigate('/instructor/quizzes');
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Error deleting quiz');
      }
    }
  };

  const handleQuizUpdated = (updatedQuiz: QuizDTO) => {
    setQuiz(updatedQuiz);
    setIsEditModalOpen(false);
  };

  const handleModelAdded = () => {
    fetchQuizData(); // Refetch quiz data to update models list
    setIsAddModelModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edusync-primary"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Quiz not found</h2>
          <Button onClick={() => navigate('/instructor/quizzes')}>
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
          onClick={() => navigate('/instructor/quizzes')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </Button>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {quiz.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {quiz.description}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-edusync-primary" />
                <span className="text-sm">Due: {new Date(quiz.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-edusync-primary" />
                <span className="text-sm">{quiz.durationMinutes} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-edusync-primary" />
                <span className="text-sm">Max {quiz.maxAttempts} attempts</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-edusync-primary" />
                <span className="text-sm">{quiz.quizModels.length} model(s)</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Quiz
            </Button>
            <Button
              onClick={handleDeleteQuiz}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Quiz
            </Button>
          </div>
        </div>

        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="models">Quiz Models</TabsTrigger>
            <TabsTrigger value="attempts">Student Attempts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="models" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Quiz Models</h3>
              <Button
                onClick={() => setIsAddModelModalOpen(true)}
                className="bg-edusync-primary hover:bg-edusync-secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Quiz Model
              </Button>
            </div>
            <QuizModelsSection quiz={quiz} onModelAdded={fetchQuizData} />
          </TabsContent>
          
          <TabsContent value="attempts" className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold">Student Attempts</h3>
            <QuizAttemptsTable attempts={attempts} />
          </TabsContent>
        </Tabs>
      </div>

      {quiz && (
        <>
          <EditQuizModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            quiz={quiz}
            onQuizUpdated={handleQuizUpdated}
          />
          
          <AddQuizModelModal
            isOpen={isAddModelModalOpen}
            onClose={() => setIsAddModelModalOpen(false)}
            quizId={quiz.id}
            onModelAdded={handleModelAdded}
          />
        </>
      )}
    </div>
  );
}