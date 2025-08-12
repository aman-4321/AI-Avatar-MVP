import express from "express";
import { authMiddleware } from "../middleware/middleware";
import {
  createAvatar,
  listAvatars,
  saveSelectedAvatar,
  deleteAvatar,
} from "../controller/avatar.controller";

export const avatarRouter = express.Router();

avatarRouter.post("/", authMiddleware, createAvatar);
avatarRouter.get("/", authMiddleware, listAvatars);
avatarRouter.post("/save", authMiddleware, saveSelectedAvatar);
avatarRouter.post("/delete", authMiddleware, deleteAvatar);
