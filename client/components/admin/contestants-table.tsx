"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash, PencilSimple } from "@phosphor-icons/react";
import type { Contestant } from "@/types/contestant";

interface ContestantsTableProps {
  contestants: Contestant[];
  onEdit: (contestant: Contestant) => void;
  onDelete: (id: string) => void;
}

export function ContestantsTable({ contestants, onEdit, onDelete }: ContestantsTableProps) {
  return (
    <div className="border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>NIC / Student ID</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contestants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p>No contestants found.</p>
                  <p className="text-sm">Click &quot;Add Contestant&quot; to get started.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            contestants.map((c) => (
              <TableRow key={c.id} className="group transition-colors hover:bg-muted/50">
                <TableCell>
                  <Avatar className="h-10 w-10 border shadow-sm">
                    <AvatarImage src={c.photoUrl} alt={c.name} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {c.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.nicOrStudentId}</TableCell>
                <TableCell className="capitalize">{c.gender || "-"}</TableCell>
                <TableCell>{c.academicYear || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(c)}
                  >
                    <PencilSimple className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                    onClick={() => onDelete(c.id)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
