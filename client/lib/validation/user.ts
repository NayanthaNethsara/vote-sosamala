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

const userListResponseObjectSchema = z.object({
  users: systemUserListSchema,
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(100),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
  filters: z.object({
    role: z
      .union([z.enum(userRoleValues), z.null(), z.literal("")])
      .transform((value) => (value === "" ? null : value)),
  }),
});

export const userListResponseSchema = z
  .union([userListResponseObjectSchema, systemUserListSchema])
  .transform((value) => {
    if (Array.isArray(value)) {
      return {
        users: value,
        pagination: {
          page: 1,
          limit: value.length,
          total: value.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        filters: {
          role: null,
        },
      };
    }

    return value;
  });
