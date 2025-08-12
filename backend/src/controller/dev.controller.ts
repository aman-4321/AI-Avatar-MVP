import { type Request, type Response } from "express";
import { prisma } from "../db";

// Development utility: wipe all DB tables.
// This endpoint is intentionally unauthenticated but blocked in production.
export const wipeDatabase = async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV === "production") {
      res.status(403).json({ message: "Forbidden in production" });
      return;
    }

    const [videoJobs, voiceAssets, avatars, users] = await prisma.$transaction([
      prisma.videoJob.deleteMany(),
      prisma.voiceAsset.deleteMany(),
      prisma.avatar.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    res.status(200).json({
      message: "Database wiped",
      counts: {
        videoJobs: videoJobs.count,
        voiceAssets: voiceAssets.count,
        avatars: avatars.count,
        users: users.count,
      },
    });
  } catch (err) {
    console.error("POST /api/v1/dev/wipe error:", err);
    res.status(500).json({ message: "Error wiping database", error: err });
  }
};
