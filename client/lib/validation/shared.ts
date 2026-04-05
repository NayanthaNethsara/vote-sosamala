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

export const dateYyyyMmDdSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");
