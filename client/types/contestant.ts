export interface Contestant {
  id: string;
  name: string;
  birthday?: string;
  nicOrStudentId: string;
  photoUrl?: string;
  gender?: string;
  academicYear?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContestantInput {
  name: string;
  birthday?: string;
  nicOrStudentId: string;
  photoUrl?: string;
  gender?: string;
  academicYear?: string;
}
