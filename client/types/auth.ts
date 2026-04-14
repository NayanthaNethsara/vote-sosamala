import type { User } from "firebase/auth";

export type AuthUser = User & {
  role?: "guest" | "admin" | "super-admin";
};

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
