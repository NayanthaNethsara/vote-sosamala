import { z } from "zod";

export const contestantGenderValues = ["male", "female"] as const;

export const contestantAcademicYearValues = [
  "1st Year - 1st Semester",
  "1st Year - 2nd Semester",
  "2nd Year - 1st Semester",
  "2nd Year - 2nd Semester",
  "3rd Year - 1st Semester",
  "3rd Year - 2nd Semester",
  "4th Year - 1st Semester",
  "4th Year - 2nd Semester",
] as const;

const birthdaySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Birthday must be in YYYY-MM-DD format")
  .optional();

export const contestantFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  nicOrStudentId: z.string().trim().min(1, "NIC or Student ID is required"),
  birthday: birthdaySchema,
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
