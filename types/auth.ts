import type { User, Session } from "@supabase/supabase-js";

export type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

export type AuthCallbackResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string };

export type SignInResult =
  | { success: true; redirectUrl: string }
  | { success: false; error: string };

export type SignOutResult =
  | { success: true }
  | { success: false; error: string };
