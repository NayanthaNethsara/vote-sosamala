import { z } from "zod";

export const contestantGenderValues = ["male", "female"] as const;

export const contestantAcademicYearValues = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
] as const;

export const contestantSemesterValues = [
  "1st Semester",
  "2nd Semester",
] as const;

export const dateYyyyMmDdSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");
