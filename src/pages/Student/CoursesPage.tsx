import { useState, useEffect } from "react";
import { BookOpen, ExternalLink, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MaterialsModal from "../../components/MaterialsModal";
import api from "../../services/api";

interface GroupWithCourse {
  id: string;
  label: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseCredits: number;
  courseLevel: number;
  startTime: string;
  location: string;
}

interface ApiScheduleItemGroup {
  groupId: string;
  date: string;
  day: string;
  time: string;
  subject: string;
  room: string;
  doctor?: string;
}

export default function CoursesPage() {
  const [groups, setGroups] = useState<GroupWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMaterialGroup, setSelectedMaterialGroup] = useState<{
    groupId: string;
    courseTitle: string;
  } | null>(null);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem("eduSyncUser");
      if (!stored) throw new Error("You are not logged in.");

      const { id: studentId, token } = JSON.parse(stored);
      const headers = { Authorization: `Bearer ${token}` };

      const response = await api.get<ApiScheduleItemGroup[]>(
        `/api/CourseSchedule/student/${studentId}`, 
        { headers }
      );

      console.log("Raw API response for CoursesPage:", JSON.stringify(response.data, null, 2));

      const transformedGroups: GroupWithCourse[] = response.data.map((item, index) => {

        const a_courseId = `COURSE_ID_FOR_${item.subject.replace(/\s+/g, '_')}_${index}`; 
        const a_courseDescription = `Detailed description for ${item.subject}.`;
        const a_courseCredits = 3; 
        const a_courseLevel = 1; 

        return {
          id: item.groupId,
          label: `${item.subject} Group (${item.day} at ${item.time})`,
          
          courseId: a_courseId, 
          courseTitle: item.subject,
          courseDescription: a_courseDescription, 
          courseCredits: a_courseCredits,
          courseLevel: a_courseLevel,
          
          startTime: item.date, 
          location: item.room || "N/A",
        };
      });
      
      setGroups(transformedGroups);

    } catch (err: any) {
      console.error("Courses fetch error:", err);
      let errorMessage = "Failed to load courses. Please try again later.";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResources = (groupId: string, courseTitle: string) => {
    setSelectedMaterialGroup({ groupId, courseTitle });
    setIsMaterialsModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return {
            date: "Date N/A",
            time: "Time N/A",
            day: "Day N/A"
        };
    }
    return {
      date: date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
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

  if (error) {
    return (
      <div className="space-y-8 p-4 md:p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-600 dark:text-red-400 text-center">
          <h2 className="text-xl font-semibold mb-2">⚠️ Error Loading Courses</h2>
          <p>{error}</p>
          <Button onClick={fetchCourses} className="mt-4">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-edusync-primary via-edusync-secondary to-edusync-accent p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 animate-fade-in">
            My Enrolled Sessions 📚
          </h1>
          <p
            className="text-xl opacity-90 max-w-2xl animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Explore your enrolled course sessions and access study materials
          </p>
        </div>
        <div className="absolute top-0 right-0 translate-x-12 -translate-y-12">
          <div className="w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        </div>
      </div>

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
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-edusync-primary transition-colors duration-200">
                    {group.courseTitle} 
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {group.label}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="secondary">
                    Level {group.courseLevel} 
                  </Badge>
                  <Badge variant="outline">
                    {group.courseCredits} Credits 
                  </Badge>
                </div>
              </div>

              {group.courseDescription && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {group.courseDescription}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  {dateInfo.day}, {dateInfo.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  {group.location}
                </div>
              </div>

              <Button
                onClick={() => handleViewResources(group.id, group.courseTitle)}
                className="w-full bg-edusync-primary hover:bg-edusync-secondary transition-colors duration-200"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Resources
              </Button>
            </div>
          );
        })}
      </div>

      {!loading && groups.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Course Sessions Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            You do not seem to be enrolled in any specific course sessions at the moment.
          </p>
        </div>
      )}

      {selectedMaterialGroup && (
        <MaterialsModal
          isOpen={isMaterialsModalOpen}
          onClose={() => setIsMaterialsModalOpen(false)}
          groupId={selectedMaterialGroup.groupId} 
          courseTitle={selectedMaterialGroup.courseTitle}
        />
      )}
    </div>
  );
}