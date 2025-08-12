import { type Request, type Response } from "express";
import { createAvatarSchema, saveAvatarSchema } from "../zod/avatarSchema";
import { uploadBuffer, deleteObject } from "../services/putObject";
import { generateDalle3Image } from "../services/ai/openai.service";
import { prisma } from "../db";

export const createAvatar = async (req: Request, res: Response) => {
  try {
    const parsed = createAvatarSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Invalid inputs", error: parsed.error.issues });
      return;
    }

    const { prompt } = parsed.data as { prompt: string };
    const { imageUrl: remoteUrl } = await generateDalle3Image(prompt, "url");
    const responsePayload = {
      created: Date.now(),
      data: [{ url: remoteUrl, revised_prompt: prompt }],
    };
    console.log("POST /api/v1/avatars response:", responsePayload);
    res.status(200).json(responsePayload);
  } catch (err) {
    console.error("POST /api/v1/avatars error:", err);
    res.status(500).json({ message: "Error creating avatar", error: err });
  }
};

export const listAvatars = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, Number(req.query.page || 1));
    const limitRaw = Number(req.query.limit || 50);
    const limit = Math.min(Math.max(1, limitRaw), 100);
    const skip = (page - 1) * limit;

    const [avatars, total] = await Promise.all([
      prisma.avatar.findMany({
        where: { userId },
        orderBy: [{ preferred: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.avatar.count({ where: { userId } }),
    ]);
    res.status(200).json({ avatars, pagination: { page, limit, total } });
  } catch (err) {
    console.error("GET /api/v1/avatars error:", err);
    res.status(500).json({ message: "Error fetching avatars", error: err });
  }
};

export const saveSelectedAvatar = async (req: Request, res: Response) => {
  try {
    const parsed = saveAvatarSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Invalid inputs", error: parsed.error.issues });
      return;
    }
    const { imageUrl, prompt, preferred } = parsed.data;
    const userId = req.user!.id;

    const resp = await fetch(imageUrl);
    if (!resp.ok) {
      res.status(400).json({ message: "Unable to fetch provided imageUrl" });
      return;
    }
    const contentType = resp.headers.get("content-type") || "image/png";
    const arrayBuf = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const key = `avatars/${userId}/${Date.now()}.png`;
    const publicUrl = await uploadBuffer({ key, buffer, contentType });

    if (preferred) {
      await prisma.avatar.updateMany({
        where: { userId },
        data: { preferred: false },
      });
    }

    const avatar = await prisma.avatar.create({
      data: {
        userId,
        prompt,
        imageUrl: publicUrl,
        imageKey: key,
        preferred: Boolean(preferred),
      },
    });
    const responsePayload = { message: "Avatar saved", avatar };
    console.log("POST /api/v1/avatars/save response:", responsePayload);
    res.status(200).json(responsePayload);
  } catch (err) {
    console.error("POST /api/v1/avatars/save error:", err);
    res.status(500).json({ message: "Error saving avatar", error: err });
  }
};

export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { avatarId } = req.body as { avatarId?: string };
    if (!avatarId) {
      res.status(400).json({ message: "avatarId is required" });
      return;
    }
    const avatar = await prisma.avatar.findFirst({
      where: { id: avatarId, userId },
    });
    if (!avatar) {
      res.status(404).json({ message: "Avatar not found" });
      return;
    }
    if (avatar.imageKey) {
      await deleteObject({ key: avatar.imageKey });
    }
    await prisma.avatar.delete({ where: { id: avatarId } });
    const responsePayload = { message: "Avatar deleted" };
    console.log("POST /api/v1/avatars/delete response:", responsePayload);
    res.status(200).json(responsePayload);
  } catch (err) {
    console.error("POST /api/v1/avatars/delete error:", err);
    res.status(500).json({ message: "Error deleting avatar", error: err });
  }
};
