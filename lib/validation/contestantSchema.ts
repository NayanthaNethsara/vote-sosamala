import { z } from "zod";
import {
  contestantCategories,
  contestantFaculties,
} from "@/config/contestants";

export const contestantSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().min(1).max(500),
  category: z.enum(contestantCategories),
  faculty: z.enum(contestantFaculties),
  image_url: z
    .instanceof(File)
    .refine((file) => file.size <= 4 * 1024 * 1024, {
      message: "Image must be 4MB or less",
    })
    .refine(
      (file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      { message: "Invalid image format" },
    ),
});
