import { PutObjectCommand } from "@aws-sdk/client-s3";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { hasR2Env, publicEnv } from "@/lib/config/env";
import { getR2Client, getR2PublicUrl } from "@/lib/r2/client";

export interface ProcessedImages {
  leafUrl: string;
  photoUrl: string;
  leafKey: string;
  photoKey: string;
}

/**
 * Resize server (Sharp): 2 bản WebP nhỏ gọn.
 * - leaf: 220×220 cover — gắn trên tán cây
 * - photo: max 640px — thẻ thần số / chi tiết
 */
export async function processSubmissionImages(
  buffer: Buffer
): Promise<{ leaf: Buffer; photo: Buffer }> {
  const leaf = await sharp(buffer)
    .rotate()
    .resize(220, 220, { fit: "cover", position: "attention" })
    .webp({ quality: 72, effort: 4 })
    .toBuffer();

  const photo = await sharp(buffer)
    .rotate()
    .resize(640, 640, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 4 })
    .toBuffer();

  return { leaf, photo };
}

async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME!;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return getR2PublicUrl(key);
}

/** Dev fallback — lưu local khi chưa cấu hình R2 */
async function uploadToDevLocal(
  key: string,
  body: Buffer
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "dev-uploads");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, key.replace(/\//g, "_"));
  await writeFile(filePath, body);
  return `${publicEnv.appUrl}/dev-uploads/${key.replace(/\//g, "_")}`;
}

async function uploadBuffer(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  if (hasR2Env()) {
    return uploadToR2(key, body, contentType);
  }

  if (process.env.NODE_ENV === "development") {
    return uploadToDevLocal(key, body);
  }

  throw new Error(
    "R2 chưa được cấu hình. Vui lòng thiết lập biến môi trường R2 hoặc chạy ở chế độ development."
  );
}

/** Upload 2 bản ảnh đã xử lý lên storage */
export async function uploadSubmissionImages(
  submissionId: string,
  imageBuffer: Buffer
): Promise<ProcessedImages> {
  const { leaf, photo } = await processSubmissionImages(imageBuffer);

  const leafKey = `submissions/${submissionId}/leaf.webp`;
  const photoKey = `submissions/${submissionId}/photo.webp`;

  const [leafUrl, photoUrl] = await Promise.all([
    uploadBuffer(leafKey, leaf, "image/webp"),
    uploadBuffer(photoKey, photo, "image/webp"),
  ]);

  return { leafUrl, photoUrl, leafKey, photoKey };
}
