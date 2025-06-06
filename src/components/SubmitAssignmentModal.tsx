
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
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

interface FormData {
  title: string;
  submissionLink: string;
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
  
  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      submissionLink: ''
    }
  });

  const handleSubmit = async (data: FormData) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const submitData: SubmitAssignmentDTO = {
        assignmentId,
        studentId: user.id,
        title: data.title,
        submissionLink: data.submissionLink
      };

      await submittedAssignmentService.submit(submitData);
      form.reset();
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
    form.reset();
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                rules={{ 
                  required: "Submission title is required",
                  minLength: { value: 3, message: "Title must be at least 3 characters" },
                  maxLength: { value: 100, message: "Title cannot exceed 100 characters" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter submission title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="submissionLink"
                rules={{ 
                  required: "Submission link is required",
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: "Please enter a valid URL"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Link</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="url"
                          placeholder="https://drive.google.com/..."
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide a link to your submission (Google Drive, GitHub, etc.)
                    </p>
                  </FormItem>
                )}
              />

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
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
