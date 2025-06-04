
import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { assignmentService, CreateAssignmentDTO } from '../../services/assignment';
import api from '../../services/api';

interface InstructorGroupDTO {
  id: string;
  label: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseCredits: number;
  courseLevel: number;
  instructorId: string;
  enrolledStudentsCount: number;
  startTime: string;
  location: string;
}

export default function InstructorAssignments() {
  const [groups, setGroups] = useState<InstructorGroupDTO[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignmentData, setAssignmentData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const stored = localStorage.getItem("eduSyncUser");
      if (!stored) throw new Error("Not logged in");
      const { id: instructorId, token } = JSON.parse(stored);

      const headers = { Authorization: `Bearer ${token}` };
      const response = await api.get(`/api/CourseSchedule/instructor/${instructorId}`, { headers });
      
      // Transform the schedule data to match our group interface
      const groupsData = response.data.map((item: any) => ({
        id: item.groupId || item.id,
        label: item.groupLabel || `${item.subject} Group`,
        courseId: item.courseId || '',
        courseTitle: item.subject,
        courseDescription: '',
        courseCredits: 3,
        courseLevel: 1,
        instructorId: instructorId,
        enrolledStudentsCount: 0,
        startTime: item.date,
        location: item.room || 'N/A'
      }));

      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelection = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedGroups([...selectedGroups, groupId]);
    } else {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    }
  };

  const handleCreateAssignment = async () => {
    if (selectedGroups.length === 0) {
      alert('Please select at least one group');
      return;
    }

    try {
      for (const groupId of selectedGroups) {
        const createData: CreateAssignmentDTO = {
          ...assignmentData,
          groupId,
        };
        await assignmentService.create(createData);
      }
      
      setIsModalOpen(false);
      setSelectedGroups([]);
      setAssignmentData({ title: '', description: '', dueDate: '' });
      alert('Assignments created successfully!');
    } catch (error) {
      console.error('Error creating assignments:', error);
      alert('Error creating assignments');
    }
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Assignment Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Select groups and create assignments for your students
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          disabled={selectedGroups.length === 0}
          className="bg-edusync-primary hover:bg-edusync-secondary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-edusync-primary" />
            My Groups
          </h2>
          
          {selectedGroups.length > 0 && (
            <div className="mb-4 p-3 bg-edusync-primary/10 rounded-lg">
              <p className="text-sm text-edusync-primary font-medium">
                {selectedGroups.length} group(s) selected for assignment creation
              </p>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Select</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedGroups.includes(group.id)}
                      onCheckedChange={(checked) => 
                        handleGroupSelection(group.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{group.label}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{group.courseTitle}</div>
                      <Badge variant="secondary" className="mt-1">
                        Level {group.courseLevel} • {group.courseCredits} Credits
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4" />
                      {new Date(group.startTime).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4" />
                      {group.location}
                    </div>
                  </TableCell>
                  
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {groups.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No groups found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Assignment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={assignmentData.title}
                onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                placeholder="Assignment title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={assignmentData.description}
                onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                placeholder="Assignment description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <Input
                type="datetime-local"
                value={assignmentData.dueDate}
                onChange={(e) => setAssignmentData({ ...assignmentData, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">Selected Groups:</p>
              <div className="space-y-1">
                {selectedGroups.map(groupId => {
                  const group = groups.find(g => g.id === groupId);
                  return (
                    <div key={groupId} className="text-sm text-gray-600 dark:text-gray-300">
                      • {group?.courseTitle} - {group?.label}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAssignment}
                className="flex-1 bg-edusync-primary hover:bg-edusync-secondary"
              >
                Create Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
