import {
  filterContestantsByCategory,
  getContestantCategories,
  getContestantCategoryRouteSlug,
  isContestantInCategory,
} from "@/lib/contestant-categories";
import {
  getAllPublicContestants,
  getPublicContestantBySlug,
} from "@/lib/public-contestants";
import { createContestantSlug } from "@/lib/utils/contestant-slug";
import type {
  ContestantCategory,
  ContestantCategoryRouteSlug,
} from "@/types/contestant-category";
import type { Contestant } from "@/types/contestant";

export async function getCategoryContestants(
  category: ContestantCategory,
): Promise<Contestant[]> {
  const contestants = await getAllPublicContestants();
  return filterContestantsByCategory(contestants, category);
}

export async function getCategoryContestantBySlug(
  category: ContestantCategory,
  slug: string,
): Promise<Contestant | null> {
  const contestant = await getPublicContestantBySlug(slug);
  if (!contestant) {
    return null;
  }

  return isContestantInCategory(contestant, category) ? contestant : null;
}

export async function getCategoryStaticParams(
  category: ContestantCategory,
): Promise<Array<{ slug: string }>> {
  const contestants = await getCategoryContestants(category);

  return contestants.map((contestant) => ({
    slug: createContestantSlug({
      id: contestant.id,
      name: contestant.name,
      studentId: contestant.studentId,
      nic: contestant.nic,
    }),
  }));
}

export async function getAllCategoryStaticParams(): Promise<
  Array<{ category: ContestantCategoryRouteSlug; slug: string }>
> {
  const categories = getContestantCategories();
  const params = await Promise.all(
    categories.map(async (category) => {
      const routeSlug = getContestantCategoryRouteSlug(category);
      const slugs = await getCategoryStaticParams(category);
      return slugs.map(({ slug }) => ({ category: routeSlug, slug }));
    }),
  );

  return params.flat();
}
