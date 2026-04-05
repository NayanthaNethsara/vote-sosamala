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
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
import { SpinnerIcon, CalendarBlankIcon } from "@phosphor-icons/react";

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
  const [birthdayInput, setBirthdayInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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

  const genderValue = watch("gender");
  const academicYearValue = watch("academicYear");
  const birthdayVal = watch("birthday");

  useEffect(() => {
    if (birthdayVal) {
      const date = new Date(birthdayVal);
      if (!isNaN(date.getTime())) {
        setBirthdayInput(format(date, "MMMM dd, yyyy"));
      }
    } else {
      setBirthdayInput("");
    }
  }, [birthdayVal]);

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
          `contestants/${Date.now()}_${photoFile.name}`,
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
            {contestant
              ? "Update the details below to reflect their latest information."
              : "Enter contestant details here. Make sure they have a great profile photo!"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col items-center gap-4 p-4 bg-muted/30 border border-dashed">
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
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="max-w-[250px] text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <span className="text-sm text-red-500">
                {errors.name.message}
              </span>
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
                value={genderValue || ""}
                onValueChange={(val: string) => {
                  setValue("gender", val);
                }}
              >
                <SelectTrigger className="w-full">
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
              <Select
                value={academicYearValue || ""}
                onValueChange={(val: string) => {
                  setValue("academicYear", val);
                }}
              >
                <SelectTrigger id="acadYear" className="w-full">
                  <SelectValue placeholder="Select Year & Sem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Year - 1st Semester">1Y1S</SelectItem>
                  <SelectItem value="1st Year - 2nd Semester">1Y2S</SelectItem>
                  <SelectItem value="2nd Year - 1st Semester">2Y1S</SelectItem>
                  <SelectItem value="2nd Year - 2nd Semester">2Y2S</SelectItem>
                  <SelectItem value="3rd Year - 1st Semester">3Y1S</SelectItem>
                  <SelectItem value="3rd Year - 2nd Semester">3Y2S</SelectItem>
                  <SelectItem value="4th Year - 1st Semester">4Y1S</SelectItem>
                  <SelectItem value="4th Year - 2nd Semester">4Y2S</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label htmlFor="birthday">Birthday</Label>
            <div className="relative">
              <Input
                id="birthday"
                value={birthdayInput}
                placeholder="June 01, 2025"
                onChange={(e) => {
                  setBirthdayInput(e.target.value);
                  const parsedDate = new Date(e.target.value);
                  if (!isNaN(parsedDate.getTime())) {
                    setValue("birthday", format(parsedDate, "yyyy-MM-dd"));
                  } else {
                    setValue("birthday", "");
                  }
                }}
                className="w-full pr-10"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full rounded-l-none text-muted-foreground hover:bg-transparent"
                  >
                    <CalendarBlankIcon className="h-4 w-4" />
                    <span className="sr-only">Select date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="end"
                  sideOffset={4}
                >
                  <Calendar
                    mode="single"
                    selected={birthdayVal ? new Date(birthdayVal) : undefined}
                    onSelect={(date) => {
                      setValue(
                        "birthday",
                        date ? format(date, "yyyy-MM-dd") : "",
                      );
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
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
              {loading && <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />}
              {contestant ? "Save Changes" : "Create Contestant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
