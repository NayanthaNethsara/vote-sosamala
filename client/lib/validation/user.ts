import { z } from "zod";

export const userRoleValues = ["guest", "admin", "super-admin"] as const;

export const systemUserSchema = z.object({
  firebaseUid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string().nullable(),
  role: z.enum(userRoleValues),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const systemUserListSchema = z.array(systemUserSchema);
