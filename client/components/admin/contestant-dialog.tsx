"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { getFirebaseStorage } from "@/lib/firebase";
import {
  contestantFormSchema,
  type ContestantFormValues,
} from "@/lib/validation/contestant";
import {
  contestantAcademicYearValues,
  contestantGenderValues,
  contestantSemesterValues,
} from "@/lib/validation/shared";
import {
  normalizeContestantIdentifier,
  toContestantIdentityFields,
} from "@/lib/utils/contestant-identifier";
import {
  formatDateForForm,
  parseDateFromForm,
} from "@/lib/utils/contestant-date";
import type { ActionResult } from "@/types/action";
import type { Contestant, ContestantInput } from "@/types/contestant";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarBlankIcon, SpinnerIcon } from "@phosphor-icons/react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  contestant?: Contestant;
  onCreate: (payload: ContestantInput) => Promise<ActionResult<Contestant>>;
  onUpdate: (
    id: string,
    payload: ContestantInput,
  ) => Promise<ActionResult<Contestant>>;
}

export function ContestantDialog({
  open,
  onOpenChange,
  contestant,
  onCreate,
  onUpdate,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const [dobMonth, setDobMonth] = useState<Date | undefined>(undefined);
  const [dateOfBirthInputValue, setDateOfBirthInputValue] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContestantFormValues>({
    // @ts-expect-error Zod version mismatch with hookform resolvers
    resolver: zodResolver(contestantFormSchema),
    defaultValues: {
      name: "",
      dateOfBirth: "",
      gender: undefined,
      academicYear: undefined,
      semester: undefined,
      identifier: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setPhotoFile(null);

    if (contestant) {
      reset({
        name: contestant.name,
        dateOfBirth: contestant.dateOfBirth,
        gender: contestantGenderValues.includes(
          contestant.gender as (typeof contestantGenderValues)[number],
        )
          ? (contestant.gender as (typeof contestantGenderValues)[number])
          : undefined,
        academicYear: contestantAcademicYearValues.includes(
          contestant.academicYear as (typeof contestantAcademicYearValues)[number],
        )
          ? (contestant.academicYear as (typeof contestantAcademicYearValues)[number])
          : undefined,
        semester: contestantSemesterValues.includes(
          contestant.semester as (typeof contestantSemesterValues)[number],
        )
          ? (contestant.semester as (typeof contestantSemesterValues)[number])
          : undefined,
        identifier: contestant.studentId ?? contestant.nic ?? "",
      });
      setPreviewUrl(contestant.photoURL || null);
      return;
    }

    reset({
      name: "",
      dateOfBirth: "",
      gender: undefined,
      academicYear: undefined,
      semester: undefined,
      identifier: "",
    });
    setPreviewUrl(null);
  }, [open, contestant, reset]);

  const genderValue = watch("gender");
  const academicYearValue = watch("academicYear");
  const semesterValue = watch("semester");
  const dateOfBirthValue = watch("dateOfBirth");
  const selectedDateOfBirth = useMemo(
    () => parseDateFromForm(dateOfBirthValue),
    [dateOfBirthValue],
  );

  useEffect(() => {
    setDateOfBirthInputValue(dateOfBirthValue || "");
  }, [dateOfBirthValue]);

  useEffect(() => {
    if (!dobPickerOpen) {
      return;
    }

    setDobMonth(selectedDateOfBirth ?? new Date());
  }, [dobPickerOpen, selectedDateOfBirth]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = async (data: ContestantFormValues) => {
    setLoading(true);
    let photoURL = contestant?.photoURL;

    try {
      if (photoFile) {
        const storage = await getFirebaseStorage();
        const storageRef = ref(
          storage,
          `contestants/${Date.now()}_${photoFile.name}`,
        );
        const task = await uploadBytesResumable(storageRef, photoFile);
        photoURL = await getDownloadURL(task.ref);
      }

      const input: ContestantInput = {
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        academicYear: data.academicYear,
        semester: data.semester,
        ...toContestantIdentityFields(data.identifier),
        photoURL: photoURL || undefined,
      };

      const result = contestant
        ? await onUpdate(contestant.id, input)
        : await onCreate(input);

      if (!result.success) {
        alert(result.error);
        return;
      }

      onOpenChange(false);
    } catch (error) {
      console.error(error);
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
              : "Enter contestant details and upload a profile photo."}
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
              className="max-w-62.5 text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="identifier">NIC or Student ID</Label>
            <Input
              id="identifier"
              {...register("identifier", {
                setValueAs: (value) =>
                  typeof value === "string"
                    ? normalizeContestantIdentifier(value)
                    : value,
              })}
              placeholder="e.g. IT23162600 or 200310110894"
            />
            {errors.identifier && (
              <span className="text-sm text-red-500">
                {errors.identifier.message}
              </span>
            )}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Field>
                <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
                <input type="hidden" {...register("dateOfBirth")} />
                <InputGroup>
                  <InputGroupInput
                    id="dateOfBirth"
                    value={dateOfBirthInputValue}
                    placeholder="YYYY-MM-DD"
                    onChange={(e) => {
                      const value = e.target.value;
                      setDateOfBirthInputValue(value);

                      setValue("dateOfBirth", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });

                      const parsed = parseDateFromForm(value);
                      if (parsed) {
                        setDobMonth(parsed);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setDobPickerOpen(true);
                      }
                    }}
                  />
                  <InputGroupAddon align="inline-end">
                    <Popover
                      open={dobPickerOpen}
                      onOpenChange={setDobPickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <InputGroupButton
                          id="date-picker"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Select date of birth"
                        >
                          <CalendarBlankIcon />
                          <span className="sr-only">Select date of birth</span>
                        </InputGroupButton>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="end"
                        alignOffset={-8}
                        sideOffset={10}
                      >
                        <Calendar
                          mode="single"
                          selected={selectedDateOfBirth}
                          month={dobMonth}
                          onMonthChange={setDobMonth}
                          onSelect={(date) => {
                            setValue(
                              "dateOfBirth",
                              date ? formatDateForForm(date) : "",
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            );
                            setDobPickerOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              {errors.dateOfBirth && (
                <span className="text-sm text-red-500">
                  {errors.dateOfBirth.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={genderValue || ""}
                onValueChange={(value) => {
                  if (
                    contestantGenderValues.includes(
                      value as (typeof contestantGenderValues)[number],
                    )
                  ) {
                    setValue(
                      "gender",
                      value as (typeof contestantGenderValues)[number],
                    );
                  }
                }}
              >
                <SelectTrigger id="gender" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <span className="text-sm text-red-500">
                  {errors.gender.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select
                value={academicYearValue || ""}
                onValueChange={(value) => {
                  if (
                    contestantAcademicYearValues.includes(
                      value as (typeof contestantAcademicYearValues)[number],
                    )
                  ) {
                    setValue(
                      "academicYear",
                      value as (typeof contestantAcademicYearValues)[number],
                    );
                  }
                }}
              >
                <SelectTrigger id="academicYear" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {contestantAcademicYearValues.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.academicYear && (
                <span className="text-sm text-red-500">
                  {errors.academicYear.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={semesterValue || ""}
                onValueChange={(value) => {
                  if (
                    contestantSemesterValues.includes(
                      value as (typeof contestantSemesterValues)[number],
                    )
                  ) {
                    setValue(
                      "semester",
                      value as (typeof contestantSemesterValues)[number],
                    );
                  }
                }}
              >
                <SelectTrigger id="semester" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {contestantSemesterValues.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.semester && (
                <span className="text-sm text-red-500">
                  {errors.semester.message}
                </span>
              )}
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
