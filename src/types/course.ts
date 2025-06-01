
export interface CourseDTO {
  id: string;
  title: string;
  description: string;
  credits: number;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDTO {
  title: string;
  description: string;
  credits: number;
  department: string;
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  credits?: number;
  department?: string;
}
