export const contestantCategories = ["male", "female"] as const;

export type ContestantCategory = (typeof contestantCategories)[number];

export const contestantFaculties = [
  "computing",
  "humanity and science",
  "business",
  "engineering",
] as const;

export type ContestantFaculty = (typeof contestantFaculties)[number];

export const contestantAcademicYears = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
] as const;

export type ContestantAcademicYear = (typeof contestantAcademicYears)[number];

export const contestantCategoryLabels: Record<ContestantCategory, string> = {
  male: "Male",
  female: "Female",
};

export const contestantFacultyLabels: Record<ContestantFaculty, string> = {
  computing: "Computing",
  "humanity and science": "Humanity and Science",
  business: "Business",
  engineering: "Engineering",
};
