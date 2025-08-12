import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { CLOUDFARE_WORKER_URL } from "../config";

dotenv.config();

const s3Client = new S3Client({
  endpoint: process.env.R2_ENDPOINT_URL || "",
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function getObjectURL(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || "",
    Key: key,
  });

  if (!command) {
    throw new Error("Object doesnt exists");
  }

  const url = `${CLOUDFARE_WORKER_URL}/video/${key}`;
  return url;
}
