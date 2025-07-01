import { notFound } from "next/navigation";
import ContestantList from "@/components/contestant-list";
import { Spotlight } from "@/components/ui/spotlight-new";

export default async function ContestantListSync({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const resolvedParams = await params;
  const category = resolvedParams.category;

  return (
    <section className="w-full min-h-screen overflow-hidden  flex flex-col items-center  relative">
      <Spotlight />
      <ContestantList category={category} />
    </section>
  );
}
