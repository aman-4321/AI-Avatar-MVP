import dotenv from "dotenv";
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = Number(process.env.PORT || 8080);

export const JWT_SECRET = requireEnv("JWT_SECRET");
export const OPENAI_API_KEY = requireEnv("OPENAI_API_KEY");
export const ELEVENLABS_API_KEY = requireEnv("ELEVENLABS_API_KEY");
export const DID_API_KEY = requireEnv("DID_API_KEY");

export const R2_ENDPOINT_URL = requireEnv("R2_ENDPOINT_URL");
export const R2_ACCESS_KEY_ID = requireEnv("R2_ACCESS_KEY_ID");
export const R2_SECRET_ACCESS_KEY = requireEnv("R2_SECRET_ACCESS_KEY");
export const R2_BUCKET_NAME = requireEnv("R2_BUCKET_NAME");
export const CLOUDFARE_WORKER_URL = requireEnv("CLOUDFARE_WORKER_URL");

export const DATABASE_URL = requireEnv("DATABASE_URL");

export const FRONTEND_URL = process.env.FRONTEND_URL || "";
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "";

if (NODE_ENV === "production") {
  if (!FRONTEND_URL) {
    throw new Error("FRONTEND_URL is required in production");
  }
}
