import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { quizService } from '../services/quiz';
import type { UpdateQuizDTO, QuizDTO } from '../types/quiz';
import { useAuth } from '../Context/useAuth';

interface EditQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizDTO;
  onQuizUpdated: (quiz: QuizDTO) => void;
}

export default function EditQuizModal({ isOpen, onClose, quiz, onQuizUpdated }: EditQuizModalProps) {
  const [formData, setFormData] = useState<Omit<UpdateQuizDTO, 'requestingInstructorId'>>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && quiz) {
      const formattedDueDate = new Date(quiz.dueDate).toISOString().slice(0, 16);

      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        dueDate: formattedDueDate,
        durationMinutes: quiz.durationMinutes,
        maxAttempts: quiz.maxAttempts,
        shuffleQuestions: quiz.shuffleQuestions,
        isPublished: quiz.isPublished
      });
    }
  }, [isOpen, quiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
        alert("Cannot update quiz. User not found.");
        return;
    }
    setLoading(true);

    try {
      // ✅ Create the complete data packet here, including the instructorId
      const dataToSubmit: UpdateQuizDTO = {
        ...formData,
        requestingInstructorId: user.id,
      };

      const updatedQuiz = await quizService.updateQuiz(quiz.id, dataToSubmit);
      onQuizUpdated(updatedQuiz);
      onClose(); // Close the modal on success
    } catch (error) {
      console.error('Error updating quiz:', error);
      alert('Error updating quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Quiz</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="durationMinutes">Duration (minutes) *</Label>
              <Input
                id="durationMinutes"
                type="number"
                min="1"
                value={formData.durationMinutes || 60}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maxAttempts">Max Attempts *</Label>
            <Input
              id="maxAttempts"
              type="number"
              min="1"
              value={formData.maxAttempts || 1}
              onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="shuffleQuestions"
              checked={formData.shuffleQuestions || false}
              onCheckedChange={(checked) => setFormData({ ...formData, shuffleQuestions: checked })}
            />
            <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublished"
              checked={formData.isPublished || false}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
            />
            <Label htmlFor="isPublished">Publish Quiz</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-edusync-primary hover:bg-edusync-secondary">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}