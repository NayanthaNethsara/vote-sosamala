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

export interface ContestantListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PublicContestantListResponse {
  contestants: Contestant[];
  pagination: ContestantListPagination;
}
