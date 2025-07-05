import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { VotePage } from "@/components/vote-page";
import { VotingHeader } from "@/components/vote-header";
import { getUserOrNull } from "@/lib/utils/auth";

export const revalidate = 60;

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await params;

  const supabase = await createClient(); // No cookies needed for public data
  const { data: contestant } = await supabase
    .from("contestants")
    .select("name, image_url, description")
    .eq("id", id)
    .eq("category", category)
    .maybeSingle();

  if (!contestant) return {};

  const siteUrl = "nayantha.me"; // Replace with your real domain
  const pageUrl = `${siteUrl}/vote/${category}/${id}`;
  const imageUrl = contestant.image_url || `${siteUrl}/default-og.png`;

  const title = `${contestant.name} – Vote Now!`;
  const description =
    contestant.description || `Support ${contestant.name} in ${category}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${contestant.name}'s vote banner`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

// Page rendering logic
export default async function ContestantVotePage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await params;
  const supabase = await createClient(cookies());

  const user = await getUserOrNull();

  const { data: contestant } = await supabase
    .from("contestants")
    .select("*")
    .eq("id", id)
    .eq("category", category)
    .eq("active", true)
    .maybeSingle();

  if (!contestant) notFound();

  return (
    <>
      <VotingHeader contestant={contestant} user={user} />
      <VotePage contestant={contestant} user={user} />
    </>
  );
}
