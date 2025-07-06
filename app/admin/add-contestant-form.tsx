"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { contestantSchema } from "@/lib/validation/contestantSchema";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function AddContestantForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const image = formData.get("image") as File;

    try {
      //  Validate with Zod
      const parsed = contestantSchema.parse({
        name: formData.get("name"),
        bio: formData.get("bio"),
        category: formData.get("category"),
        faculty: formData.get("faculty"),
        image_url: image,
      });

      // Prepare FormData for file upload
      const uploadData = new FormData();
      uploadData.append("name", parsed.name);
      uploadData.append("bio", parsed.bio);
      uploadData.append("category", parsed.category);
      uploadData.append("faculty", parsed.faculty);
      uploadData.append("image", parsed.image_url);

      const response = await fetch("/api/admin/add-contestant", {
        method: "POST",
        body: uploadData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Contestant added!");
        form.reset();
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0]?.message || "Validation error");
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required maxLength={100} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cuta">Cuta</SelectItem>
              <SelectItem value="cutie">Cutie</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="faculty">Faculty</Label>
        <Select name="faculty" required>
          <SelectTrigger>
            <SelectValue placeholder="Select faculty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="herbivores">Herbivores</SelectItem>
            <SelectItem value="carnivores">Carnivores</SelectItem>
            <SelectItem value="omnivores">Omnivores</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Upload Image</Label>
        <Input type="file" name="image" accept="image/*" required />
        <p className="text-xs text-muted-foreground">
          Upload a clear image under 5MB (JPG, PNG, or WEBP).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Short description..."
          className="min-h-[100px]"
          maxLength={500}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Uploading..." : "Add Contestant"}
      </Button>
    </form>
  );
}
