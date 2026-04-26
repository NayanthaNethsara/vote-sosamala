export type Vote = {
  id: number;
  user_id: string;
  contestant_id: string;
  category: "male" | "female";
  created_at: string;
};
