import type { User } from "firebase/auth";

export type AuthUser = User;
export type AuthRole = "guest" | "admin" | "super-admin";

export interface AuthContextValue {
  user: AuthUser | null;
  role: AuthRole;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
