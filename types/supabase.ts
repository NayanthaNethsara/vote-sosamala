import { User, UserRole } from "./user";
import { Contestant, ContestantCategory } from "./contestant";
import { Vote } from "./vote";

// Database interface for use with Supabase Client
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<User, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      contestants: {
        Row: Contestant;
        Insert: Omit<
          Contestant,
          "id" | "created_at" | "updated_at" | "vote_count"
        > & {
          id?: string;
          vote_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Contestant, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      votes: {
        Row: Vote;
        Insert: Omit<Vote, "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Omit<Vote, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      recalculate_vote_counts: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      contestant_category: ContestantCategory;
    };
  };
};
