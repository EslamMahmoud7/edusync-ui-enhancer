
import { ExternalLink } from "lucide-react";

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

interface AssignmentDetailsModalProps {
  assignment: Assignment;
  onClose: () => void;
}

export default function AssignmentDetailsModal({ assignment, onClose }: AssignmentDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-glass p-6 w-full max-w-md animate-scale-in">
        <h2 className="text-xl font-bold text-edusync-primary mb-4">
          {assignment.status === "Graded" ? "Grade Details" : "Submission Details"}
        </h2>
        
        <div className="space-y-4 mb-6 text-left">
          <div>
            <p className="text-sm text-gray-500">Assignment Title</p>
            <p className="font-medium text-gray-800">{assignment.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Course</p>
            <p className="font-medium text-gray-800">{assignment.course}</p>
          </div>
          <hr/>
          
          {/* Conditional View for "Submitted" */}
          {assignment.status === 'Submitted' && (
            <>
              <div>
                <p className="text-sm text-gray-500">Your Submission Title</p>
                <p className="font-medium text-gray-800">{assignment.submissionTitle || 'No title provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submission Link</p>
                <a 
                  href={assignment.submissionLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-medium text-edusync-primary hover:underline break-all flex items-center gap-1"
                >
                  {assignment.submissionLink} <ExternalLink size={14}/>
                </a>
              </div>
            </>
          )}
          
          {/* Conditional View for "Graded" */}
          {assignment.status === 'Graded' && (
            <>
              {assignment.grade != null ? (
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-sm text-gray-500">Grade</p>
                  <p className="text-lg font-bold text-green-500">{assignment.grade}</p>
                </div>
              ) : (
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <p className="text-sm font-bold text-red-500">Grade not available.</p>
                </div>
              )}
              {assignment.instructorNotes && (
                <div className="p-3 bg-blue-500/10 rounded-lg mt-4">
                  <p className="text-sm text-gray-500">Instructor Notes</p>
                  <p className="font-medium text-gray-800 whitespace-pre-wrap">{assignment.instructorNotes}</p>
                </div>
              )}
            </>
          )}
        </div>
        
        <button 
          onClick={onClose} 
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}
