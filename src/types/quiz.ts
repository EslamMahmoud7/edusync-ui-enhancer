
export interface QuizDTO {
  id: string;
  title: string;
  description: string;
  groupId: string;
  groupLabel: string;
  dueDate: string;
  durationMinutes: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  isPublished: boolean;
  numberOfModels: number;
  models: QuizModelDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizDTO {
  title: string;
  description: string;
  groupId: string;
  dueDate: string;
  durationMinutes: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  isPublished: boolean;
}

export interface UpdateQuizDTO {
  title?: string;
  description?: string;
  dueDate?: string;
  durationMinutes?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  isPublished?: boolean;
}

export interface QuizModelDTO {
  id: string;
  quizId: string;
  modelIdentifier: string;
  questions: QuestionDTO[];
  createdAt: string;
}

export interface UploadQuizModelCsvDTO {
  quizId: string;
  modelIdentifier: string;
  csvFile: File;
}

export interface QuestionDTO {
  id: string;
  text: string;
  points: number;
  options: QuestionOptionDTO[];
}

export interface QuestionOptionDTO {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface StudentQuizListItemDTO {
  quizId: string;
  title: string;
  courseTitle: string;
  description: string;
  dueDate: string;
  maxAttempts: number;
  attemptsMade: number;
  lastAttemptStatus: string;
}

export interface StudentQuizAttemptDTO {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  durationMinutes: number;
  startTime: string;
  questions: QuestionDTO[];
  studentAnswers: StudentAnswerDTO[];
}

export interface StudentAnswerDTO {
  questionId: string;
  selectedOptionId?: string;
}

export interface StudentQuizSubmissionDTO {
  attemptId: string;
  answers: StudentAnswerDTO[];
}

export interface QuizAttemptResultDTO {
  attemptId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  startTime: string;
  endTime?: string;
  score: number;
  totalPointsPossible: number;
  status: string;
  answerResults: AnswerResultDTO[];
}

export interface AnswerResultDTO {
  questionId: string;
  questionText: string;
  pointsPossibleForQuestion: number;
  selectedOptionText?: string;
  correctOptionText: string;
  pointsAwarded: number;
  isCorrect: boolean;
}
