import { type Request, type Response } from "express";
import { synthesizeSpeechBase64 } from "../services/ai/elevenlabs.service";
import { uploadBuffer } from "../services/putObject";
import { prisma } from "../db";
import { generateScriptFromIdea } from "../services/ai/openai.service";

export const synthesizeVoice = async (req: Request, res: Response) => {
  try {
    const { text, prompt, voiceId, model_id, voice_settings } = req.body as {
      text?: string;
      prompt?: string;
      voiceId?: string;
      model_id?: string;
      voice_settings?: { stability?: number; similarity_boost?: number };
    };

    let finalText = text;
    if (!finalText && prompt) {
      finalText = await generateScriptFromIdea(prompt);
    }
    if (!finalText) {
      res.status(400).json({ message: "prompt or text is required" });
      return;
    }

    const resolvedVoiceId =
      voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID || "";
    if (!resolvedVoiceId) {
      res.status(400).json({
        message:
          "voiceId is required. Provide in body or set ELEVENLABS_DEFAULT_VOICE_ID env var.",
      });
      return;
    }

    const audioBase64 = await synthesizeSpeechBase64({
      text: finalText,
      voiceId: resolvedVoiceId,
      modelId: model_id,
      voiceSettings: voice_settings,
    });
    const buffer = Buffer.from(audioBase64, "base64");
    const userId = req.user!.id;
    const key = `audio/${userId}/${Date.now()}_${resolvedVoiceId}.mp3`;
    const url = await uploadBuffer({ key, buffer, contentType: "audio/mpeg" });

    const asset = await prisma.voiceAsset.create({
      data: {
        userId,
        text: finalText,
        voiceId: resolvedVoiceId,
        modelId: model_id || "eleven_monolingual_v1",
        stability: voice_settings?.stability ?? 0.75,
        similarity: voice_settings?.similarity_boost ?? 0.85,
        audioKey: key,
        audioUrl: url,
      },
    });

    const responsePayload = {
      audioBase64,
      audioKey: key,
      audioUrl: url,
      asset,
    };
    console.log("POST /api/v1/voice/synthesize response:", responsePayload);
    res.status(200).json(responsePayload);
  } catch (err) {
    console.error("POST /api/v1/voice/synthesize error:", err);
    res.status(500).json({ message: "Error synthesizing voice", error: err });
  }
};

export const listVoices = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const assets = await prisma.voiceAsset.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ voices: assets });
  } catch (err) {
    console.error("GET /api/v1/voice error:", err);
    res.status(500).json({ message: "Error fetching voices", error: err });
  }
};

export const listProviderVoices = async (req: Request, res: Response) => {
  try {
    console.log("GET /api/v1/voice/providers/elevenlabs/voices hit");
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
      },
    });
    if (!response.ok) {
      const body = await response.text();
      console.error(
        "GET /api/v1/voice/providers/elevenlabs/voices upstream error:",
        response.status,
        response.statusText,
        body
      );
      res.status(500).json({
        message: `Failed to fetch voices: ${response.status} ${response.statusText}`,
      });
      return;
    }
    const data = await response.json();
    console.log(
      "GET /api/v1/voice/providers/elevenlabs/voices response:",
      Array.isArray((data as any)?.voices)
        ? `voices=${(data as any).voices.length}`
        : data
    );
    res.status(200).json(data);
  } catch (error: any) {
    console.error(
      "GET /api/v1/voice/providers/elevenlabs/voices error:",
      error
    );
    res
      .status(500)
      .json({ message: error.message || "Error fetching provider voices" });
  }
};
