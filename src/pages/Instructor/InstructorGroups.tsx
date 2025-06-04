
import { useState, useEffect } from 'react';
import { Calendar, Users, BookOpen, Plus, Eye, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MaterialsModal from '../../components/MaterialsModal';
import AddMaterialModal from '../../components/AddMaterialModal';
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

interface ScheduleItem {
  date: string;
  day: string;
  time: string;
  subject: string;
  room: string;
  doctor: string;
}

export default function InstructorGroups() {
  const [groups, setGroups] = useState<InstructorGroupDTO[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterialGroup, setSelectedMaterialGroup] = useState<{
    groupId: string;
    courseTitle: string;
  } | null>(null);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const stored = localStorage.getItem("eduSyncUser");
      if (!stored) throw new Error("Not logged in");
      const { id: instructorId, token } = JSON.parse(stored);

      const headers = { Authorization: `Bearer ${token}` };
      
      const scheduleResponse = await api.get(`/api/CourseSchedule/instructor/${instructorId}`, { headers });
      setSchedule(scheduleResponse.data);
      
      const groupsData = scheduleResponse.data.map((item: any, index: number) => ({
        id: item.groupId || `group-${index}`,
        label: `${item.subject} Group`,
        courseId: item.courseId || '',
        courseTitle: item.subject,
        courseDescription: '',
        courseCredits: 3,
        courseLevel: 1,
        instructorId: instructorId,
        enrolledStudentsCount: 25, 
        startTime: item.date,
        location: item.room || 'N/A'
      }));

      setGroups(groupsData);
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

  const handleAddMaterial = (groupId: string, courseTitle: string) => {
    setSelectedMaterialGroup({ groupId, courseTitle });
    setIsAddMaterialModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      day: date.toLocaleDateString('en-US', { weekday: 'long' })
    };
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Groups</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your groups and course materials
        </p>
      </div>

      <Tabs defaultValue="cards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cards">Groups Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule View</TabsTrigger>
        </TabsList>

        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => {
              const dateInfo = formatDate(group.startTime);
              return (
                <div
                  key={group.id}
                  className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1 animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-edusync-primary transition-colors duration-200">
                        {group.courseTitle}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {group.label}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      Level {group.courseLevel}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      {dateInfo.day}, {dateInfo.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {group.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      {group.enrolledStudentsCount} students
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewResources(group.id, group.courseTitle)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Materials
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddMaterial(group.id, group.courseTitle)}
                      className="flex-1 bg-edusync-primary hover:bg-edusync-secondary"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Material
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {groups.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No groups assigned yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-edusync-primary" />
              Teaching Schedule
            </h2>
            
            <div className="grid gap-4">
              {schedule.map((item, index) => {
                const dateInfo = formatDate(item.date);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-edusync-primary/5 to-edusync-accent/5 hover:from-edusync-primary/10 hover:to-edusync-accent/10 rounded-xl border border-edusync-primary/20 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-edusync-primary rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {item.subject}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {dateInfo.day} • {item.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.room}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {dateInfo.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {schedule.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No scheduled classes</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedMaterialGroup && (
        <MaterialsModal
          isOpen={isMaterialsModalOpen}
          onClose={() => setIsMaterialsModalOpen(false)}
          groupId={selectedMaterialGroup.groupId}
          courseTitle={selectedMaterialGroup.courseTitle}
        />
      )}

      {selectedMaterialGroup && (
        <AddMaterialModal
          isOpen={isAddMaterialModalOpen}
          onClose={() => setIsAddMaterialModalOpen(false)}
          groupId={selectedMaterialGroup.groupId}
          onMaterialAdded={() => {
            setIsAddMaterialModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
