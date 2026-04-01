"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase";
import { createContestant, updateContestant } from "@/lib/api";
import type { Contestant, ContestantInput } from "@/types/contestant";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@phosphor-icons/react";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  birthday: z.string().optional(),
  nicOrStudentId: z.string().min(1, "NIC or Student ID is required"),
  gender: z.string().optional(),
  academicYear: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  contestant?: Contestant;
  onSaved: () => void;
}

export function ContestantDialog({
  open,
  onOpenChange,
  contestant,
  onSaved,
}: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    // @ts-expect-error Zod version mismatch with hookform resolvers
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      setPhotoFile(null);
      if (contestant) {
        reset({
          name: contestant.name,
          birthday: contestant.birthday || "",
          nicOrStudentId: contestant.nicOrStudentId,
          gender: contestant.gender || "",
          academicYear: contestant.academicYear || "",
        });
        setPreviewUrl(contestant.photoUrl || null);
      } else {
        reset({
          name: "",
          birthday: "",
          nicOrStudentId: "",
          gender: "",
          academicYear: "",
        });
        setPreviewUrl(null);
      }
    }
  }, [open, contestant, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setLoading(true);
    let photoUrl = contestant?.photoUrl;

    try {
      if (photoFile) {
        const storage = await getFirebaseStorage();
        const storageRef = ref(
          storage,
          `contestants/${Date.now()}_${photoFile.name}`
        );
        const task = await uploadBytesResumable(storageRef, photoFile);
        photoUrl = await getDownloadURL(task.ref);
      }

      const input: ContestantInput = {
        name: data.name,
        nicOrStudentId: data.nicOrStudentId,
        birthday: data.birthday || undefined,
        gender: data.gender || undefined,
        academicYear: data.academicYear || undefined,
        photoUrl: photoUrl || undefined,
      };

      if (contestant) {
        await updateContestant(user, contestant.id, input);
      } else {
        await createContestant(user, input);
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save contestant. Ensure the server is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl">
            {contestant ? "Edit Contestant" : "Add Contestant"}
          </DialogTitle>
          <DialogDescription>
            {contestant ? "Update the details below to reflect their latest information." : "Enter contestant details here. Make sure they have a great profile photo!"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col items-center gap-4 p-4 bg-muted/30 rounded-lg border border-dashed">
            {previewUrl ? (
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-background shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-sm text-muted-foreground text-sm font-medium">
                No Photo
              </div>
            )}
            <Input type="file" accept="image/*" onChange={handleFileChange} className="max-w-[250px] text-xs" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <span className="text-sm text-red-500">{errors.name.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nic">NIC / Student ID</Label>
            <Input id="nic" {...register("nicOrStudentId")} />
            {errors.nicOrStudentId && (
              <span className="text-sm text-red-500">
                {errors.nicOrStudentId.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={contestant?.gender || ""}
                onValueChange={(val: string | null) => {
                  setValue("gender", val || undefined);
                  if (contestant) contestant.gender = val || undefined;
                }}
                defaultValue={contestant?.gender || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="acadYear">Academic Year</Label>
              <Input
                id="acadYear"
                placeholder="e.g. 2nd Year"
                {...register("academicYear")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Input id="birthday" type="date" {...register("birthday")} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
              {contestant ? "Save Changes" : "Create Contestant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
