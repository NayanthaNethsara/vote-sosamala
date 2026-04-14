"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { SystemUser, UserRole } from "@/types/user";

function roleBadgeVariant(
  role: UserRole,
): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "super-admin":
      return "destructive";
    case "admin":
      return "default";
    default:
      return "secondary";
  }
}

function formatDateTime(isoString: string | null): string {
  if (!isoString) return "Never";
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(isoString: string | null): string {
  if (!isoString) return "Never";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export const userColumns: ColumnDef<SystemUser>[] = [
  {
    id: "avatar",
    header: "",
    size: 48,
    enableSorting: false,
    cell: ({ row }) => {
      const u = row.original;
      return (
        <Avatar className="h-8 w-8 border shadow-sm">
          <AvatarImage
            src={u.photoURL ?? undefined}
            alt={u.displayName}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-[10px]">
            {(u.displayName || u.email).substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "displayName",
    header: "Name",
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium text-sm leading-tight truncate">
            {u.displayName || "Unnamed"}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            {u.email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge
          variant={roleBadgeVariant(role)}
          className="text-[10px] uppercase tracking-wider font-bold"
        >
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last Login",
    sortingFn: (a, b) => {
      const ta = a.original.lastLoginAt
        ? new Date(a.original.lastLoginAt).getTime()
        : 0;
      const tb = b.original.lastLoginAt
        ? new Date(b.original.lastLoginAt).getTime()
        : 0;
      return ta - tb;
    },
    cell: ({ row }) => {
      const lastLogin = row.original.lastLoginAt;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium">{timeAgo(lastLogin)}</span>
          <span className="text-[10px] text-muted-foreground">
            {formatDateTime(lastLogin)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    sortingFn: (a, b) =>
      new Date(a.original.createdAt).getTime() -
      new Date(b.original.createdAt).getTime(),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDateTime(row.original.createdAt)}
      </span>
    ),
  },
  {
    accessorKey: "firebaseUid",
    header: "UID",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-[10px] text-muted-foreground font-mono truncate block max-w-[120px]">
        {row.original.firebaseUid}
      </span>
    ),
  },
];
