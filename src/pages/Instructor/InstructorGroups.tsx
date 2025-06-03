
import { useState, useEffect } from 'react';
import { Calendar, Grid, Plus, Users, Clock, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MaterialsModal from '../../components/MaterialsModal';
import AddMaterialModal from '../../components/AddMaterialModal';
import { groupService } from '../../services/group';
import api from '../../services/api';

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

interface CourseScheduleDTO {
  date: Date;
  day: string;
  time: string;
  subject: string;
  room: string;
  doctor: string;
}

export default function InstructorGroups() {
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [schedule, setSchedule] = useState<CourseScheduleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterialGroup, setSelectedMaterialGroup] = useState<{
    groupId: string;
    courseTitle: string;
  } | null>(null);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [selectedGroupForAdd, setSelectedGroupForAdd] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const stored = localStorage.getItem("eduSyncUser");
      if (!stored) throw new Error("Not logged in");
      
      const { id: instructorId, token } = JSON.parse(stored);
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch instructor groups
      const groupsData = await groupService.getByInstructor(instructorId);
      setGroups(groupsData);

      // Fetch instructor schedule
      const scheduleResponse = await api.get<CourseScheduleDTO[]>(
        `/api/CourseSchedule/instructor/${instructorId}`,
        { headers }
      );
      setSchedule(scheduleResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResources = (groupId: string, courseTitle: string) => {
    setSelectedMaterialGroup({ groupId, courseTitle });
    setIsMaterialsModalOpen(true);
  };

  const handleAddResources = (groupId: string) => {
    setSelectedGroupForAdd(groupId);
    setIsAddMaterialModalOpen(true);
  };

  const handleMaterialAdded = () => {
    // Refresh or notify parent component if needed
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
          My Groups
        </h1>
        <div className="text-sm text-gray-500">
          {groups.length} group{groups.length !== 1 ? 's' : ''} assigned
        </div>
      </div>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Cards View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groups.map((group, index) => (
              <div
                key={group.id}
                className="group bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 p-6 hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-edusync-primary/10 text-edusync-primary text-xs font-medium rounded-full">
                        {group.label}
                      </span>
                      <span className="px-2 py-1 bg-edusync-accent/10 text-edusync-accent text-xs rounded-full">
                        Level {group.courseLevel}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-edusync-primary transition-colors duration-200">
                      {group.courseTitle}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {new Date(group.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(group.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {group.location || 'No location set'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    {group.enrolledStudentsCount} / {group.maxStudents} students
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewResources(group.id, group.courseTitle)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Resources
                  </Button>
                  <Button
                    onClick={() => handleAddResources(group.id)}
                    size="sm"
                    className="flex-1 bg-edusync-primary hover:bg-edusync-secondary"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Resources
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {groups.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">No groups assigned yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-edusync-primary" />
              Teaching Schedule
            </h2>
            
            <div className="space-y-4">
              {schedule.length > 0 ? (
                schedule.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-edusync-primary/5 to-edusync-accent/5 rounded-xl border border-edusync-primary/20 hover:from-edusync-primary/10 hover:to-edusync-accent/10 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-edusync-primary/10 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-edusync-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{item.subject}</h3>
                        <p className="text-sm text-gray-600">
                          {item.day} • {item.time} • {item.room}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-edusync-primary">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No scheduled classes</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Materials Modal */}
      {selectedMaterialGroup && (
        <MaterialsModal
          isOpen={isMaterialsModalOpen}
          onClose={() => setIsMaterialsModalOpen(false)}
          groupId={selectedMaterialGroup.groupId}
          courseTitle={selectedMaterialGroup.courseTitle}
        />
      )}

      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={isAddMaterialModalOpen}
        onClose={() => setIsAddMaterialModalOpen(false)}
        groupId={selectedGroupForAdd}
        onMaterialAdded={handleMaterialAdded}
      />
    </div>
  );
}
