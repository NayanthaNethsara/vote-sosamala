"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBlurDataURL } from "@/lib/utils/image-placeholder";
import type { Contestant, ContestantListPagination } from "@/types/contestant";

interface ContestantsShowcaseProps {
  contestants: Contestant[];
  pagination: ContestantListPagination;
}

const genderFilterValues = ["all", "male", "female"] as const;

const genderFilterLabels: Record<(typeof genderFilterValues)[number], string> =
  {
    all: "All",
    male: "Male",
    female: "Female",
  };

export function ContestantsShowcase({
  contestants,
  pagination,
}: ContestantsShowcaseProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [gender, setGender] =
    useState<(typeof genderFilterValues)[number]>("all");
  const [semester, setSemester] = useState("all");

  const semesterOptions = useMemo(() => {
    return [
      "all",
      ...new Set(contestants.map((contestant) => contestant.semester)),
    ];
  }, [contestants]);

  const filteredContestants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return contestants
      .filter((contestant) => {
        if (gender !== "all" && contestant.gender !== gender) {
          return false;
        }

        if (semester !== "all" && contestant.semester !== semester) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return (
          contestant.name.toLowerCase().includes(normalizedSearch) ||
          contestant.academicYear.toLowerCase().includes(normalizedSearch) ||
          contestant.semester.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [contestants, gender, search, semester]);

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(Math.max(1, nextPage)));
    params.set("limit", String(pagination.limit));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total contestants
            </p>
            <p className="text-2xl font-semibold tabular-nums">
              {pagination.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Showing now
            </p>
            <p className="text-2xl font-semibold tabular-nums">
              {filteredContestants.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Last update
            </p>
            <p className="text-sm text-muted-foreground">
              Cached up to 2 minutes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, year, or semester"
          className="md:col-span-2"
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={gender}
            onValueChange={(value) =>
              setGender(value as (typeof genderFilterValues)[number])
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              {genderFilterValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {genderFilterLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesterOptions.map((value) => (
                <SelectItem key={value} value={value}>
                  {value === "all" ? "All" : value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredContestants.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No contestants match your filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContestants.map((contestant) => (
            <Card key={contestant.id} className="overflow-hidden">
              <div className="relative aspect-4/5 bg-muted/40">
                {contestant.photoURL ? (
                  <Image
                    src={contestant.photoURL}
                    alt={contestant.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    placeholder="blur"
                    blurDataURL={createBlurDataURL(contestant.name)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">
                    No photo
                  </div>
                )}
              </div>
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="line-clamp-1 text-base font-semibold">
                    {contestant.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {contestant.academicYear} • {contestant.semester}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="uppercase">
                    {contestant.gender}
                  </Badge>
                  {contestant.studentId && (
                    <Badge variant="secondary">{contestant.studentId}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 rounded-none border p-3">
        <div className="text-xs text-muted-foreground tabular-nums">
          Page {pagination.page} / {Math.max(1, pagination.totalPages)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev}
            onClick={() => goToPage(pagination.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext}
            onClick={() => goToPage(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
