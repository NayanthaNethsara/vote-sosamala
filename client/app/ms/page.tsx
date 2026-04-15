import { ContestantCategoryPage } from "@/components/public/contestant-category-page";
import { getPublicContestantsPage } from "@/lib/public-contestants";

export default async function MsPage() {
  const { contestants } = await getPublicContestantsPage(1, 100);
  const femaleContestants = contestants.filter(
    (contestant) => contestant.gender.toLowerCase() === "female",
  );

  return (
    <ContestantCategoryPage
      badgeLabel="Ms Showcase"
      title="Vote for Ms Sosamala 2026"
      description="A curated spotlight of this season's most inspiring contestants. Meet the finalists and support your favorite with confidence."
      contestants={femaleContestants}
    />
  );
}
