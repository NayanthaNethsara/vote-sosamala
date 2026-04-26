import { z } from "zod";
import { contestantCategories } from "@/config/contestants";

const contestantBaseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  student_id: z.string().trim().min(1, "Student ID is required").max(50),
  bio: z.string().trim().min(1, "Bio is required").max(500),
  faculty: z.string().trim().min(1, "Faculty is required").max(100),
  academic_year: z.string().trim().max(50).optional().or(z.literal("")),
  category: z.enum(contestantCategories),
  active: z.enum(["true", "false"]),
});

export const contestantCreateSchema = contestantBaseSchema;

export const contestantUpdateSchema = contestantBaseSchema.extend({
  id: z.string().uuid(),
});

export const contestantDeleteSchema = z.object({
  id: z.string().uuid(),
});

export type ContestantCreateInput = z.infer<typeof contestantCreateSchema>;
export type ContestantUpdateInput = z.infer<typeof contestantUpdateSchema>;
export type ContestantDeleteInput = z.infer<typeof contestantDeleteSchema>;
