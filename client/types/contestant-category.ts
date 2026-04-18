export type ContestantCategory = "male" | "female";

export type ContestantCategoryRouteSlug = "mr" | "ms";

export interface ContestantCategoryConfig {
  gender: ContestantCategory;
  badgeLabel: string;
  title: string;
  description: string;
  detailBasePath: `/${ContestantCategoryRouteSlug}`;
}
