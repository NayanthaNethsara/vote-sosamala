import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  createContestantAction,
  deleteContestantAction,
  listContestantsAction,
  updateContestantAction,
} from "@/app/actions/contestants";
import type { ActionResult } from "@/types/action";
import type { Contestant, ContestantInput } from "@/types/contestant";

export function useContestants() {
  const { user } = useAuth();
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = useCallback(async () => {
    if (!user) {
      throw new Error("You must be signed in to manage contestants");
    }

    return user.getIdToken();
  }, [user]);

  const fetchContestants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listContestantsAction();

      if (!result.success) {
        setError(result.error);
        return;
      }

      setContestants(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load contestants",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContestants();
  }, [fetchContestants]);

  const createContestant = async (
    payload: ContestantInput,
  ): Promise<ActionResult<Contestant>> => {
    try {
      const token = await getAuthToken();
      const result = await createContestantAction({ token, payload });

      if (!result.success) {
        setError(result.error);
        return result;
      }

      setContestants((prev) => [result.data, ...prev]);
      setError(null);

      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create contestant";
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateContestant = async (
    id: string,
    payload: ContestantInput,
  ): Promise<ActionResult<Contestant>> => {
    try {
      const token = await getAuthToken();
      const result = await updateContestantAction({ token, id, payload });

      if (!result.success) {
        setError(result.error);
        return result;
      }

      setContestants((prev) =>
        prev.map((contestant) =>
          contestant.id === result.data.id ? result.data : contestant,
        ),
      );
      setError(null);

      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update contestant";
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteContestant = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this contestant?")) return;

    try {
      const token = await getAuthToken();
      const result = await deleteContestantAction({ token, id });

      if (!result.success) {
        setError(result.error);
        alert(result.error);
        return;
      }

      setContestants((prev) => prev.filter((c) => c.id !== id));
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete contestant";
      setError(message);
      alert(message);
    }
  };

  return {
    contestants,
    loading,
    error,
    fetchContestants,
    createContestant,
    updateContestant,
    deleteContestant,
  };
}
