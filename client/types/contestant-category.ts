export type ContestantCategory = "male" | "female";

export type ContestantCategoryRouteSlug = "mr" | "ms";

export const contestantCategoryVoteLabelByRouteSlug: Record<
  ContestantCategoryRouteSlug,
  "Mr" | "Miss"
> = {
  mr: "Mr",
  ms: "Miss",
};

export interface ContestantCategoryConfig {
  gender: ContestantCategory;
  badgeLabel: string;
  title: string;
  description: string;
  detailBasePath: `/${ContestantCategoryRouteSlug}`;
}
