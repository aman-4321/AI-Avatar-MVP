import { z } from "zod";

export const createAvatarSchema = z.object({
  prompt: z.string().min(3),
});

export const createAvatarPreviewsSchema = z.object({
  prompt: z.string().min(3),
  num: z.number().min(1).max(6).optional(),
});

export const saveAvatarSchema = z.object({
  imageUrl: z.string().url(),
  prompt: z.string().min(3),
  preferred: z.boolean().optional(),
});
