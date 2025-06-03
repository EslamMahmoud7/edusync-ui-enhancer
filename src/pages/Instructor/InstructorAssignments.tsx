
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Plus, Users, BookOpen } from 'lucide-react';
import { groupService } from '../../services/group';
import { assignmentService, CreateAssignmentDTO } from '../../services/assignment';

interface GroupDTO {
  id: string;
  label: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseCredits: number;
  courseLevel: number;
  instructorId: string;
  startTime: string;
  endTime: string;
  location: string;
  maxStudents: number;
  enrolledStudentsCount: number;
}

export default function InstructorAssignments() {
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const stored = localStorage.getItem("eduSyncUser");
      if (!stored) throw new Error("Not logged in");
      
      const { id: instructorId } = JSON.parse(stored);
      const groupsData = await groupService.getByInstructor(instructorId);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedGroups([...selectedGroups, groupId]);
    } else {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGroups(groups.map(g => g.id));
    } else {
      setSelectedGroups([]);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGroups.length === 0) {
      alert('Please select at least one group');
      return;
    }

    setCreating(true);
    try {
      // Create assignment for each selected group
      for (const groupId of selectedGroups) {
        const createData: CreateAssignmentDTO = {
          ...formData,
          groupId
        };
        await assignmentService.create(createData);
      }
      
      setIsCreateModalOpen(false);
      setFormData({ title: '', description: '', dueDate: '' });
      setSelectedGroups([]);
      alert('Assignments created successfully!');
    } catch (error) {
      console.error('Error creating assignments:', error);
      alert('Error creating assignments');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edusync-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-edusync-primary to-edusync-accent bg-clip-text text-transparent">
          Assignment Management
        </h1>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={selectedGroups.length === 0}
          className="bg-edusync-primary hover:bg-edusync-secondary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment ({selectedGroups.length} selected)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Groups for Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedGroups.length === groups.length && groups.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedGroups.includes(group.id)}
                      onCheckedChange={(checked) => handleGroupSelect(group.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{group.label}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{group.courseTitle}</div>
                      <div className="text-sm text-gray-500">{group.courseCredits} credits</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      Level {group.courseLevel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(group.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-gray-500">
                        to {new Date(group.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {group.enrolledStudentsCount} / {group.maxStudents}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{group.location || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {groups.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No groups assigned yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Assignment Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <Input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                This assignment will be created for {selectedGroups.length} selected group{selectedGroups.length !== 1 ? 's' : ''}.
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={creating} className="flex-1">
                {creating ? 'Creating...' : 'Create Assignment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
