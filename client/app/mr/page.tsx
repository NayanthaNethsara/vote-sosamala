import { ContestantCategoryPage } from "@/components/public/contestant-category-page";
import { getPublicContestantsPage } from "@/lib/public-contestants";

export default async function MrPage() {
  const { contestants } = await getPublicContestantsPage(1, 100);
  const maleContestants = contestants.filter(
    (contestant) => contestant.gender.toLowerCase() === "male",
  );

  return (
    <ContestantCategoryPage
      badgeLabel="Mr Showcase"
      title="Vote for Mr Sosamala 2026"
      description="Discover the leading contestants shaping this year's stage. Browse profiles and cast your vote for the one who stands out."
      contestants={maleContestants}
    />
  );
}
