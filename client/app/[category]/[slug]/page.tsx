import { notFound } from "next/navigation";

import { ContestantDetailView } from "@/components/public/contestant-detail-view";
import {
  getContestantCategoryConfig,
  parseContestantCategoryRoute,
} from "@/lib/contestant-categories";
import {
  getAllCategoryStaticParams,
  getCategoryContestantBySlug,
} from "@/lib/contestant-category-pages";

interface ContestantCategoryDetailPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return getAllCategoryStaticParams();
}

export default async function ContestantCategoryDetailPage({
  params,
}: ContestantCategoryDetailPageProps) {
  const { category: rawCategory, slug } = await params;
  const category = parseContestantCategoryRoute(rawCategory);

  if (!category) {
    notFound();
  }

  const contestant = await getCategoryContestantBySlug(category, slug);
  if (!contestant) {
    notFound();
  }

  const categoryConfig = getContestantCategoryConfig(category);

  return (
    <ContestantDetailView
      contestant={contestant}
      slug={slug}
      backHref={categoryConfig.detailBasePath}
      shareBasePath={categoryConfig.detailBasePath}
    />
  );
}
