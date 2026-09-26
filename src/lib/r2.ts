import { AwsClient } from "aws4fetch";
import { r2PutHeaders } from "@/lib/upload-image";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim() &&
      process.env.R2_BUCKET_NAME?.trim() &&
      process.env.R2_PUBLIC_URL?.trim(),
  );
}

export async function uploadImageToR2(options: {
  key: string;
  body: ArrayBuffer;
  contentType: string;
}): Promise<string> {
  const accountId = requiredEnv("R2_ACCOUNT_ID");
  const bucket = requiredEnv("R2_BUCKET_NAME");
  const publicUrl = requiredEnv("R2_PUBLIC_URL").replace(/\/$/, "");

  const client = new AwsClient({
    accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    service: "s3",
    region: "auto",
  });

  // R2 rejects chunked PUTs with 411 MissingContentLength. Send a fixed-length
  // body (ArrayBuffer) and include Content-Length on the signed request.
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${options.key}`;
  const response = await client.fetch(endpoint, {
    method: "PUT",
    body: options.body,
    headers: r2PutHeaders(options.contentType, options.body.byteLength),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`R2 upload failed (${response.status}): ${detail}`);
  }

  return `${publicUrl}/${options.key}`;
}
