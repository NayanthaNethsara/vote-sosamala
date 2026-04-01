import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listContestants, deleteContestant as apiDeleteContestant } from "@/lib/api";
import type { Contestant } from "@/types/contestant";

export function useContestants() {
  const { user } = useAuth();
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContestants = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await listContestants(user);
      setContestants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContestants();
  }, [fetchContestants]);

  const deleteContestant = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this contestant?")) return;
    try {
      await apiDeleteContestant(user, id);
      setContestants((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete contestant");
    }
  };

  return {
    contestants,
    loading,
    fetchContestants,
    deleteContestant,
  };
}
