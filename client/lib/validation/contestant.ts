import { z } from "zod";

import {
  contestantAcademicYearValues,
  contestantGenderValues,
  dateYyyyMmDdSchema,
} from "@/lib/validation/shared";

export const contestantFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  nicOrStudentId: z.string().trim().min(1, "NIC or Student ID is required"),
  birthday: dateYyyyMmDdSchema.optional(),
  gender: z.enum(contestantGenderValues).optional(),
  academicYear: z.enum(contestantAcademicYearValues).optional(),
});

export const contestantInputSchema = contestantFormSchema.extend({
  photoUrl: z.string().url().optional(),
});

export const contestantSchema = contestantInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const contestantListSchema = z.array(contestantSchema);

export type ContestantFormValues = z.infer<typeof contestantFormSchema>;
