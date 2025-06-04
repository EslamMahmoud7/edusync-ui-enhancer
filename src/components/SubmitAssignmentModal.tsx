
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Link, FileText } from 'lucide-react';
import { submittedAssignmentService, SubmitAssignmentDTO } from '../services/submittedAssignment';
import { useAuth } from '../Context/useAuth';

interface SubmitAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  assignmentTitle: string;
  onSubmitSuccess?: () => void;
}

export default function SubmitAssignmentModal({ 
  isOpen, 
  onClose, 
  assignmentId, 
  assignmentTitle,
  onSubmitSuccess 
}: SubmitAssignmentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    submissionLink: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const submitData: SubmitAssignmentDTO = {
        assignmentId,
        studentId: user.id,
        title: formData.title,
        submissionLink: formData.submissionLink
      };

      await submittedAssignmentService.submit(submitData);
      setFormData({ title: '', submissionLink: '' });
      onClose();
      onSubmitSuccess?.();
      alert('Assignment submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      alert(error.response?.data || 'Error submitting assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: '', submissionLink: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-edusync-primary" />
            Submit Assignment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-edusync-primary/10 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-edusync-primary">
              <FileText className="h-4 w-4" />
              <span className="font-medium text-sm">{assignmentTitle}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Submission Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter submission title"
                required
              />
            </div>

            <div>
              <Label htmlFor="submissionLink">Submission Link</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="submissionLink"
                  type="url"
                  value={formData.submissionLink}
                  onChange={(e) => setFormData({ ...formData, submissionLink: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Provide a link to your submission (Google Drive, GitHub, etc.)
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-edusync-primary hover:bg-edusync-secondary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
