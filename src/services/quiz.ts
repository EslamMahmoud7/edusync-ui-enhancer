
import api from './api';
import type { 
  QuizDTO, 
  CreateQuizDTO, 
  UpdateQuizDTO,
  QuizModelDTO,
  UploadQuizModelCsvDTO,
  StudentQuizListItemDTO,
  StudentQuizAttemptDTO,
  StudentQuizSubmissionDTO,
  QuizAttemptResultDTO
} from '../types/quiz';

export const quizService = {
  // Instructor endpoints
  createQuiz: async (data: CreateQuizDTO): Promise<QuizDTO> => {
    const response = await api.post('/api/Quiz', data);
    return response.data;
  },

  updateQuiz: async (quizId: string, data: UpdateQuizDTO): Promise<QuizDTO> => {
    const userString = localStorage.getItem('eduSyncUser');
    const user = userString ? JSON.parse(userString) : null;
    const dataWithInstructor = { ...data, requestingInstructorId: user?.id };
    
    const response = await api.put(`/api/Quiz/${quizId}`, dataWithInstructor);
    return response.data;
  },

  deleteQuiz: async (quizId: string): Promise<void> => {
    const userString = localStorage.getItem('eduSyncUser');
    const user = userString ? JSON.parse(userString) : null;
    
    await api.delete(`/api/Quiz/${quizId}?instructorId=${user?.id}`);
  },

  getQuizForInstructor: async (quizId: string): Promise<QuizDTO> => {
    const userString = localStorage.getItem('eduSyncUser');
    const user = userString ? JSON.parse(userString) : null;
    
    const response = await api.get(`/api/Quiz/${quizId}/instructor-view?instructorId=${user?.id}`);
    return response.data;
  },

  getMyQuizzesAsInstructor: async (): Promise<QuizDTO[]> => {
    const userString = localStorage.getItem('eduSyncUser');
    const user = userString ? JSON.parse(userString) : null;
    
    const response = await api.get(`/api/Quiz/instructor/my-quizzes?instructorId=${user?.id}`);
    return response.data;
  },

  addQuizModel: async (data: UploadQuizModelCsvDTO): Promise<QuizModelDTO> => {
    const userString = localStorage.getItem('eduSyncUser');
    const user = userString ? JSON.parse(userString) : null;
    
    const formData = new FormData();
    formData.append('quizId', data.quizId);
    formData.append('modelIdentifier', data.modelIdentifier);
    formData.append('csvFile', data.csvFile);
    formData.append('requestingInstructorId', user?.id || '');
    
    const response = await api.post('/api/Quiz/models', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllAttemptsForQuiz: async (quizId: string): Promise<QuizAttemptResultDTO[]> => {
    const userString = localStorage.getItem('eduSyncUser');
    const user = userString ? JSON.parse(userString) : null;
    
    const response = await api.get(`/api/Quiz/${quizId}/attempts/all?instructorId=${user?.id}`);
    return response.data;
  },

  getStudentAttemptForInstructor: async (attemptId: string): Promise<QuizAttemptResultDTO> => {
    const userString = localStorage.getItem('eduSyncUser');
    const user = userString ? JSON.parse(userString) : null;
    
    const response = await api.get(`/api/Quiz/attempts/${attemptId}/instructor-view?instructorId=${user?.id}`);
    return response.data;
  },

  // Student endpoints
  getAvailableQuizzesForStudent: async (): Promise<StudentQuizListItemDTO[]> => {
    const userString = localStorage.getItem('eduSyncUser');
    const user = userString ? JSON.parse(userString) : null;
    
    const response = await api.get(`/api/Quiz/student/available?studentId=${user?.id}`);
    return response.data;
  },

  startQuizAttempt: async (quizId: string): Promise<StudentQuizAttemptDTO> => {
    const userString = localStorage.getItem('eduSyncUser');
    const user = userString ? JSON.parse(userString) : null;
    
    const response = await api.post(`/api/Quiz/${quizId}/start`, { studentId: user?.id });
    return response.data;
  },

  resumeQuizAttempt: async (quizId: string): Promise<StudentQuizAttemptDTO> => {
    const userString = localStorage.getItem('eduSyncUser');
    const user = userString ? JSON.parse(userString) : null;
    
    const response = await api.get(`/api/Quiz/${quizId}/resume?studentId=${user?.id}`);
    return response.data;
  },

  submitQuizAttempt: async (submission: StudentQuizSubmissionDTO): Promise<QuizAttemptResultDTO> => {
    const userString = localStorage.getItem('eduSyncUser');
    const user = userString ? JSON.parse(userString) : null;
    
    const submissionWithStudent = { ...submission, requestingStudentId: user?.id };
    const response = await api.post('/api/Quiz/attempt/submit', submissionWithStudent);
    return response.data;
  },

  getQuizAttemptResult: async (attemptId: string): Promise<QuizAttemptResultDTO> => {
    const userString = localStorage.getItem('eduSyncUser');
    const user = userString ? JSON.parse(userString) : null;
    
    const response = await api.get(`/api/Quiz/attempt/${attemptId}/result?studentId=${user?.id}`);
    return response.data;
  }
};
