"use client";

import { useState } from "react";
import { useContestants } from "@/hooks/use-contestants";
import type { Contestant } from "@/types/contestant";

import { Button } from "@/components/ui/button";
import { ContestantDialog } from "@/components/admin/contestant-dialog";
import { ContestantsTable } from "@/components/admin/contestants-table";

export default function ContestantsAdminPage() {
  const {
    contestants,
    loading,
    error,
    createContestant,
    updateContestant,
    deleteContestant,
  } = useContestants();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContestant, setEditingContestant] = useState<
    Contestant | undefined
  >(undefined);

  const handleEdit = (contestant: Contestant) => {
    setEditingContestant(contestant);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingContestant(undefined);
    setDialogOpen(true);
  };

  if (loading) return <div className="p-8">Loading contestants...</div>;

  return (
    <div className="py-10 px-6 sm:px-8 max-w-5xl mx-auto space-y-8 font-mono">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">
            Contestants
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage the participants for your voting event.
          </p>
        </div>
        <Button onClick={handleAdd} size="lg" className="shrink-0">
          Add Contestant
        </Button>
      </div>

      <ContestantsTable
        contestants={contestants}
        onEdit={handleEdit}
        onDelete={deleteContestant}
      />

      <ContestantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contestant={editingContestant}
        onCreate={createContestant}
        onUpdate={updateContestant}
      />

      {error && (
        <p className="text-sm text-destructive" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
