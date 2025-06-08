
export interface GroupDTO {
  id: string;
  label: string;
  name: string;
  courseTitle: string;
  courseId: string;
  instructorId: string;
  instructorName: string;
  capacity: number;
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupDTO {
  label: string;
  courseId: string;
  instructorId: string;
  capacity: number;
}

export interface UpdateGroupDTO {
  label?: string;
  capacity?: number;
}

export interface StudentInGroupDTO {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
}

export interface BulkGroupEnrollmentDTO {
  groupId: string;
  studentIds: string[];
}
