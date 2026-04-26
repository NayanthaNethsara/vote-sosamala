import type { ContestantCategory } from "@/config/contestants";

export type Vote = {
  id: number;
  user_id: string;
  contestant_id: string;
  category: ContestantCategory;
  created_at: string;
};
