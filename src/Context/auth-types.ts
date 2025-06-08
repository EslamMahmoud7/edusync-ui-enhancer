export interface User {
  id: string;
  name: string;
  email: string;
  role: 0 | 1 | 2 | 3; 
  token: string;
}

export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  role: 0 | 1 | 2 | 3;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface CourseDto {
  id: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  resourceLink: string;
  level: number;
}

export interface GroupDTO {
  id: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  courseDescription: string;
  courseCredits: number;
  courseResourceLink: string;
  courseLevel: number;
  label: string;
  startTime: string;
  endTime: string;
  location: string;
  instructor: {
    id: string;
    fullName: string;
    email: string;
  };
  numberOfStudents: number;
}

export interface CreateGroupDTO {
  courseId: string;
  label: string;
  startTime: string;
  endTime: string;
  location: string;
  instructorId?: string;
}

export interface GroupEnrollmentDTO {
  studentId: string;
  groupId: string;
}

export interface AssignmentDTO {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 0 | 1 | 2;
  groupId: string;
  groupLabel: string;
  courseTitle: string;
}

export interface CreateAssignmentDTO {
  title: string;
  description: string;
  dueDate: string;
  groupId: string;
}
