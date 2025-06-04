
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { academicRecordsService } from '../services/academicRecords';
import { AcademicRecordDTO, CreateAcademicRecordDTO, UpdateAcademicRecordDTO, AssessmentType, AcademicRecordStatus } from '../types/academic';
import api from '../services/api';

interface AcademicRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: AcademicRecordDTO | null;
}

interface Student {
  id: string;
  name: string;
}

interface Group {
  id: string;
  label: string;
  courseTitle: string;
}

export default function AcademicRecordModal({ isOpen, onClose, record }: AcademicRecordModalProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    groupId: '',
    gradeValue: 0,
    assessmentType: AssessmentType.Quiz,
    term: '',
    status: AcademicRecordStatus.Pending
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
      if (record) {
        setFormData({
          studentId: record.studentId,
          groupId: record.groupId,
          gradeValue: record.gradeValue,
          assessmentType: record.assessmentType,
          term: record.term,
          status: record.status
        });
      } else {
        setFormData({
          studentId: '',
          groupId: '',
          gradeValue: 0,
          assessmentType: AssessmentType.Quiz,
          term: '',
          status: AcademicRecordStatus.Pending
        });
      }
    }
  }, [isOpen, record]);

  const fetchDropdownData = async () => {
    try {
      // Fetch students and groups for dropdowns
      const [studentsRes, groupsRes] = await Promise.all([
        api.get('/api/users?role=Student'), // Assuming this endpoint exists
        api.get('/api/group')
      ]);
      
      setStudents(studentsRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (record) {
        // Update existing record
        const updateData: UpdateAcademicRecordDTO = {
          gradeValue: formData.gradeValue,
          assessmentType: formData.assessmentType,
          term: formData.term,
          status: formData.status
        };
        await academicRecordsService.update(record.id, updateData);
        toast({
          title: "Success",
          description: "Academic record updated successfully"
        });
      } else {
        // Create new record
        const createData: CreateAcademicRecordDTO = {
          studentId: formData.studentId,
          groupId: formData.groupId,
          gradeValue: formData.gradeValue,
          assessmentType: formData.assessmentType,
          term: formData.term,
          status: formData.status
        };
        await academicRecordsService.create(createData);
        toast({
          title: "Success",
          description: "Academic record created successfully"
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save academic record:', error);
      toast({
        title: "Error",
        description: "Failed to save academic record",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {record ? 'Edit Academic Record' : 'Add Academic Record'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!record && (
            <>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student</Label>
                <Select value={formData.studentId} onValueChange={(value) => setFormData({...formData, studentId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupId">Group</Label>
                <Select value={formData.groupId} onValueChange={(value) => setFormData({...formData, groupId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.label} - {group.courseTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="gradeValue">Grade (%)</Label>
            <Input
              id="gradeValue"
              type="number"
              min="0"
              max="100"
              value={formData.gradeValue}
              onChange={(e) => setFormData({...formData, gradeValue: Number(e.target.value)})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assessmentType">Assessment Type</Label>
            <Select value={formData.assessmentType.toString()} onValueChange={(value) => setFormData({...formData, assessmentType: Number(value) as AssessmentType})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AssessmentType).filter(([key]) => isNaN(Number(key))).map(([key, value]) => (
                  <SelectItem key={value} value={value.toString()}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="term">Term</Label>
            <Input
              id="term"
              value={formData.term}
              onChange={(e) => setFormData({...formData, term: e.target.value})}
              placeholder="e.g., Fall 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status.toString()} onValueChange={(value) => setFormData({...formData, status: Number(value) as AcademicRecordStatus})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AcademicRecordStatus).filter(([key]) => isNaN(Number(key))).map(([key, value]) => (
                  <SelectItem key={value} value={value.toString()}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (record ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
