
import { useState, useEffect } from "react";
import { Search, Calendar, User, ExternalLink, Clock } from "lucide-react";
import api from "../../services/api";
import type { CourseDto } from "../../Context/auth-types";

const fetchMyCourses = async (): Promise<CourseDto[]> => {
  try {
    const stored = localStorage.getItem("eduSyncUser");
    if (!stored) throw new Error("Not logged in");
    const { id: studentId, token } = JSON.parse(stored);

    const { data } = await api.get<CourseDto[]>(
      `/api/Course/my-courses-via-groups/${studentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return data;
  } catch (err) {
    console.error("Error loading courses:", err);
    return [];
  }
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses()
      .then((data) => {
        setCourses(data);
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

  if (!courses.length) {
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

  const levels = [...new Set(courses.map(c => c.level))].sort();
  const filtered = courses.filter(
    (c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel =
        selectedLevel === "all" || c.level.toString() === selectedLevel;

      return matchesLevel && matchesSearch;
    }
  );

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
        <button
          onClick={() => setSelectedLevel("all")}
          className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
            selectedLevel === "all"
              ? "bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white shadow-lg"
              : "bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200/50 hover:bg-edusync-primary/5 hover:border-edusync-primary/20"
          }`}
        >
          All Levels
          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white/20">
            {courses.length}
          </span>
        </button>
        {levels.map((level, index) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level.toString())}
            className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
              selectedLevel === level.toString()
                ? "bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white shadow-lg"
                : "bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200/50 hover:bg-edusync-primary/5 hover:border-edusync-primary/20"
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            Level {level}
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white/20">
              {courses.filter(c => c.level === level).length}
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
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-edusync-primary/20 focus:border-edusync-primary transition-all duration-200"
        />
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((course, index) => (
          <div
            key={course.id}
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

            {/* Description */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-3">
                {course.description}
              </p>
            </div>

            {/* Level Badge */}
            <div className="mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                Level {course.level}
              </span>
            </div>

            {/* Resource Link */}
            {course.resourceLink && (
              <a
                href={course.resourceLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-medium">Course Resources</span>
              </a>
            )}
          </div>
        ))}
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
