import { z } from "zod";

import {
  contestantAcademicYearValues,
  contestantGenderValues,
  contestantSemesterValues,
  dateYyyyMmDdSchema,
} from "@/lib/validation/shared";
import { detectContestantIdentifierType } from "@/lib/utils/contestant-identifier";

const optionalNonEmptyStringSchema = z.string().trim().min(1).optional();

const nullableOptionalStringSchema = z.preprocess(
  (value) => (value === null ? undefined : value),
  optionalNonEmptyStringSchema,
);

const contestantCoreSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  dateOfBirth: dateYyyyMmDdSchema,
  gender: z.enum(contestantGenderValues),
  academicYear: z.enum(contestantAcademicYearValues),
  semester: z.enum(contestantSemesterValues),
});

const contestantInputBaseSchema = z
  .object({
    ...contestantCoreSchema.shape,
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

export const contestantFormSchema = z
  .object({
    ...contestantCoreSchema.shape,
    identifier: z
      .string()
      .trim()
      .min(1, "NIC or Student ID is required")
      .max(50, "Identifier must be 50 characters or less"),
  })
  .superRefine((value, ctx) => {
    if (!detectContestantIdentifierType(value.identifier)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["identifier"],
        message:
          "Enter a valid NIC or Student ID (e.g. 200310110894, 65859604V, IT23162600)",
      });
    }
  });

export const contestantInputSchema = contestantInputBaseSchema.extend({
  photoURL: z.string().url().optional(),
});

export const contestantSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required"),
  dateOfBirth: z.string().trim().min(1, "Date of birth is required"),
  photoURL: nullableOptionalStringSchema,
  gender: z.string().trim().min(1, "Gender is required"),
  academicYear: z.string().trim().min(1, "Academic year is required"),
  semester: z.string().trim().min(1, "Semester is required"),
  nic: nullableOptionalStringSchema,
  studentId: nullableOptionalStringSchema,
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
