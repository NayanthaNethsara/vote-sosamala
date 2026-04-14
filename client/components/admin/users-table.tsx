"use client";

import { DataTable } from "@/components/admin/data-table";
import { userColumns } from "@/components/admin/users-columns";
import type { SystemUser } from "@/types/user";

interface UsersDataTableProps {
  users: SystemUser[];
}

function searchUsers(
  row: { original: SystemUser },
  _columnId: string,
  filterValue: string,
): boolean {
  const search = filterValue.toLowerCase();
  const u = row.original;
  return (
    u.displayName.toLowerCase().includes(search) ||
    u.email.toLowerCase().includes(search) ||
    u.firebaseUid.toLowerCase().includes(search)
  );
}

export function UsersDataTable({ users }: UsersDataTableProps) {
  return (
    <DataTable
      columns={userColumns}
      data={users}
      searchPlaceholder="Search by name, email, or UID..."
      globalFilterFn={searchUsers}
    />
  );
}
