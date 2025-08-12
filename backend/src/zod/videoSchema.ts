import { z } from "zod";

export const createVideoSchema = z
  .object({
    avatarId: z.string().min(1),
    audioUrl: z.string().url().optional(),
    audioKey: z.string().min(1).optional(),
    script: z.string().min(1).optional(),
    voiceId: z.string().min(1).optional(),
  })
  .superRefine((d, ctx) => {
    const hasAudio = Boolean(d.audioUrl || d.audioKey);
    const hasScript = Boolean(d.script);
    if (!hasAudio && !hasScript) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either audioUrl/audioKey or script is required",
        path: ["script"],
      });
    }
    if (hasScript && !d.voiceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "voiceId is required when using script",
        path: ["voiceId"],
      });
    }
  });
