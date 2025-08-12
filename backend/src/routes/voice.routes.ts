import express from "express";
import { authMiddleware } from "../middleware/middleware";
import {
  listProviderVoices,
  listVoices,
  synthesizeVoice,
} from "../controller/voice.controller";

export const voiceRouter = express.Router();

voiceRouter.post("/synthesize", authMiddleware, synthesizeVoice);
voiceRouter.get("/", authMiddleware, listVoices);
voiceRouter.get(
  "/providers/elevenlabs/voices",
  authMiddleware,
  listProviderVoices
);
