import type { ContestantCategory } from "@/config/contestants";

export type { ContestantCategory };

export type Contestant = {
  id: string;
  name: string;
  student_id: string;
  bio: string | null;
  faculty: string;
  academic_year: string | null;
  image_url: string;
  active: boolean;
  vote_count: number;
  category: ContestantCategory;
  slug: string;
  created_at: string;
  updated_at: string;
};
