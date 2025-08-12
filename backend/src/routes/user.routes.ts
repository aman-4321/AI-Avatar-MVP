import express from "express";
import {
  getMe,
  userLogout,
  userSignin,
  userSignup,
} from "../controller/user.controller";
import { authMiddleware } from "../middleware/middleware";

export const userRouter = express.Router();

userRouter.post("/signup", userSignup);

userRouter.post("/signin", userSignin);

userRouter.post("/logout", userLogout);

userRouter.get("/me", authMiddleware, getMe);
