import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { quizService } from '../services/quiz';
import { groupService } from '../services/group';
import type { CreateQuizDTO, QuizDTO } from '../types/quiz';
import type { GroupDTO } from '../types/group';

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizCreated: (quiz: QuizDTO) => void;
}

const getInstructorId = () => {
  const userString = localStorage.getItem('eduSyncUser');
  if (userString) {
    const user = JSON.parse(userString);
    return user.id || '';
  }
  return '';
};

const initialFormData: CreateQuizDTO = {
  requestingInstructorId: '',
  title: '',
  description: '',
  groupId: '',
  dueDate: '',
  durationMinutes: 60,
  maxAttempts: 1,
  shuffleQuestions: false,
  isPublished: false,
};

export default function CreateQuizModal({ isOpen, onClose, onQuizCreated }: CreateQuizModalProps) {
  const [formData, setFormData] = useState<CreateQuizDTO>(initialFormData);
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, requestingInstructorId: getInstructorId() }));
      fetchGroups();
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    try {
      const instructorId = getInstructorId();
      if (instructorId) {
        const data = await groupService.getByInstructor(instructorId); 
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requestingInstructorId) {
      alert("Could not find instructor ID. Please log in again.");
      return;
    }
    setLoading(true);

    try {
      const quiz = await quizService.createQuiz(formData);
      onQuizCreated(quiz);
      handleClose();
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="groupId">Group *</Label>
            <Select value={formData.groupId} onValueChange={(value) => setFormData({ ...formData, groupId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.courseTitle} 
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
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
                value={formData.durationMinutes}
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
              value={formData.maxAttempts}
              onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="shuffleQuestions"
              checked={formData.shuffleQuestions}
              onCheckedChange={(checked) => setFormData({ ...formData, shuffleQuestions: checked })}
            />
            <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublished"
              checked={formData.isPublished}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
            />
            <Label htmlFor="isPublished">Publish Quiz</Label>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-edusync-primary hover:bg-edusync-secondary">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}