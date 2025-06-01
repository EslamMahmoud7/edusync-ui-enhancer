
export interface GroupDTO {
  id: string;
  label: string;
  courseId: string;
  courseTitle: string;
  instructorId?: string;
  instructorName?: string;
  startTime: string;
  endTime: string;
  location: string;
  maxStudents: number;
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupDTO {
  label: string;
  courseId: string;
  instructorId?: string;
  startTime: string;
  endTime: string;
  location: string;
  maxStudents: number;
}

export interface UpdateGroupDTO {
  label?: string;
  courseId?: string;
  instructorId?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  maxStudents?: number;
}

export interface StudentInGroupDTO {
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrolledAt: string;
}

export interface BulkGroupEnrollmentDTO {
  groupId: string;
  studentIds: string[];
}
