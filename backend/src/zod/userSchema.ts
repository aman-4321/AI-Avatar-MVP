import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(128),
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});
