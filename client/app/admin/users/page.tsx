"use client";

import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/hooks/use-users";
import { UsersDataTable } from "@/components/admin/users-table";
import { Button } from "@/components/ui/button";
import { ArrowClockwise } from "@phosphor-icons/react";

export default function UsersAdminPage() {
  const { role } = useAuth();
  const { users, loading, error, fetchUsers } = useUsers();
  const isSuperAdmin = role === "super-admin";

  if (!isSuperAdmin) {
    return (
      <div className="py-10 px-6 sm:px-8 max-w-5xl mx-auto font-mono">
        <div className="border bg-card p-12 flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
          <p className="font-semibold text-lg">Access Denied</p>
          <p className="text-muted-foreground text-sm">
            Only super-admins can view user management.
          </p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="py-10 px-6 sm:px-8 max-w-6xl mx-auto space-y-8 font-mono">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Users</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            All registered users and their activity.
          </p>
        </div>
        <Button
          onClick={fetchUsers}
          variant="outline"
          size="lg"
          className="shrink-0 gap-2"
        >
          <ArrowClockwise className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span>
          Total: <strong className="text-foreground">{users.length}</strong>
        </span>
        <span>
          Admins:{" "}
          <strong className="text-foreground">
            {
              users.filter(
                (u) => u.role === "admin" || u.role === "super-admin",
              ).length
            }
          </strong>
        </span>
        <span>
          Guests:{" "}
          <strong className="text-foreground">
            {users.filter((u) => u.role === "guest").length}
          </strong>
        </span>
      </div>

      <UsersDataTable users={users} />

      {error && (
        <p className="text-sm text-destructive" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
