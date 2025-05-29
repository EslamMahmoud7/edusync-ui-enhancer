
import { useState, useEffect } from "react";
import { Search, Calendar, User, ExternalLink, Clock } from "lucide-react";
import api from "../../services/api";

interface Course {
  code: string;
  title: string;
  credits: number;
  instructor: string;
  prerequisites?: string[];
  instructorEmail: string;
  resourceLink: string;
  progress: number;
  nextDeadline: string;
  level: string;
}

interface LevelData {
  level: string;
  courses: Course[];
}

const fetchMyCourses = async (): Promise<LevelData[]> => {
  try {
    const stored = localStorage.getItem("eduSyncUser");
    if (!stored) throw new Error("Not logged in");
    const { id: studentId, token } = JSON.parse(stored);

    const { data: raw } = await api.get<
      Array<{
        code: string;
        title: string;
        credits: number;
        instructorName: string;
        instructorEmail: string;
        resourceLink: string;
        progress: number;
        nextDeadline: string;
        level: number;
      }>
    >(`/api/course/mine/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const list: Course[] = raw.map((c) => ({
      code: c.code,
      title: c.title,
      credits: c.credits,
      instructor: c.instructorName,
      instructorEmail: c.instructorEmail,
      resourceLink: c.resourceLink,
      progress: c.progress,
      nextDeadline: c.nextDeadline,
      level: String(c.level),
    }));

    const map: Record<string, Course[]> = {};
    list.forEach((c) => {
      if (!map[c.level]) map[c.level] = [];
      map[c.level].push(c);
    });

    return Object.entries(map).map(([level, courses]) => ({
      level,
      courses,
    }));
  } catch (err) {
    console.error("Error loading courses:", err);
    return [];
  }
};

export default function CoursesPage() {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses()
      .then((data) => {
        setLevels(data);
        if (data.length) setSelectedLevel(data[0].level);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-fade-in">
          <div className="w-12 h-12 border-4 border-edusync-primary/20 border-t-edusync-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your courses…</p>
        </div>
      </div>
    );
  }

  if (!levels.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-edusync-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-edusync-primary" />
          </div>
          <p className="text-gray-600">You're not enrolled in any courses yet.</p>
        </div>
      </div>
    );
  }

  const currentLevel = levels.find((l) => l.level === selectedLevel) || levels[0];
  const filtered = currentLevel.courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const daysUntil = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-edusync-primary to-edusync-accent bg-clip-text text-transparent">
          My Courses
        </h1>
        <div className="text-sm text-gray-500">
          {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Level Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {levels.map((lvl, index) => (
          <button
            key={lvl.level}
            onClick={() => setSelectedLevel(lvl.level)}
            className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
              selectedLevel === lvl.level
                ? "bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white shadow-lg"
                : "bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200/50 hover:bg-edusync-primary/5 hover:border-edusync-primary/20"
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            Level {lvl.level}
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white/20">
              {lvl.courses.length}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search courses, instructors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-edusync-primary/20 focus:border-edusync-primary transition-all duration-200"
        />
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((course, index) => {
          const days = daysUntil(course.nextDeadline);
          const isUrgent = days <= 3;
          
          return (
            <div
              key={course.code}
              className="group bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 p-6 hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-edusync-primary/10 text-edusync-primary text-xs font-medium rounded-full">
                      {course.code}
                    </span>
                    <span className="px-2 py-1 bg-edusync-accent/10 text-edusync-accent text-xs rounded-full">
                      {course.credits} credits
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-edusync-primary transition-colors duration-200">
                    {course.title}
                  </h3>
                </div>
              </div>

              {/* Prerequisites */}
              {course.prerequisites?.length && (
                <div className="mb-4 p-3 bg-gray-50/80 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Prerequisites:</p>
                  <p className="text-sm text-gray-700">{course.prerequisites.join(", ")}</p>
                </div>
              )}

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-edusync-primary/5 rounded-lg">
                <div className="w-8 h-8 bg-edusync-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-edusync-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{course.instructor}</p>
                  <a
                    href={`mailto:${course.instructorEmail}`}
                    className="text-xs text-edusync-primary hover:underline"
                  >
                    {course.instructorEmail}
                  </a>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-edusync-primary">{course.progress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-edusync-primary to-edusync-secondary rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              {/* Deadline */}
              <div className={`p-3 rounded-lg mb-4 ${
                isUrgent ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-600' : 'text-blue-600'}`} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Next deadline</p>
                    <p className={`text-sm font-medium ${isUrgent ? 'text-red-700' : 'text-blue-700'}`}>
                      {new Date(course.nextDeadline).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    isUrgent ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {days}d
                  </span>
                </div>
              </div>

              {/* Resource Link */}
              <a
                href={course.resourceLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-medium">Course Resources</span>
              </a>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && searchTerm && (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">No courses found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
