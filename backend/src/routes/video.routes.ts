import express from "express";
import { authMiddleware } from "../middleware/middleware";
import { createVideoJob, listVideoJobs } from "../controller/video.controller";

export const videoRouter = express.Router();

videoRouter.post("/", authMiddleware, createVideoJob);
videoRouter.get("/", authMiddleware, listVideoJobs);
