
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
  QuizAttemptResultDTO,
  UserActionByIdDTO
} from '../types/quiz';

export const quizService = {
  getInstructorQuizzes: async (instructorId: string): Promise<QuizDTO[]> => {
    const response = await api.get(`/api/quiz/instructor/${instructorId}/my-quizzes`);
    return response.data;
  },

  getQuizForInstructor: async (quizId: string, instructorId: string): Promise<QuizDTO> => {
    const response = await api.get(`/api/quiz/${quizId}/instructor-view?instructorId=${instructorId}`);
    return response.data;
  },

  createQuiz: async (data: CreateQuizDTO): Promise<QuizDTO> => {
    const response = await api.post('/api/quiz', data);
    return response.data;
  },

  updateQuiz: async (quizId: string, data: UpdateQuizDTO): Promise<QuizDTO> => {
    const response = await api.put(`/api/quiz/${quizId}`, data);
    return response.data;
  },

  deleteQuiz: async (quizId: string, instructorId: string): Promise<void> => {
    await api.delete(`/api/quiz/${quizId}?instructorId=${instructorId}`);
  },

  getQuizModels: async (quizId: string): Promise<QuizModelDTO[]> => {
    const response = await api.get(`/api/quiz/${quizId}/models`);
    return response.data;
  },

  uploadQuizModel: async (quizId: string, data: UploadQuizModelCsvDTO): Promise<QuizModelDTO> => {
    const formData = new FormData();
    formData.append('ModelIdentifier', data.modelIdentifier);
    formData.append('InstructorId', data.instructorId);
    formData.append('CsvFile', data.csvFile);

    const response = await api.post(`/api/quiz/models`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getQuizAttempts: async (quizId: string, instructorId: string): Promise<QuizAttemptResultDTO[]> => {
    const response = await api.get(`/api/quiz/${quizId}/attempts/all?instructorId=${instructorId}`);
    return response.data;
  },

  getAvailableQuizzes: async (studentId: string): Promise<StudentQuizListItemDTO[]> => {
    const response = await api.get(`/api/quiz/student/${studentId}/available`);
    return response.data;
  },

  startQuiz: async (quizId: string, studentId: string): Promise<StudentQuizAttemptDTO> => {
    const response = await api.post(`/api/quiz/${quizId}/start`, { studentId });
    return response.data;
  },

  resumeQuiz: async (quizId: string, studentId: string): Promise<StudentQuizAttemptDTO> => {
    const response = await api.get(`/api/quiz/${quizId}/resume?studentId=${studentId}`);
    return response.data;
  },

  submitQuiz: async (data: StudentQuizSubmissionDTO): Promise<QuizAttemptResultDTO> => {
    const response = await api.post('/api/quiz/attempt/submit', data);
    return response.data;
  },

  getAttemptResult: async (attemptId: string, studentId: string): Promise<QuizAttemptResultDTO> => {
    const response = await api.get(`/api/quiz/attempt/${attemptId}/result?studentId=${studentId}`);
    return response.data;
  }
};
