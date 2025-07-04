"use client";

import type { Contestant } from "@/types/contestant";

export default function ContestantList({
  contestants,
}: {
  contestants: Contestant[];
}) {
  if (!contestants.length) return <p>No contestants yet.</p>;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {contestants.map((c) => (
        <div
          key={c.id}
          className="border rounded p-4 shadow flex items-center gap-4 "
        >
          <img
            src={c.image_url}
            alt={c.name}
            className="w-24 h-24 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="text-lg font-bold">{c.name}</h3>
            <p className="text-sm text-gray-600">{c.bio}</p>
            <p className="text-xs text-gray-500">Category: {c.category}</p>
            <p className="text-xs">
              Status: {c.active ? "✅ Active" : "❌ Inactive"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
