import { z } from "zod";

import {
  contestantAcademicYearValues,
  contestantGenderValues,
  contestantSemesterValues,
  dateYyyyMmDdSchema,
} from "@/lib/validation/shared";

const contestantBaseSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required"),
    dateOfBirth: dateYyyyMmDdSchema,
    gender: z.enum(contestantGenderValues),
    academicYear: z.enum(contestantAcademicYearValues),
    semester: z.enum(contestantSemesterValues),
    nic: z
      .string()
      .trim()
      .max(50, "NIC must be 50 characters or less")
      .optional(),
    studentId: z
      .string()
      .trim()
      .max(50, "Student ID must be 50 characters or less")
      .optional(),
  })
  .superRefine((value, ctx) => {
    const hasNIC = Boolean(value.nic?.trim());
    const hasStudentID = Boolean(value.studentId?.trim());

    if (!hasNIC && !hasStudentID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nic"],
        message: "Provide either NIC or Student ID",
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["studentId"],
        message: "Provide either Student ID or NIC",
      });
    }
  });

export const contestantFormSchema = contestantBaseSchema;

export const contestantInputSchema = contestantBaseSchema.extend({
  photoURL: z.string().url().optional(),
});

export const contestantSchema = contestantInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const contestantListSchema = z.array(contestantSchema);

export const publicContestantListResponseSchema = z.object({
  contestants: contestantListSchema,
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(100),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export type ContestantFormValues = z.infer<typeof contestantFormSchema>;
