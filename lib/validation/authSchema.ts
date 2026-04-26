import { z } from "zod";

function isSafeRedirectPath(path: string): boolean {
  if (
    path.startsWith("//") ||
    path.includes("://") ||
    path.includes("\\") ||
    /[\r\n]/.test(path)
  ) {
    return false;
  }

  return path.startsWith("/");
}

export const authCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  next: z
    .string()
    .default("/")
    .refine(isSafeRedirectPath, "Invalid redirect path"),
});

export const authErrorSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
});

export type AuthCallbackParams = z.infer<typeof authCallbackSchema>;
export type AuthErrorParams = z.infer<typeof authErrorSchema>;
