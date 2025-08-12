import express from "express";
import { wipeDatabase } from "../controller/dev.controller";

export const devRouter = express.Router();

// No auth on purpose; blocked in production inside the handler.
devRouter.post("/wipe", wipeDatabase);
