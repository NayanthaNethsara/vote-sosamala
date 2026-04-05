export interface Contestant {
  id: string;
  name: string;
  dateOfBirth: string;
  photoURL?: string;
  gender: string;
  academicYear: string;
  semester: string;
  nic?: string;
  studentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContestantInput {
  name: string;
  dateOfBirth: string;
  photoURL?: string;
  gender: string;
  academicYear: string;
  semester: string;
  nic?: string;
  studentId?: string;
}
