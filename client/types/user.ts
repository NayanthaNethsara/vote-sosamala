export type UserRole = "guest" | "admin" | "super-admin";

export interface MeResponse {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
}

export interface SystemUser {
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserListFilters {
  role: UserRole | null;
}

export interface UserListResponse {
  users: SystemUser[];
  pagination: UserListPagination;
  filters: UserListFilters;
}
