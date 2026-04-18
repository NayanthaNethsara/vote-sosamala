import type { Contestant } from "@/types/contestant";
import type {
  ContestantCategory,
  ContestantCategoryConfig,
  ContestantCategoryRouteSlug,
} from "@/types/contestant-category";

const contestantCategoryRouteSlugs: Record<
  ContestantCategory,
  ContestantCategoryRouteSlug
> = {
  male: "mr",
  female: "ms",
};

const contestantCategoryConfig: Record<
  ContestantCategory,
  ContestantCategoryConfig
> = {
  male: {
    gender: "male",
    badgeLabel: "Mr Showcase",
    title: "Vote for Mr Sosamala 2026",
    description:
      "Discover the leading contestants shaping this year's stage. Browse profiles and cast your vote for the one who stands out.",
    detailBasePath: `/${contestantCategoryRouteSlugs.male}`,
  },
  female: {
    gender: "female",
    badgeLabel: "Ms Showcase",
    title: "Vote for Ms Sosamala 2026",
    description:
      "A curated spotlight of this season's most inspiring contestants. Meet the finalists and support your favorite with confidence.",
    detailBasePath: `/${contestantCategoryRouteSlugs.female}`,
  },
};

export function parseContestantCategoryRoute(
  value: string,
): ContestantCategory | null {
  const matchedCategory = (Object.entries(contestantCategoryRouteSlugs).find(
    ([, routeSlug]) => routeSlug === value,
  ) ?? [null])[0] as ContestantCategory | null;

  if (matchedCategory) {
    return matchedCategory;
  }

  return null;
}

export function getContestantCategoryRouteSlug(
  category: ContestantCategory,
): ContestantCategoryRouteSlug {
  return contestantCategoryRouteSlugs[category];
}

export function getContestantCategories(): ContestantCategory[] {
  return Object.keys(contestantCategoryRouteSlugs) as ContestantCategory[];
}

export function getContestantCategoryConfig(
  category: ContestantCategory,
): ContestantCategoryConfig {
  return contestantCategoryConfig[category];
}

export function isContestantInCategory(
  contestant: Contestant,
  category: ContestantCategory,
): boolean {
  return (
    contestant.gender.trim().toLowerCase() ===
    getContestantCategoryConfig(category).gender
  );
}

export function filterContestantsByCategory(
  contestants: Contestant[],
  category: ContestantCategory,
): Contestant[] {
  return contestants.filter((contestant) =>
    isContestantInCategory(contestant, category),
  );
}
