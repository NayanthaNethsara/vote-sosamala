import { notFound } from "next/navigation";

import { ContestantCategoryPage } from "@/components/public/contestant-category-page";
import {
  getContestantCategoryConfig,
  parseContestantCategoryRoute,
} from "@/lib/contestant-categories";
import { getCategoryContestants } from "@/lib/contestant-category-pages";

interface ContestantCategoryRoutePageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function ContestantCategoryRoutePage({
  params,
}: ContestantCategoryRoutePageProps) {
  const { category: rawCategory } = await params;
  const category = parseContestantCategoryRoute(rawCategory);

  if (!category) {
    notFound();
  }

  const contestants = await getCategoryContestants(category);
  const categoryConfig = getContestantCategoryConfig(category);

  return (
    <ContestantCategoryPage
      badgeLabel={categoryConfig.badgeLabel}
      title={categoryConfig.title}
      description={categoryConfig.description}
      contestants={contestants}
      showLiveResults
      detailBasePath={categoryConfig.detailBasePath}
    />
  );
}
