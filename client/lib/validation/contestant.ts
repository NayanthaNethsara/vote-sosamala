import { z } from "zod";

import {
  contestantAcademicYearValues,
  contestantGenderValues,
  contestantSemesterValues,
  dateYyyyMmDdSchema,
} from "@/lib/validation/shared";

export const contestantFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  dateOfBirth: dateYyyyMmDdSchema,
  gender: z.enum(contestantGenderValues),
  academicYear: z.enum(contestantAcademicYearValues),
  semester: z.enum(contestantSemesterValues),
});

export const contestantInputSchema = contestantFormSchema.extend({
  photoURL: z.string().url().optional(),
});

export const contestantSchema = contestantInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const contestantListSchema = z.array(contestantSchema);

export type ContestantFormValues = z.infer<typeof contestantFormSchema>;
