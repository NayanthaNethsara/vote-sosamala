import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listUsersAction } from "@/app/actions/users";
import type { SystemUser } from "@/types/user";

export function useUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!user) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const result = await listUsersAction({ token });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setUsers(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
  };
}
