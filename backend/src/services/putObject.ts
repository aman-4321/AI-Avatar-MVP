import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

export async function putObject(fileName: string, contentType: string) {
  const sanitizedFileName = fileName.replace(/\s+/g, "_");

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || "",
    Key: `uploads/jobs/outer/user-uploads/${sanitizedFileName}`,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 180 });
  return { url, key: `uploads/jobs/outer/user-uploads/${sanitizedFileName}` };
}

export async function uploadBuffer(params: {
  key: string;
  buffer: Buffer;
  contentType: string;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || "",
    Key: params.key,
    Body: params.buffer,
    ContentType: params.contentType,
  });
  await s3Client.send(command);
  const workerBase = CLOUDFARE_WORKER_URL || "";
  return workerBase
    ? `${workerBase}/video/${params.key}`
    : `video/${params.key}`;
}

export async function deleteObject(params: { key: string }): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || "",
    Key: params.key,
  });
  await s3Client.send(command);
}
