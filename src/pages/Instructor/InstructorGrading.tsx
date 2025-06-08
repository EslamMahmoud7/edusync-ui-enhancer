import { useState, useEffect } from 'react';
import { GraduationCap, Star, Users, FileText, Edit3, Save, X, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { submittedAssignmentService, SubmittedAssignmentDTO, GradeSubmittedAssignmentDTO } from '../../services/submittedAssignment';
import api from '../../services/api';
import { exportToCSV } from '../../utils/csvExport';

export default function InstructorGrading() {
  const [submissions, setSubmissions] = useState<SubmittedAssignmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmittedAssignmentDTO | null>(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [gradingData, setGradingData] = useState({
    grade: '',
    instructorNotes: ''
  });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const stored = localStorage.getItem("eduSyncUser");
      if (!stored) throw new Error("Not logged in");
      const { id: instructorId, token } = JSON.parse(stored);

      const headers = { Authorization: `Bearer ${token}` };
      const response = await api.get(`/api/SubmittedAssignments/instructor/${instructorId}`, { headers });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportGradesToCSV = () => {
    const exportData = submissions.map(submission => ({
      'Student Name': submission.studentName,
      'Assignment': submission.assignmentTitle,
      'Submission Title': submission.submissionTitle,
      'Submission Date': new Date(submission.submissionDate).toLocaleDateString(),
      'Grade': submission.grade !== undefined ? `${submission.grade}/100` : 'Not Graded',
      'Instructor Notes': submission.instructorNotes || 'No notes'
    }));
    
    exportToCSV(exportData, `grades-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleGradeSubmission = (submission: SubmittedAssignmentDTO) => {
    setSelectedSubmission(submission);
    setGradingData({
      grade: submission.grade?.toString() || '',
      instructorNotes: submission.instructorNotes || ''
    });
    setIsGradingModalOpen(true);
  };

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;

    try {
      const gradeData: GradeSubmittedAssignmentDTO = {
        grade: Number(gradingData.grade),
        instructorNotes: gradingData.instructorNotes
      };

      await submittedAssignmentService.grade(selectedSubmission.id, gradeData);
      
      // Update the submission in the list
      setSubmissions(prev => prev.map(sub => 
        sub.id === selectedSubmission.id 
          ? { ...sub, grade: gradeData.grade, instructorNotes: gradeData.instructorNotes }
          : sub
      ));

      setIsGradingModalOpen(false);
      setSelectedSubmission(null);
      alert('Grade submitted successfully!');
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Error submitting grade');
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      await submittedAssignmentService.delete(submissionId);
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
      alert('Submission deleted successfully!');
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Error deleting submission');
    }
  };

  const getGradeColor = (grade?: number) => {
    if (!grade) return 'bg-gray-100 text-gray-700';
    if (grade >= 90) return 'bg-green-100 text-green-700';
    if (grade >= 80) return 'bg-blue-100 text-blue-700';
    if (grade >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Assignment Grading</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review and grade student assignment submissions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={exportGradesToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            <Users className="h-4 w-4 mr-1" />
            {submissions.length} Submissions
          </Badge>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-edusync-primary" />
            Student Submissions
          </h2>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Submission</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="font-medium">{submission.studentName}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{submission.assignmentTitle}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{submission.submissionTitle}</div>
                      <a 
                        href={submission.submissionLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-edusync-primary hover:underline"
                      >
                        View Submission
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(submission.submissionDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {submission.grade !== undefined ? (
                      <Badge className={getGradeColor(submission.grade)}>
                        {submission.grade}/100
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Graded</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleGradeSubmission(submission)}
                        className="bg-edusync-primary hover:bg-edusync-secondary"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        {submission.grade !== undefined ? 'Edit Grade' : 'Grade'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSubmission(submission.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {submissions.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No submissions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      <Dialog open={isGradingModalOpen} onOpenChange={setIsGradingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-edusync-primary" />
              Grade Assignment
            </DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">{selectedSubmission.studentName}</div>
                  <div className="text-gray-600 dark:text-gray-400">{selectedSubmission.assignmentTitle}</div>
                  <div className="text-gray-600 dark:text-gray-400">{selectedSubmission.submissionTitle}</div>
                </div>
                <a 
                  href={selectedSubmission.submissionLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-edusync-primary hover:underline"
                >
                  View Submission →
                </a>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Grade (0-100)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={gradingData.grade}
                  onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })}
                  placeholder="Enter grade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instructor Notes (Optional)</label>
                <Textarea
                  value={gradingData.instructorNotes}
                  onChange={(e) => setGradingData({ ...gradingData, instructorNotes: e.target.value })}
                  placeholder="Add feedback for the student..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGradingModalOpen(false)}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitGrade}
                  className="flex-1 bg-edusync-primary hover:bg-edusync-secondary"
                  disabled={!gradingData.grade}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Grade
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
