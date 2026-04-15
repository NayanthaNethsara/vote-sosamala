import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listUsersAction } from "@/app/actions/users";
import type { SystemUser, UserRole } from "@/types/user";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export type UserRoleFilter = "all" | UserRole;

export function useUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>("all");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!user) {
      setUsers([]);
      setTotal(0);
      setTotalPages(0);
      setHasNext(false);
      setHasPrev(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const result = await listUsersAction({
        token,
        page,
        limit,
        role: roleFilter,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setUsers(result.data.users);
      setTotal(result.data.pagination.total);
      setTotalPages(result.data.pagination.totalPages);
      setHasNext(result.data.pagination.hasNext);
      setHasPrev(result.data.pagination.hasPrev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [user, page, limit, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updatePage = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage));
  }, []);

  const updateLimit = useCallback((nextLimit: number) => {
    const clampedLimit = Math.max(1, Math.min(100, nextLimit));
    setLimit(clampedLimit);
    setPage(DEFAULT_PAGE);
  }, []);

  const updateRoleFilter = useCallback((nextRole: UserRoleFilter) => {
    setRoleFilter(nextRole);
    setPage(DEFAULT_PAGE);
  }, []);

  return {
    users,
    page,
    limit,
    roleFilter,
    total,
    totalPages,
    hasNext,
    hasPrev,
    loading,
    error,
    setPage: updatePage,
    setLimit: updateLimit,
    setRoleFilter: updateRoleFilter,
    fetchUsers,
  };
}
