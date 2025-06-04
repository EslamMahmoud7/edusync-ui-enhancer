
import api from './api';

export interface SubmittedAssignmentDTO {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  submissionTitle: string;
  submissionLink: string;
  submissionDate: string;
  grade?: number;
  instructorNotes?: string;
}

export interface SubmitAssignmentDTO {
  assignmentId: string;
  studentId: string;
  title: string;
  submissionLink: string;
}

export interface GradeSubmittedAssignmentDTO {
  grade: number;
  instructorNotes?: string;
}

export const submittedAssignmentService = {
  // Submit assignment
  submit: async (data: SubmitAssignmentDTO): Promise<SubmittedAssignmentDTO> => {
    const response = await api.post('/api/SubmittedAssignments/submit', data);
    return response.data;
  },

  // Get submissions for instructor
  getForInstructor: async (instructorId: string): Promise<SubmittedAssignmentDTO[]> => {
    const response = await api.get(`/api/SubmittedAssignments/instructor/${instructorId}`);
    return response.data;
  },

  // Get submissions for student
  getForStudent: async (studentId: string, assignmentId?: string): Promise<SubmittedAssignmentDTO[]> => {
    const url = `/api/SubmittedAssignments/student/${studentId}`;
    const params = assignmentId ? { assignmentId } : {};
    const response = await api.get(url, { params });
    return response.data;
  },

  // Grade submission
  grade: async (submissionId: string, data: GradeSubmittedAssignmentDTO): Promise<SubmittedAssignmentDTO> => {
    const response = await api.put(`/api/SubmittedAssignments/${submissionId}/grade`, data);
    return response.data;
  },

  // Get submission by ID
  getById: async (id: string): Promise<SubmittedAssignmentDTO> => {
    const response = await api.get(`/api/SubmittedAssignments/${id}`);
    return response.data;
  }
};
