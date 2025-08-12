import { type NextFunction, type Request, type Response } from "express";
import jwt, { TokenExpiredError, type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { prisma } from "../db";

interface User {
  id: string;
  email: string;
  fullName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.token;

  if (!token) {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
    });

    res.status(401).json({ message: "Unauthorized - No Token Provided" });
    return;
  }

  if (!JWT_SECRET) {
    res
      .status(500)
      .json({ message: "Internal server error - Missing JWT_SECRET" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded.userId) {
      res.status(401).json({ message: "Unauthorized - Invalid Token Payload" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User Not Found" });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
    });

    const message =
      err instanceof TokenExpiredError
        ? "Unauthorized - Token Expired"
        : "Unauthorized - Invalid Token";
    res.status(401).json({ message });
  }
};
