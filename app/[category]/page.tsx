import { notFound } from "next/navigation";
import ContestantList from "@/components/contestant-list";
import { getActiveContestants } from "@/lib/db/contestants";
import { Spotlight } from "@/components/ui/spotlight-new";
import { getUserOrNull } from "@/lib/utils/auth";

export const revalidate = 86400;

export default async function ContestantListSync({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const validCategories = ["cuta", "cutie"];
  if (!validCategories.includes(category)) {
    notFound();
  }

  const contestants = await getActiveContestants(category);
  const user = await getUserOrNull();

  return (
    <section className="w-full min-h-screen overflow-hidden flex flex-col items-center pt-16 relative">
      <ContestantList contestants={contestants} category={category} />
      <Spotlight />
    </section>
  );
}
