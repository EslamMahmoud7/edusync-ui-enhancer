
export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: number; // 1: Student, 2: Admin, 3: Instructor
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: number;
}

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: number;
  isActive?: boolean;
}

export interface InstructorDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}