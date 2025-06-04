import { useState } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from '@/services/group';
import { courseService } from '@/services/course';
import { userService } from '@/services/user';
import { GroupDTO, CreateGroupDTO, UpdateGroupDTO } from '@/types/group';
import SearchInput from '@/components/SearchInput';
import { useToast } from '@/hooks/use-toast';

export default function GroupManagement() {
  // Helper to turn "YYYY-MM-DDTHH:mm" into "YYYY-MM-DDTHH:mm:00"
  function toFullDateTime(dateTimeLocal: string): string {
    return `${dateTimeLocal}:00`;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupDTO | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createForm = useForm<CreateGroupDTO>();
  const editForm = useForm<UpdateGroupDTO>();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: groupService.getAll,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: courseService.getAll,
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['instructors'],
    queryFn: userService.getInstructors,
  });

  const createMutation = useMutation({
    mutationFn: groupService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({ title: 'Group created successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating group',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupDTO }) =>
      groupService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setEditingGroup(null);
      editForm.reset();
      toast({ title: 'Group updated successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating group',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: groupService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: 'Group deleted successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting group',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const filteredGroups = groups.filter((group) =>
    group.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (
      group.instructor &&
      `${group.instructor.firstName} ${group.instructor.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  );

  // --- Create handler ---
  const handleCreate = (data: CreateGroupDTO) => {
    const fullStart = toFullDateTime(data.startTime);
    const fullEnd = toFullDateTime(data.endTime);

    const instructorIdOrUndef =
      data.instructorId === 'none' ? undefined : data.instructorId;

    const payload: CreateGroupDTO = {
      label: data.label,
      courseId: data.courseId,
      instructorId: instructorIdOrUndef,
      startTime: fullStart,
      endTime: fullEnd,
      location: data.location,
      maxStudents: data.maxStudents,
    };

    createMutation.mutate(payload);
  };

  // --- Prefill edit form ---
  const handleEdit = (group: GroupDTO) => {
    setEditingGroup(group);

    const existingStart = group.startTime.slice(0, 16); // "YYYY-MM-DDTHH:mm"
    const existingEnd = group.endTime.slice(0, 16);

    const instructorValue = group.instructor ? group.instructor.id : 'none';

    editForm.reset({
      label: group.label,
      courseId: group.courseId,
      instructorId: instructorValue,
      startTime: existingStart,
      endTime: existingEnd,
      location: group.location,
      maxStudents: group.maxStudents,
    });
  };

  // --- Update handler ---
  const handleUpdate = (data: UpdateGroupDTO) => {
    if (!editingGroup) return;

    let fullStart: string | undefined = undefined;
    let fullEnd: string | undefined = undefined;

    if (data.startTime) {
      fullStart = toFullDateTime(data.startTime);
    }
    if (data.endTime) {
      fullEnd = toFullDateTime(data.endTime);
    }

    const instructorIdOrNull =
      data.instructorId === 'none' ? null : data.instructorId;

    const payload: UpdateGroupDTO = {
      label: data.label,
      courseId: data.courseId,
      instructorId: instructorIdOrNull,
      startTime: fullStart,
      endTime: fullEnd,
      location: data.location,
      maxStudents: data.maxStudents,
    };

    updateMutation.mutate({ id: editingGroup.id, data: payload });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Group Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(handleCreate)}
                className="space-y-4"
              >
                <FormField
                  control={createForm.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter group label" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="instructorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue="none">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an instructor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            No instructor assigned
                          </SelectItem>
                          {instructors.map((instructor) => (
                            <SelectItem key={instructor.id} value={instructor.id}>
                              {instructor.firstName} {instructor.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date &amp; Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date &amp; Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={createForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Group'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <SearchInput
        placeholder="Search groups..."
        onSearch={setSearchQuery}
        className="max-w-md"
      />

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.label}</TableCell>
                <TableCell>{group.courseTitle}</TableCell>
                <TableCell>
                  {group.instructor
                    ? `${group.instructor.firstName} ${group.instructor.lastName}`
                    : 'Unassigned'}
                </TableCell>
                <TableCell>
                  {group.startTime.slice(0, 16).replace('T', ' ')} –{' '}
                  {group.endTime.slice(0, 16).replace('T', ' ')}
                </TableCell>
                <TableCell>{group.location}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(group)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(group.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdate)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group label" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="instructorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an instructor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          No instructor assigned
                        </SelectItem>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.firstName} {instructor.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date &amp; Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date &amp; Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingGroup(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Group'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
