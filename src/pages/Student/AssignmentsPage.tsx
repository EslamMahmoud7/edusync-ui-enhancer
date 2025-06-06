
import { useState, useEffect } from "react";
import api from "../../services/api";
import SubmitAssignmentModal from "../../components/SubmitAssignmentModal";
import AssignmentCard from "../../components/AssignmentCard";
import AssignmentFilters from "../../components/AssignmentFilters";
import AssignmentDetailsModal from "../../components/AssignmentDetailsModal";
import EditSubmissionModal from "../../components/EditSubmissionModal";
import { submittedAssignmentService, UpdateSubmissionDTO } from "../../services/submittedAssignment";

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

  const { data } = await api.get<
    Array<{
      id: string;
      title: string;
      dueDate: string;
      courseTitle: string;
      submissionStatus: "Pending" | "Submitted" | "Graded";
      submissionDate?: string;
      grade?: number;
      submissionTitle?: string;
      submissionLink?: string;
      instructorNotes?: string;
    }>
  >(`/api/assignment/student/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data.map((a) => ({
    id: a.id,
    title: a.title,
    course: a.courseTitle,
    dueDate: new Date(a.dueDate).toLocaleDateString(),
    status: a.submissionStatus,
    submissionDate: a.submissionDate ? new Date(a.submissionDate).toLocaleDateString() : undefined,
    grade: a.grade,
    submissionTitle: a.submissionTitle,
    submissionLink: a.submissionLink,
    instructorNotes: a.instructorNotes,
  }));
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
  const [editingSubmission, setEditingSubmission] = useState({
    id: '',
    title: '',
    submissionLink: ''
  });

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

  const handleOpenSubmitModal = (assignment: Assignment) => {
    setAssignmentToSubmit({ id: assignment.id, title: assignment.title });
    setIsSubmitModalOpen(true);
  };

  const handleSubmitSuccess = () => {
    setLoading(true);
    fetchAssignments()
      .then((data) => {
        setAssignments(data);
      })
      .finally(() => {
        setLoading(false);
        setIsSubmitModalOpen(false);
        setAssignmentToSubmit(null);
      });
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
      
      setLoading(true);
      fetchAssignments()
        .then((data) => {
          setAssignments(data);
        })
        .finally(() => {
          setLoading(false);
          setIsEditModalOpen(false);
          setEditingSubmission({ id: '', title: '', submissionLink: '' });
        });
      
      alert('Submission updated successfully!');
    } catch (error) {
      console.error('Error updating submission:', error);
      alert('Error updating submission');
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      await submittedAssignmentService.delete(submissionId);
      
      setLoading(true);
      fetchAssignments()
        .then((data) => {
          setAssignments(data);
        })
        .finally(() => setLoading(false));
      
      alert('Submission deleted successfully!');
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Error deleting submission');
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
      <AssignmentFilters
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusCounts={statusCounts}
        filteredCount={filtered.length}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((assignment, index) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            index={index}
            onSubmit={handleOpenSubmitModal}
            onViewDetails={setSelected}
            onEdit={handleEditSubmission}
            onDelete={handleDeleteSubmission}
          />
        ))}
      </div>

      {selected && (
        <AssignmentDetailsModal
          assignment={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <EditSubmissionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editingSubmission={editingSubmission}
        setEditingSubmission={setEditingSubmission}
        onUpdate={handleUpdateSubmission}
      />

      {isSubmitModalOpen && assignmentToSubmit && (
        <SubmitAssignmentModal 
          isOpen={isSubmitModalOpen} 
          onClose={() => setIsSubmitModalOpen(false)} 
          assignmentId={assignmentToSubmit.id} 
          assignmentTitle={assignmentToSubmit.title} 
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}
