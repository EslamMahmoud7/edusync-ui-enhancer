
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
    const response = await api.put(`/api/Quiz/${quizId}`, data);
    return response.data;
  },

  deleteQuiz: async (quizId: string): Promise<void> => {
    await api.delete(`/api/Quiz/${quizId}`);
  },

  getQuizForInstructor: async (quizId: string): Promise<QuizDTO> => {
    const response = await api.get(`/api/Quiz/${quizId}/instructor-view`);
    return response.data;
  },

  getMyQuizzesAsInstructor: async (): Promise<QuizDTO[]> => {
    const response = await api.get('/api/Quiz/instructor/my-quizzes');
    return response.data;
  },

  addQuizModel: async (data: UploadQuizModelCsvDTO): Promise<QuizModelDTO> => {
    const formData = new FormData();
    formData.append('quizId', data.quizId);
    formData.append('modelIdentifier', data.modelIdentifier);
    formData.append('csvFile', data.csvFile);
    
    const response = await api.post('/api/Quiz/models', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllAttemptsForQuiz: async (quizId: string): Promise<QuizAttemptResultDTO[]> => {
    const response = await api.get(`/api/Quiz/${quizId}/attempts/all`);
    return response.data;
  },

  getStudentAttemptForInstructor: async (attemptId: string): Promise<QuizAttemptResultDTO> => {
    const response = await api.get(`/api/Quiz/attempts/${attemptId}/instructor-view`);
    return response.data;
  },

  // Student endpoints
  getAvailableQuizzesForStudent: async (): Promise<StudentQuizListItemDTO[]> => {
    const response = await api.get('/api/Quiz/student/available');
    return response.data;
  },

  startQuizAttempt: async (quizId: string): Promise<StudentQuizAttemptDTO> => {
    const response = await api.post(`/api/Quiz/${quizId}/start`);
    return response.data;
  },

  resumeQuizAttempt: async (quizId: string): Promise<StudentQuizAttemptDTO> => {
    const response = await api.get(`/api/Quiz/${quizId}/resume`);
    return response.data;
  },

  submitQuizAttempt: async (submission: StudentQuizSubmissionDTO): Promise<QuizAttemptResultDTO> => {
    const response = await api.post('/api/Quiz/attempt/submit', submission);
    return response.data;
  },

  getQuizAttemptResult: async (attemptId: string): Promise<QuizAttemptResultDTO> => {
    const response = await api.get(`/api/Quiz/attempt/${attemptId}/result`);
    return response.data;
  }
};
