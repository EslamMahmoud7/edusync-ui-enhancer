import { useState, useEffect } from "react";
import { Search, FileText, Calendar, Clock, CheckCircle2, AlertCircle, ExternalLink, Edit3, Trash2 } from "lucide-react";
import api from "../../services/api";
import SubmitAssignmentModal from "../../components/SubmitAssignmentModal";
import { submittedAssignmentService, UpdateSubmissionDTO } from "../../services/submittedAssignment";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const fetchAssignments = async (): Promise<Assignment[]> => {
  const stored = localStorage.getItem("eduSyncUser");
  if (!stored) throw new Error("Not logged in");
  const { id: studentId, token } = JSON.parse(stored);

  const { data } = await api.get<Array<any>>(`/api/assignment/student/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data.map((a) => {
    let derivedStatus: "Pending" | "Submitted" | "Graded";
    if (a.grade != null) {
      derivedStatus = "Graded";
    } else if (a.submissionLink) {
      derivedStatus = "Submitted";
    } else {
      derivedStatus = "Pending";
    }
    return {
      id: a.id,
      title: a.title,
      course: a.courseTitle,
      dueDate: new Date(a.dueDate).toLocaleDateString(),
      status: derivedStatus,
      submissionDate: a.submissionDate ? new Date(a.submissionDate).toLocaleDateString() : undefined,
      grade: a.grade,
      submissionTitle: a.submissionTitle,
      submissionLink: a.submissionLink,
      instructorNotes: a.instructorNotes,
      submissionId: a.submissionId, 
    };
  });
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filtered, setFiltered] = useState<Assignment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [assignmentToSubmit, setAssignmentToSubmit] = useState<{ id: string; title: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState({ id: '', title: '', submissionLink: '' });

  const loadAssignments = () => {
    setLoading(true);
    fetchAssignments()
      .then((data) => {
        setAssignments(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAssignments(); }, []);

  useEffect(() => {
    let data = assignments;
    if (filterStatus !== "All") { data = data.filter((a) => a.status === filterStatus); }
    if (searchTerm) { data = data.filter((a) => a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.course.toLowerCase().includes(searchTerm.toLowerCase())); }
    setFiltered(data);
  }, [assignments, filterStatus, searchTerm]);

  const handleOpenSubmitModal = (assignment: Assignment) => {
    setAssignmentToSubmit({ id: assignment.id, title: assignment.title });
    setIsSubmitModalOpen(true);
  };

  const handleSubmitSuccess = () => {
    setIsSubmitModalOpen(false);
    setAssignmentToSubmit(null);
    loadAssignments();
  };

  const handleEditSubmission = (assignment: Assignment) => {
    if (assignment.submissionId) {
      setEditingSubmission({
        id: assignment.submissionId,
        title: assignment.submissionTitle || '',
        submissionLink: assignment.submissionLink || ''
      });
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateSubmission = async () => {
    try {
      const updateData: UpdateSubmissionDTO = {
        title: editingSubmission.title,
        submissionLink: editingSubmission.submissionLink
      };
      await submittedAssignmentService.update(editingSubmission.id, updateData);
      setIsEditModalOpen(false);
      loadAssignments();
    } catch (error: any) {
      console.error('Error updating submission:', error);
    }
  };

  const handleDeleteSubmission = async (submissionId?: string) => {
    if (!submissionId) return;
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }
    try {
      await submittedAssignmentService.delete(submissionId);
      loadAssignments();
    } catch (error: any) {
      console.error('Error deleting submission:', error);
    }
  };

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
    Pending: assignments.filter((a) => a.status === "Pending").length,
    Submitted: assignments.filter((a) => a.status === "Submitted").length,
    Graded: assignments.filter((a) => a.status === "Graded").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-edusync-primary to-edusync-accent bg-clip-text text-transparent">Assignments</h1>
        <div className="text-sm text-gray-500">{filtered.length} assignment{filtered.length !== 1 ? "s" : ""} found</div>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {(["All", "Pending", "Submitted", "Graded"] as const).map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)} className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${filterStatus === status ? "bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white shadow-lg" : "bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200/50 hover:bg-edusync-primary/5 hover:border-edusync-primary/20"}`}>
              {status}
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white/20">{statusCounts[status]}</span>
            </button>
          ))}
        </div>
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
          <input type="text" placeholder="Search assignments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-edusync-primary/20 focus:border-edusync-primary transition-all duration-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((assignment) => {
          const statusConfig = {
            Submitted: { borderColor: "border-blue-500", bgColor: "bg-blue-500/5", textColor: "text-blue-500", icon: <Clock className="w-4 h-4" /> },
            Graded: { borderColor: "border-green-500", bgColor: "bg-green-500/5", textColor: "text-green-500", icon: <CheckCircle2 className="w-4 h-4" /> },
            Pending: { borderColor: "border-orange-500", bgColor: "bg-orange-500/5", textColor: "text-orange-500", icon: <AlertCircle className="w-4 h-4" /> }
          }[assignment.status];
          return (
            <div key={assignment.id} className={`group bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft border-l-4 ${statusConfig.borderColor} p-6 flex flex-col justify-between hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
                    {statusConfig.icon}
                    <span className={`text-sm font-medium ${statusConfig.textColor}`}>{assignment.status}</span>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400 group-hover:text-edusync-primary" />
                </div>
                <div className="space-y-3 mb-6">
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-edusync-primary">{assignment.title}</h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm"><FileText className="w-4 h-4 text-edusync-primary/50" />{assignment.course}</div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm"><Calendar className="w-4 h-4 text-edusync-secondary/50" />Due: {assignment.dueDate}</div>
                  {assignment.submissionDate && <div className="flex items-center gap-2 text-gray-600 text-sm"><Clock className="w-4 h-4 text-blue-500/50" />Submitted: {assignment.submissionDate}</div>}
                  {assignment.status === "Graded" && assignment.grade != null && <div className="p-3 bg-green-500/10 rounded-lg text-sm font-bold text-green-500">Grade: {assignment.grade}</div>}
                </div>
              </div>
              <div className="space-y-2">
                <Button onClick={() => { assignment.status === "Pending" ? handleOpenSubmitModal(assignment) : setSelected(assignment); }} className="w-full bg-gradient-to-r from-edusync-primary to-edusync-secondary">{assignment.status === "Pending" ? "Submit Assignment" : (assignment.status === "Graded" ? "View Grade" : "View Submission")}</Button>
                {assignment.status === "Submitted" && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleEditSubmission(assignment)} className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700"><Edit3 className="w-4 h-4 mr-2" />Edit</Button>
                    <Button variant="outline" onClick={() => handleDeleteSubmission(assignment.submissionId)} className="flex-1 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{selected.status === "Graded" ? "Grade Details" : "Submission Details"}</DialogTitle></DialogHeader>
            <div className="space-y-4 text-left">
              <div><p className="text-sm text-muted-foreground">Assignment Title</p><p className="font-medium">{selected.title}</p></div>
              <div><p className="text-sm text-muted-foreground">Course</p><p className="font-medium">{selected.course}</p></div>
              <hr/>
              {selected.status === 'Submitted' && (<>
                  <div><p className="text-sm text-muted-foreground">Your Submission Title</p><p className="font-medium">{selected.submissionTitle || 'No title provided'}</p></div>
                  <div><p className="text-sm text-muted-foreground">Submission Link</p><a href={selected.submissionLink} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline break-all flex items-center gap-1">{selected.submissionLink} <ExternalLink size={14}/></a></div>
              </>)}
              {selected.status === 'Graded' && (<>
                  {selected.grade != null ? (<div className="p-3 bg-green-500/10 rounded-lg"><p className="text-sm text-muted-foreground">Grade</p><p className="text-lg font-bold text-green-600">{selected.grade}</p></div>) : (<div className="p-3 bg-red-500/10 rounded-lg"><p className="text-sm font-bold text-red-600">Grade not available.</p></div>)}
                  {selected.instructorNotes && (<div className="p-3 bg-blue-500/10 rounded-lg mt-4"><p className="text-sm text-muted-foreground">Instructor Notes</p><p className="font-medium whitespace-pre-wrap">{selected.instructorNotes}</p></div>)}
              </>)}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Edit3 className="h-5 w-5 text-primary" /> Edit Submission</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="edit-title">Submission Title</Label><Input id="edit-title" value={editingSubmission.title} onChange={(e) => setEditingSubmission({ ...editingSubmission, title: e.target.value })} placeholder="Enter submission title"/></div>
            <div><Label htmlFor="edit-link">Submission Link</Label><Input id="edit-link" type="url" value={editingSubmission.submissionLink} onChange={(e) => setEditingSubmission({ ...editingSubmission, submissionLink: e.target.value })} placeholder="https://drive.google.com/..."/></div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleUpdateSubmission} className="flex-1" disabled={!editingSubmission.title || !editingSubmission.submissionLink}>Update Submission</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isSubmitModalOpen && <SubmitAssignmentModal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} assignmentId={assignmentToSubmit!.id} assignmentTitle={assignmentToSubmit!.title} onSubmitSuccess={handleSubmitSuccess}/>}
    </div>
  );
}