import { type Request, type Response } from "express";
import { createVideoSchema } from "../zod/videoSchema";
import { prisma } from "../db";
import { createDidVideo } from "../services/ai/did.service";
import { generateScriptFromIdea } from "../services/ai/openai.service";
import { getObjectURL } from "../services/getObject";

export const createVideoJob = async (req: Request, res: Response) => {
  try {
    const parsed = createVideoSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Invalid inputs", error: parsed.error.issues });
      return;
    }

    const {
      avatarId,
      imageUrl,
      script,
      voiceId,
      audioKey,
      audioUrl,
      prompt: bodyPrompt,
      refinePrompt,
    } = parsed.data as {
      avatarId: string;
      imageUrl?: string;
      script?: string;
      voiceId?: string;
      audioKey?: string;
      audioUrl?: string;
      prompt?: string;
      refinePrompt?: boolean;
    };
    const userId = req.user!.id;

    let avatarImageUrl = imageUrl;
    if (!avatarImageUrl) {
      const avatar = await prisma.avatar.findUnique({
        where: { id: avatarId! },
      });
      if (!avatar) {
        res.status(404).json({ message: "Avatar not found" });
        return;
      }
      avatarImageUrl = avatar.imageUrl;
    }

    const resolvedAudioUrl =
      audioUrl || (audioKey ? await getObjectURL(audioKey) : undefined);
    let effectiveScript = script;
    if (!resolvedAudioUrl) {
      if (bodyPrompt && (refinePrompt ?? true)) {
        effectiveScript = await generateScriptFromIdea(bodyPrompt);
      } else if (!effectiveScript && bodyPrompt) {
        effectiveScript = bodyPrompt;
      }
    }

    const did = await createDidVideo({
      avatarImageUrl: avatarImageUrl!,
      text: resolvedAudioUrl ? undefined : effectiveScript,
      voiceId: resolvedAudioUrl ? undefined : voiceId,
      audioUrl: resolvedAudioUrl,
    });

    const outputUrl = did.result_url || "";

    const job = await prisma.videoJob.create({
      data: {
        userId,
        avatarId: avatarId!,
        script: resolvedAudioUrl ? "[audio provided]" : effectiveScript || "",
        voiceId: resolvedAudioUrl ? null : voiceId || null,
        status: outputUrl ? "completed" : "queued",
        outputUrl: outputUrl || "",
      },
    });
    const responsePayload = { message: "Video created", job };
    console.log("POST /api/v1/videos response:", responsePayload);
    res.status(200).json(responsePayload);
  } catch (err) {
    console.error("POST /api/v1/videos error:", err);
    res.status(500).json({ message: "Error creating video", error: err });
  }
};

export const listVideoJobs = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, Number(req.query.page || 1));
    const limitRaw = Number(req.query.limit || 50);
    const limit = Math.min(Math.max(1, limitRaw), 100);
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.videoJob.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.videoJob.count({ where: { userId } }),
    ]);
    res.status(200).json({ jobs, pagination: { page, limit, total } });
  } catch (err) {
    console.error("GET /api/v1/videos error:", err);
    res.status(500).json({ message: "Error fetching videos", error: err });
  }
};
