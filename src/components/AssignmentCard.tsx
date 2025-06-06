
import { FileText, Calendar, Clock, CheckCircle2, AlertCircle, Edit3, Trash2 } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Graded";
  submissionDate?: string;
  grade?: number;
  submissionTitle?: string;
  submissionLink?: string;
  instructorNotes?: string;
  submissionId?: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
  index: number;
  onSubmit: (assignment: Assignment) => void;
  onViewDetails: (assignment: Assignment) => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (submissionId: string) => void;
}

export default function AssignmentCard({ 
  assignment, 
  index, 
  onSubmit, 
  onViewDetails, 
  onEdit, 
  onDelete 
}: AssignmentCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Submitted": 
        return { 
          borderColor: "border-blue-500", 
          bgColor: "bg-blue-500/5", 
          textColor: "text-blue-500", 
          icon: <Clock className="w-4 h-4" /> 
        };
      case "Graded": 
        return { 
          borderColor: "border-green-500", 
          bgColor: "bg-green-500/5", 
          textColor: "text-green-500", 
          icon: <CheckCircle2 className="w-4 h-4" /> 
        };
      default: 
        return { 
          borderColor: "border-orange-500", 
          bgColor: "bg-orange-500/5", 
          textColor: "text-orange-500", 
          icon: <AlertCircle className="w-4 h-4" /> 
        };
    }
  };

  const statusConfig = getStatusConfig(assignment.status);

  return (
    <div 
      className={`group bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft border-l-4 ${statusConfig.borderColor} p-6 hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1 animate-scale-in`} 
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
          {statusConfig.icon}
          <span className={`text-sm font-medium ${statusConfig.textColor}`}>
            {assignment.status}
          </span>
        </div>
        <FileText className="w-5 h-5 text-gray-400 group-hover:text-edusync-primary transition-colors duration-200" />
      </div>

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
          <span className="text-sm">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
        </div>
        {assignment.submissionDate && (
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Clock className="w-3 h-3 text-blue-500" />
            </div>
            <span className="text-sm">Submitted: {assignment.submissionDate}</span>
          </div>
        )}
        {assignment.status === "Graded" && assignment.grade != null && (
          <div className="p-3 bg-green-500/10 rounded-lg">
            <p className="text-sm font-bold text-green-500">Grade: {assignment.grade}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button 
          onClick={() => assignment.status === "Pending" ? onSubmit(assignment) : onViewDetails(assignment)} 
          className="w-full py-3 bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
        >
          {assignment.status === "Pending" ? "Submit Assignment" : (assignment.status === "Graded" ? "View Grade" : "View Submission")}
        </button>
        
        {assignment.status === "Submitted" && assignment.submissionId && (
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(assignment)}
              className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button 
              onClick={() => onDelete(assignment.submissionId!)}
              className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
