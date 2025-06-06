
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useForm } from 'react-hook-form';
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

interface FormData {
  studentId: string;
  groupId: string;
  gradeValue: number;
  assessmentType: AssessmentType;
  term: string;
  status: AcademicRecordStatus;
}

export default function AcademicRecordModal({ isOpen, onClose, record }: AcademicRecordModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      studentId: '',
      groupId: '',
      gradeValue: 0,
      assessmentType: AssessmentType.Quiz,
      term: '',
      status: AcademicRecordStatus.Pending
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
      if (record) {
        form.reset({
          studentId: record.studentId,
          groupId: record.groupId,
          gradeValue: record.gradeValue,
          assessmentType: record.assessmentType,
          term: record.term,
          status: record.status
        });
      } else {
        form.reset({
          studentId: '',
          groupId: '',
          gradeValue: 0,
          assessmentType: AssessmentType.Quiz,
          term: '',
          status: AcademicRecordStatus.Pending
        });
      }
    }
  }, [isOpen, record, form]);

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

  const handleSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      if (record) {
        // Update existing record
        const updateData: UpdateAcademicRecordDTO = {
          gradeValue: data.gradeValue,
          assessmentType: data.assessmentType,
          term: data.term,
          status: data.status
        };
        await academicRecordsService.update(record.id, updateData);
        toast({
          title: "Success",
          description: "Academic record updated successfully"
        });
      } else {
        // Create new record
        const createData: CreateAcademicRecordDTO = {
          studentId: data.studentId,
          groupId: data.groupId,
          gradeValue: data.gradeValue,
          assessmentType: data.assessmentType,
          term: data.term,
          status: data.status
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {!record && (
              <>
                <FormField
                  control={form.control}
                  name="studentId"
                  rules={{ required: "Student is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="groupId"
                  rules={{ required: "Group is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="gradeValue"
              rules={{ 
                required: "Grade is required",
                min: { value: 0, message: "Grade cannot be negative" },
                max: { value: 100, message: "Grade cannot exceed 100" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Enter grade"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assessmentType"
              rules={{ required: "Assessment type is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Type</FormLabel>
                  <FormControl>
                    <Select 
                      value={field.value.toString()} 
                      onValueChange={(value) => field.onChange(Number(value) as AssessmentType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assessment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(AssessmentType).filter(([key]) => isNaN(Number(key))).map(([key, value]) => (
                          <SelectItem key={value} value={value.toString()}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="term"
              rules={{ 
                required: "Term is required",
                minLength: { value: 3, message: "Term must be at least 3 characters" },
                maxLength: { value: 50, message: "Term cannot exceed 50 characters" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Fall 2024"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select 
                      value={field.value.toString()} 
                      onValueChange={(value) => field.onChange(Number(value) as AcademicRecordStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(AcademicRecordStatus).filter(([key]) => isNaN(Number(key))).map(([key, value]) => (
                          <SelectItem key={value} value={value.toString()}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (record ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
