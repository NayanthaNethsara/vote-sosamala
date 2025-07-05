import { ContestantCard } from "@/components/contestant-card";
import type { Contestant } from "@/types/contestant";

interface ContestantListProps {
  contestants: Contestant[];
  category: string;
}

export default function ContestantList({
  contestants,
  category,
}: ContestantListProps) {
  return (
    <div className="container mx-auto px-8 py-8">
      <div className="mb-8">
        {contestants.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {contestants.map((contestant) => (
              <ContestantCard
                key={contestant.id}
                category={category}
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
