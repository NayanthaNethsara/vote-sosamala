export const contestantCategories = ["male", "female"] as const;

export type ContestantCategory = (typeof contestantCategories)[number];

export const contestantCategoryLabels: Record<ContestantCategory, string> = {
  male: "Male",
  female: "Female",
};
