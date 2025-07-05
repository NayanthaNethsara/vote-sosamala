import { notFound } from "next/navigation";
import ContestantList from "@/components/contestant-list";
import { getActiveContestants } from "@/lib/db/contestants";
import { Spotlight } from "@/components/ui/spotlight-new";

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

  return (
    <section className="w-full min-h-screen overflow-hidden flex flex-col items-center relative">
      <Spotlight />
      <ContestantList contestants={contestants} category={category} />
    </section>
  );
}
