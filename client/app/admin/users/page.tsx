"use client";

import { ArrowClockwise } from "@phosphor-icons/react";

import { UsersDataTable } from "@/components/admin/users-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/hooks/use-users";

export default function UsersAdminPage() {
  const { role } = useAuth();
  const {
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
    setPage,
    setLimit,
    setRoleFilter,
    fetchUsers,
  } = useUsers();
  const isSuperAdmin = role === "super-admin";

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  if (!isSuperAdmin) {
    return (
      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Only super-admins can view user management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-none border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground sm:p-8">
            Access denied.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && users.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              All registered users and their activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="h-20 animate-pulse rounded-none bg-muted" />
              <div className="h-20 animate-pulse rounded-none bg-muted" />
              <div className="h-20 animate-pulse rounded-none bg-muted" />
            </div>
            <div className="h-10 animate-pulse rounded-none bg-muted" />
            <div className="h-80 animate-pulse rounded-none bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl sm:text-3xl uppercase tracking-tight">
                Users
              </CardTitle>
              <CardDescription>
                All registered users and their activity.
              </CardDescription>
            </div>
            <Button
              onClick={fetchUsers}
              variant="outline"
              disabled={loading}
              className="w-full gap-2 md:w-auto"
            >
              <ArrowClockwise className="h-4 w-4" />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-none border bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Total users
              </div>
              <div className="mt-2 text-2xl font-semibold tabular-nums">
                {total}
              </div>
            </div>
            <div className="rounded-none border bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Current page
              </div>
              <div className="mt-2 text-2xl font-semibold tabular-nums">
                {page}
              </div>
            </div>
            <div className="rounded-none border bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Showing
              </div>
              <div className="mt-2 text-2xl font-semibold tabular-nums">
                {from}-{to}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Role filter
                </div>
                <Select
                  value={roleFilter}
                  onValueChange={(value) =>
                    setRoleFilter(
                      value as "all" | "guest" | "admin" | "super-admin",
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Rows per page
                </div>
                <Select
                  value={String(limit)}
                  onValueChange={(value) => setLimit(Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="20" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!hasPrev || loading}
                className="flex-1 sm:flex-none"
              >
                Previous
              </Button>
              <span className="min-w-24 text-center text-xs text-muted-foreground tabular-nums">
                {totalPages > 0 ? `Page ${page} / ${totalPages}` : "Page 0 / 0"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasNext || loading}
                className="flex-1 sm:flex-none"
              >
                Next
              </Button>
            </div>
          </div>

          {error && (
            <div
              className="rounded-none border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              role="status"
            >
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <UsersDataTable users={users} />
    </div>
  );
}
