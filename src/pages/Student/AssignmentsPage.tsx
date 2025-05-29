
import { useState, useEffect } from "react";
import { Search, FileText, Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../../services/api";

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Graded";
  submissionDate?: string;
  grade?: string;
}

const fetchAssignments = async (): Promise<Assignment[]> => {
  const stored = localStorage.getItem("eduSyncUser");
  if (!stored) throw new Error("Not logged in");
  const { id: studentId, token } = JSON.parse(stored);

  const { data } = await api.get<
    Array<{
      title: string;
      description: string;
      dueDate: string;
      courseTitle: string;
    }>
  >(`/api/assignment/mine/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data.map((a, idx) => ({
    id: `${idx}`,
    title: a.title,
    course: a.courseTitle,
    dueDate: new Date(a.dueDate).toLocaleDateString(),
    status: "Pending",
  }));
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filtered, setFiltered] = useState<Assignment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<Assignment | null>(null);

  useEffect(() => {
    fetchAssignments()
      .then((data) => {
        setAssignments(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let data = assignments;
    if (filterStatus !== "All") {
      data = data.filter((a) => a.status === filterStatus);
    }
    if (searchTerm) {
      data = data.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFiltered(data);
  }, [assignments, filterStatus, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-fade-in">
          <div className="w-12 h-12 border-4 border-edusync-primary/20 border-t-edusync-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  const statusCounts = {
    All: assignments.length,
    Pending: assignments.filter(a => a.status === "Pending").length,
    Submitted: assignments.filter(a => a.status === "Submitted").length,
    Graded: assignments.filter(a => a.status === "Graded").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-edusync-primary to-edusync-accent bg-clip-text text-transparent">
          Assignments
        </h1>
        <div className="text-sm text-gray-500">
          {filtered.length} assignment{filtered.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {(["All", "Pending", "Submitted", "Graded"] as const).map((status, index) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                filterStatus === status
                  ? "bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white shadow-lg"
                  : "bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200/50 hover:bg-edusync-primary/5 hover:border-edusync-primary/20"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {status}
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white/20">
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-edusync-primary/20 focus:border-edusync-primary transition-all duration-200"
          />
        </div>
      </div>

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((assignment, index) => {
          const getStatusConfig = (status: string) => {
            switch (status) {
              case "Submitted":
                return {
                  borderColor: "border-edusync-success",
                  bgColor: "bg-edusync-success/5",
                  textColor: "text-edusync-success",
                  icon: <CheckCircle2 className="w-4 h-4" />,
                };
              case "Graded":
                return {
                  borderColor: "border-edusync-accent",
                  bgColor: "bg-edusync-accent/5",
                  textColor: "text-edusync-accent",
                  icon: <CheckCircle2 className="w-4 h-4" />,
                };
              default:
                return {
                  borderColor: "border-edusync-warning",
                  bgColor: "bg-edusync-warning/5",
                  textColor: "text-edusync-warning",
                  icon: <AlertCircle className="w-4 h-4" />,
                };
            }
          };

          const statusConfig = getStatusConfig(assignment.status);

          return (
            <div
              key={assignment.id}
              className={`group bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft border-l-4 ${statusConfig.borderColor} p-6 hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1 animate-scale-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
                  {statusConfig.icon}
                  <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                    {assignment.status}
                  </span>
                </div>
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-edusync-primary transition-colors duration-200" />
              </div>

              {/* Assignment Info */}
              <div className="space-y-3 mb-6">
                <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-edusync-primary transition-colors duration-200">
                  {assignment.title}
                </h3>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-6 h-6 bg-edusync-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="w-3 h-3 text-edusync-primary" />
                  </div>
                  <span className="text-sm">{assignment.course}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-6 h-6 bg-edusync-secondary/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-edusync-secondary" />
                  </div>
                  <span className="text-sm">Due: {assignment.dueDate}</span>
                </div>

                {assignment.status !== "Pending" && assignment.submissionDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-6 h-6 bg-edusync-success/10 rounded-full flex items-center justify-center">
                      <Clock className="w-3 h-3 text-edusync-success" />
                    </div>
                    <span className="text-sm">Submitted: {assignment.submissionDate}</span>
                  </div>
                )}

                {assignment.status === "Graded" && assignment.grade && (
                  <div className="p-3 bg-edusync-success/10 rounded-lg">
                    <p className="text-sm font-bold text-edusync-success">
                      Grade: {assignment.grade}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => setSelected(assignment)}
                className="w-full py-3 bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
              >
                {assignment.status === "Pending"
                  ? "Submit Assignment"
                  : assignment.status === "Graded"
                  ? "View Grade"
                  : "View Submission"}
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">
            {searchTerm ? `No assignments found matching "${searchTerm}"` : "No assignments found"}
          </p>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-glass p-6 w-full max-w-md animate-scale-in">
            <h2 className="text-xl font-bold text-edusync-primary mb-4">
              {selected.status === "Graded" ? "Grade Details" : "Assignment Details"}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium text-gray-800">{selected.title}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Course</p>
                <p className="font-medium text-gray-800">{selected.course}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium text-gray-800">{selected.dueDate}</p>
              </div>

              {selected.status === "Graded" && selected.grade && (
                <div className="p-3 bg-edusync-success/10 rounded-lg">
                  <p className="text-sm text-gray-500">Grade</p>
                  <p className="text-lg font-bold text-edusync-success">{selected.grade}</p>
                </div>
              )}

              {selected.submissionDate && (
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="font-medium text-gray-800">{selected.submissionDate}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
