
export interface QuizDTO {
  id: string;
  title: string;
  description: string;
  groupId: string;
  groupLabel: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  dueDate: string;
  isPublished: boolean;
  maxAttempts: number;
  timeLimit: number;
  totalModels: number;
  createdAt: string;
}

export interface CreateQuizDTO {
  title: string;
  description: string;
  groupId: string;
  instructorId: string;
  dueDate: string;
  maxAttempts: number;
  timeLimit: number;
}

export interface UpdateQuizDTO {
  title?: string;
  description?: string;
  dueDate?: string;
  maxAttempts?: number;
  timeLimit?: number;
  isPublished?: boolean;
  requestingInstructorId: string;
}

export interface QuizModelDTO {
  id: string;
  quizId: string;
  modelIdentifier: string;
  totalQuestions: number;
  createdAt: string;
}

export interface UploadQuizModelCsvDTO {
  modelIdentifier: string;
  instructorId: string;
  csvFile: File;
}

export interface StudentQuizListItemDTO {
  id: string;
  title: string;
  groupLabel: string;
  courseTitle: string;
  dueDate: string;
  maxAttempts: number;
  attemptsMade: number;
  lastAttemptStatus: AttemptStatus;
  canAttempt: boolean;
  timeLimit: number;
}

export interface StudentQuizAttemptDTO {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  startTime: string;
  expectedEndTime: string;
  questions: QuestionDTO[];
  currentAnswers: { [questionId: string]: number };
}

export interface QuestionDTO {
  id: string;
  questionText: string;
  options: string[];
  points: number;
}

export interface StudentQuizSubmissionDTO {
  attemptId: string;
  studentId: string;
  answers: { [questionId: string]: number };
}

export interface QuizAttemptResultDTO {
  attemptId: string;
  quizTitle: string;
  studentName: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
  questions: QuestionResultDTO[];
}

export interface QuestionResultDTO {
  questionText: string;
  studentAnswer: number;
  correctAnswer: number;
  points: number;
  earnedPoints: number;
  isCorrect: boolean;
  options: string[];
}

export interface UserActionByIdDTO {
  studentId: string;
}

export enum AttemptStatus {
  InProgress = 0,
  Submitted = 1,
  Graded = 2
}
