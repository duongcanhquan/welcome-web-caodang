import { S3Client } from "@aws-sdk/client-s3";
import { serverEnv } from "@/lib/config/env";

let _client: S3Client | null = null;

/** S3 client trỏ tới Cloudflare R2 — singleton */
export function getR2Client(): S3Client {
  if (_client) return _client;

  const { accountId, accessKeyId, secretAccessKey } = serverEnv.r2;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Biến môi trường R2 chưa được cấu hình đầy đủ");
  }

  _client = new S3Client({
    region: "auto",
    endpoint: serverEnv.r2.endpoint(),
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    // R2 không cần checksum linh hoạt của AWS SDK v3 — giảm lỗi buffer
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return _client;
}

/** URL công khai vĩnh viễn cho object trên R2 (custom domain) */
export function getR2PublicUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";
  return `${base}/${key}`;
}
