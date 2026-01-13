import { z } from "zod";

// Username validation: 3-30 chars, lowercase, alphanumeric + underscores
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores")
  .transform((val) => val.toLowerCase());

// Email validation
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .transform((val) => val.toLowerCase());

// Password validation: min 8 chars
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be at most 100 characters");

// Registration schema
export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().max(100).optional(),
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Link schemas
export const createLinkSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  url: z.string().url("Invalid URL").max(2000),
  platform: z.string().max(50).optional(),
  icon: z.string().max(100).optional(),
});

export const updateLinkSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(255).optional(),
  url: z.string().url().max(2000).optional(),
  platform: z.string().max(50).optional(),
  icon: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const reorderLinksSchema = z.object({
  links: z.array(z.object({
    id: z.string(),
    displayOrder: z.number().int().min(0),
  })),
});

// Profile update schema
export const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  theme: z.string().max(50).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
