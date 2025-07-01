"use client";
import { useEffect, useState } from "react";
import { ContestantCard } from "@/components/contestant-card";
import type { Contestant } from "@/types/contestant";

const mockContestants: Contestant[] = [
  {
    id: "1",
    name: "Luna Leopard",
    faculty: "Mystigrove",
    image: "/landing-page/f-1.jpg",
    votes: 125,
    rank: 0,
  },
  {
    id: "2",
    name: "Max Monkey",
    faculty: "Feralflare",
    image: "/contestants/max.jpg",
    votes: 210,
    rank: 0,
  },
  {
    id: "3",
    name: "Tara Tiger",
    faculty: "Thornclaw",
    image: "/contestants/tara.jpg",
    votes: 180,
    rank: 0,
  },
  {
    id: "4",
    name: "Chico Cheetah",
    faculty: "Skyshade",
    image: "/contestants/chico.jpg",
    votes: 95,
    rank: 0,
  },
  {
    id: "5",
    name: "Benny Bear",
    faculty: "Omniverance",
    image: "/contestants/benny.jpg",
    votes: 160,
    rank: 0,
  },
];

async function getContestant(category: string): Promise<Contestant[]> {
  // Simulate delay
  await new Promise((res) => setTimeout(res, 300));

  return mockContestants;
}

export default function ContestantList({ category }: { category: string }) {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContestants() {
      try {
        const data = await getContestant(category);

        const sortedData = [...data].sort(
          (a, b) => (b.votes || 0) - (a.votes || 0)
        );

        setContestants(sortedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching contestants:", error);
        setError("Failed to load contestants.");
        setLoading(false);
      }
    }

    fetchContestants();
  }, [category]);

  return (
    <div className="container mx-auto px-8 py-8">
      <div className="mb-8">
        {contestants.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {contestants.map((contestant) => (
              <ContestantCard
                category={category}
                key={contestant.id}
                contestant={contestant}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-lg">No contestants found.</p>
        )}
      </div>
    </div>
  );
}
