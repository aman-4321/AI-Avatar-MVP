import bcrypt from "bcryptjs";
import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { signinSchema, signupSchema } from "../zod/userSchema";
import { prisma } from "../db";
import { JWT_SECRET } from "../config";

export const userSignup = async (req: Request, res: Response) => {
  try {
    const { success, error, data } = signupSchema.safeParse(req.body);
    if (!success) {
      res.status(400).json({
        message: "Invalid inputs",
        error: error.issues,
      });
      return;
    }

    const userExists = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (userExists) {
      if (userExists.email === data.email) {
        res.status(403).json({
          message: "User with this email already exists",
        });
        return;
      }

      if (userExists.username === data.username) {
        res.status(403).json({
          message: "This username already exists",
        });
        return;
      }
    }

    const { email, password, username } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const userId = user.id;
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
    });

    const payload = { message: "User Created Successfully", username, email };
    console.log("POST /api/v1/user/signup response:", payload);
    res.status(200).json(payload);
  } catch (err) {
    console.error("POST /api/v1/user/signup error:", err);
    res.status(500).json({ message: "Error while Signing up ", error: err });
  }
};

export const userSignin = async (req: Request, res: Response) => {
  try {
    const { success, error, data } = signinSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        message: "Invalid Inputs",
        error: error.issues,
      });
      return;
    }

    const { email, password } = data;

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(401).json({
        message: "Invalid email",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid password",
      });
      return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
    });

    const payload = {
      message: "Logged in successfully",
      userId: user.id,
      email: user.email,
    };
    console.log("POST /api/v1/user/signin response:", payload);
    res.status(200).json(payload);
  } catch (err) {
    console.error("POST /api/v1/user/signin error:", err);
    res.status(500).json({ message: "Error during Signing in", error: err });
  }
};

export const userLogout = async (req: Request, res: Response) => {
  try {
    if (!req.cookies.token) {
      res.status(400).json({
        message: "Already logged out or no active session",
      });
    }

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
    });
    const payload = { message: "Logged out Successfully" };
    console.log("POST /api/v1/user/logout response:", payload);
    res.status(200).json(payload);
  } catch (err) {
    console.error("POST /api/v1/user/logout error:", err);
    res.status(500).json({ message: "Error during Logout" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const payload = {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.fullName,
    };
    console.log("GET /api/v1/user/me response:", payload);
    res.status(200).json(payload);
  } catch (err) {
    console.error("GET /api/v1/user/me error:", err);
    res.status(500).json({ message: "Error fetching profile", error: err });
  }
};
