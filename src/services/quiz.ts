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

  createQuiz: async (data: CreateQuizDTO): Promise<QuizDTO> => {
    const response = await api.post('/api/Quiz', data);
    return response.data;
  },

  updateQuiz: async (quizId: string, data: UpdateQuizDTO): Promise<QuizDTO> => {
    const response = await api.put(`/api/Quiz/${quizId}`, data);
    return response.data;
  },

  deleteQuiz: async (quizId: string, instructorId: string): Promise<void> => {
    await api.delete(`/api/Quiz/${quizId}?instructorId=${instructorId}`);
  },

  getQuizForInstructor: async (quizId: string, instructorId: string): Promise<QuizDTO> => {
    const response = await api.get(`/api/Quiz/${quizId}/instructor-view?instructorId=${instructorId}`);
    return response.data;
  },

  getMyQuizzesAsInstructor: async (instructorId: string): Promise<QuizDTO[]> => {
    const response = await api.get(`/api/Quiz/instructor/my-quizzes?instructorId=${instructorId}`);
    return response.data;
  },

  addQuizModel: async (data: UploadQuizModelCsvDTO): Promise<QuizModelDTO> => {
    const formData = new FormData();
    formData.append('quizId', data.quizId);
    formData.append('modelIdentifier', data.modelIdentifier);
    formData.append('csvFile', data.csvFile);
    formData.append('requestingInstructorId', data.requestingInstructorId);
    
    const response = await api.post('/api/Quiz/models', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllAttemptsForQuiz: async (quizId: string, instructorId: string): Promise<QuizAttemptResultDTO[]> => {
    const response = await api.get(`/api/Quiz/${quizId}/attempts/all?instructorId=${instructorId}`);
    return response.data;
  },

  getStudentAttemptForInstructor: async (attemptId: string, instructorId: string): Promise<QuizAttemptResultDTO> => {
    const response = await api.get(`/api/Quiz/attempts/${attemptId}/instructor-view?instructorId=${instructorId}`);
    return response.data;
  },


  getAvailableQuizzes: async (studentId: string): Promise<StudentQuizListItemDTO[]> => {
    const response = await api.get(`/api/Quiz/student/available?studentId=${studentId}`);
    return response.data;
  },
  
  startQuizAttempt: async (quizId: string, studentId: string): Promise<StudentQuizAttemptDTO> => {
    const response = await api.post(`/api/Quiz/${quizId}/start`, { studentId });
    return response.data;
  },
  
  resumeQuizAttempt: async (quizId: string, studentId: string): Promise<StudentQuizAttemptDTO> => {
    const response = await api.get(`/api/Quiz/${quizId}/resume?studentId=${studentId}`);
    return response.data;
  },
  
  submitQuizAttempt: async (submission: StudentQuizSubmissionDTO): Promise<QuizAttemptResultDTO> => {
    const response = await api.post('/api/Quiz/attempt/submit', submission);
    return response.data;
  },
  
  getQuizAttemptResult: async (attemptId: string, studentId: string): Promise<QuizAttemptResultDTO> => {
    const response = await api.get(`/api/Quiz/attempt/${attemptId}/result?studentId=${studentId}`);
    return response.data;
  }
};