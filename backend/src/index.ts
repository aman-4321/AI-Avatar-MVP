import { Request, Response } from "express";
import { avatarRouter } from "./routes/avatar.routes";
import { userRouter } from "./routes/user.routes";
import { videoRouter } from "./routes/video.routes";
import { voiceRouter } from "./routes/voice.routes";
import { devRouter } from "./routes/dev.routes";
import express from "express";
import { PORT } from "./config";
import rateLimit from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";

const port = PORT || 8081;

const app = express();

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  message: "Too many requests from this IP, please try again later",
});

if (process.env.NODE_ENV === "production") {
  app.use(limiter);
}

app.use(
  cors({
    credentials: true,
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(compression());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/avatars", avatarRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/voice", voiceRouter);
app.use("/api/v1/dev", devRouter);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
  });
});

app.listen(port, () => {
  console.log(`Server running on localhost:${port}`);
});
