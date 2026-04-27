"use client";

import { useState } from "react";
import { PencilLine, Plus, Trash2 } from "lucide-react";

import {
  contestantAcademicYears,
  contestantCategories,
  contestantFaculties,
  contestantCategoryLabels,
  contestantFacultyLabels,
} from "@/config/contestants";
import type { Contestant } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { compressImage } from "@/lib/image-compression";

import {
  createContestantAction,
  deleteContestantAction,
  recalculateVoteCountsAction,
  updateContestantAction,
} from "../../app/actions/admin/contestant-actions";

type ContestantManagerProps = {
  contestants: Contestant[];
};

type ContestantFormProps = {
  contestant?: Contestant;
  submitLabel: string;
  action: (formData: FormData) => Promise<void>;
};


function ContestantForm({
  contestant,
  submitLabel,
  action,
}: ContestantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const imageFile = formData.get("image_file") as File | null;

      if (imageFile && imageFile.size > 0) {
        // Only compress if it's an actual file and larger than 500KB
        if (imageFile.size > 500 * 1024) {
          const compressed = await compressImage(imageFile);
          formData.set("image_file", compressed);
        }
      }

      await action(formData);
      // The action itself usually handles redirects, so we don't need to do much here
      // unless there's an error.
    } catch (error) {
      console.error("Form submission failed", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save contestant",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="grid gap-4">
      {contestant ? (
        <input type="hidden" name="id" value={contestant.id} />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={contestant ? `name-${contestant.id}` : "name"}>
            Name
          </Label>
          <Input
            id={contestant ? `name-${contestant.id}` : "name"}
            name="name"
            defaultValue={contestant?.name}
            placeholder="Ariana Cruz"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor={contestant ? `student_id-${contestant.id}` : "student_id"}
          >
            Student ID
          </Label>
          <Input
            id={contestant ? `student_id-${contestant.id}` : "student_id"}
            name="student_id"
            defaultValue={contestant?.student_id}
            placeholder="STU-001"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor={contestant ? `bio-${contestant.id}` : "bio"}>
            Bio
          </Label>
          <Textarea
            id={contestant ? `bio-${contestant.id}` : "bio"}
            name="bio"
            defaultValue={contestant?.bio ?? ""}
            placeholder="Short contestant bio"
            rows={4}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={contestant ? `faculty-${contestant.id}` : "faculty"}>
            Faculty
          </Label>
          <select
            id={contestant ? `faculty-${contestant.id}` : "faculty"}
            name="faculty"
            defaultValue={contestant?.faculty ?? contestantFaculties[0]}
            className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-50"
            required
            disabled={isSubmitting}
          >
            {contestantFaculties.map((faculty) => (
              <option key={faculty} value={faculty}>
                {contestantFacultyLabels[faculty]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor={
              contestant ? `academic_year-${contestant.id}` : "academic_year"
            }
          >
            Academic year
          </Label>
          <select
            id={contestant ? `academic_year-${contestant.id}` : "academic_year"}
            name="academic_year"
            defaultValue={contestant?.academic_year ?? ""}
            className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-50"
            disabled={isSubmitting}
          >
            <option value="">Not set</option>
            {contestantAcademicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor={contestant ? `category-${contestant.id}` : "category"}
          >
            Category
          </Label>
          <select
            id={contestant ? `category-${contestant.id}` : "category"}
            name="category"
            defaultValue={contestant?.category ?? contestantCategories[0]}
            className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {contestantCategories.map((category) => (
              <option key={category} value={category}>
                {contestantCategoryLabels[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={contestant ? `active-${contestant.id}` : "active"}>
            Status
          </Label>
          <select
            id={contestant ? `active-${contestant.id}` : "active"}
            name="active"
            defaultValue={contestant ? String(contestant.active) : "true"}
            className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-50"
            disabled={isSubmitting}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="grid gap-2 md:col-span-2">
          <Label
            htmlFor={contestant ? `image_file-${contestant.id}` : "image_file"}
          >
            Contestant image
          </Label>
          <Input
            id={contestant ? `image_file-${contestant.id}` : "image_file"}
            name="image_file"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required={!contestant}
            disabled={isSubmitting}
          />
          <p className="text-xs text-white/55">
            Upload PNG, JPEG, or WEBP (max 4MB). Large images will be resized
            automatically.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
        <span>
          Images are compressed and then uploaded to Supabase Storage.
        </span>
        <Button type="submit" className="shrink-0" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function EditContestantDialog({ contestant }: { contestant: Contestant }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <PencilLine className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit contestant</DialogTitle>
          <DialogDescription>
            Update contestant details. Upload a new image only if you want to
            replace the current one.
          </DialogDescription>
        </DialogHeader>

        <ContestantForm
          key={contestant.id}
          contestant={contestant}
          submitLabel="Save changes"
          action={updateContestantAction}
        />

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}

function CreateContestantDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add contestant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create contestant</DialogTitle>
          <DialogDescription>
            Add a new contestant. The slug is generated from the name and image
            is uploaded to Supabase Storage.
          </DialogDescription>
        </DialogHeader>

        <ContestantForm
          action={createContestantAction}
          submitLabel="Create contestant"
        />

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}

function DeleteContestantButton({ contestant }: { contestant: Contestant }) {
  return (
    <form
      action={deleteContestantAction}
      onSubmit={(event) => {
        if (!confirm(`Delete ${contestant.name}?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={contestant.id} />
      <Button type="submit" variant="destructive" size="sm">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </form>
  );
}

export function ContestantManager({ contestants }: ContestantManagerProps) {
  return (
    <div className="grid gap-6">
      <Card className="border-white/10 bg-white/5 text-white shadow-2xl shadow-black/20 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-xl">Contestants</CardTitle>
            <CardDescription className="text-white/60">
              Manage the current contestant list in a single table.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <form action={recalculateVoteCountsAction}>
              <Button type="submit" variant="secondary">
                Recalculate vote counts
              </Button>
            </form>
            <Badge
              variant="secondary"
              className="border-white/10 bg-white/10 text-white"
            >
              {contestants.length} total
            </Badge>
            <CreateContestantDialog />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contestants.length === 0 ? (
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-white/55"
                    >
                      No contestants yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  contestants.map((contestant) => (
                    <TableRow
                      key={contestant.id}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-white">
                            {contestant.name}
                          </p>
                          <p className="max-w-[24rem] text-sm text-white/55">
                            {contestant.bio}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-emerald-200">
                        {contestant.slug}
                      </TableCell>
                      <TableCell>{contestant.student_id}</TableCell>
                      <TableCell className="capitalize">
                        {contestant.category}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={contestant.active ? "default" : "secondary"}
                          className={
                            contestant.active
                              ? "bg-emerald-500 text-white"
                              : "bg-white/10 text-white"
                          }
                        >
                          {contestant.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{contestant.vote_count}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <EditContestantDialog contestant={contestant} />
                          <DeleteContestantButton contestant={contestant} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
