export type UserRole = "guest" | "admin";

export type User = {
  id: string; // Matches auth.users(id)
  role: UserRole;
  has_voted: boolean;
  created_at: string;
  updated_at: string;
};
