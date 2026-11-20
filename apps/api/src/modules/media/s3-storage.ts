import { PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "node:crypto";
import { AppError } from "../../errors.js";

const MAX_IMAGE_BYTES = 1_500_000;
const MAX_VIDEO_BYTES = 12_000_000;
const supportedMimeTypes = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);
const supportedVideoTypes = new Map([["video/mp4", "mp4"], ["video/webm", "webm"], ["video/quicktime", "mov"]]);

export interface S3MediaStore {
  saveListingImage(input: { dataUrl: string; ownerUserId: string }): Promise<{ url: string; storage_key: string; size_bytes: number; mime_type: string; checksum_sha256: string }>;
  saveListingMedia(input: { dataUrl: string; ownerUserId: string }): Promise<{ url: string; storage_key: string; size_bytes: number; mime_type: string; checksum_sha256: string }>;
  readPublicAsset(relativePath: string): Promise<{ body: Buffer; mime_type: string }>;
}

export function createS3MediaStore(input: { bucket: string; region: string; endpoint?: string; accessKeyId: string; secretAccessKey: string; publicBaseUrl: string }): S3MediaStore {
  const client = new S3Client({ region: input.region, ...(input.endpoint ? { endpoint: input.endpoint, forcePathStyle: true } : {}), credentials: { accessKeyId: input.accessKeyId, secretAccessKey: input.secretAccessKey } });
  return {
    async saveListingMedia({ dataUrl, ownerUserId }) {
      const parsed = parseMediaDataUrl(dataUrl);
      const extension = supportedMimeTypes.get(parsed.mimeType) ?? supportedVideoTypes.get(parsed.mimeType);
      if (!extension) throw new AppError("validation_failed", "فرمت عکس پشتیبانی نمی‌شود.", 400);
      if (parsed.buffer.byteLength > (parsed.mimeType.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) throw new AppError("validation_failed", "حجم رسانه زیاد است.", 400);
      const safeOwner = ownerUserId.replace(/[^a-zA-Z0-9_-]/g, "");
      const folder = parsed.mimeType.startsWith("video/") ? "listing-videos" : "listing-images";
      const storageKey = `${folder}/${safeOwner}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const checksum = crypto.createHash("sha256").update(parsed.buffer).digest("hex");
      await client.send(new PutObjectCommand({ Bucket: input.bucket, Key: storageKey, Body: parsed.buffer, ContentType: parsed.mimeType, Metadata: { checksum_sha256: checksum } }));
      return { url: `${input.publicBaseUrl.replace(/\/$/, "")}/${storageKey}`, storage_key: storageKey, size_bytes: parsed.buffer.byteLength, mime_type: parsed.mimeType, checksum_sha256: checksum };
    },
    async saveListingImage(input) { return this.saveListingMedia(input); },
    async readPublicAsset(relativePath) {
      const key = relativePath.replace(/^[/\\]+/, "");
      const result = await client.send(new GetObjectCommand({ Bucket: input.bucket, Key: key }));
      if (!result.Body) throw new AppError("not_found", "فایل پیدا نشد.", 404);
      const body = Buffer.from(await result.Body.transformToByteArray());
      return { body, mime_type: result.ContentType ?? "application/octet-stream" };
    }
  };
}

function parseMediaDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp)|video\/(?:mp4|webm|quicktime));base64,([a-zA-Z0-9+/=]+)$/.exec(dataUrl);
  if (!match?.[1] || !match[2]) throw new AppError("validation_failed", "داده عکس معتبر نیست.", 400);
  const buffer = Buffer.from(match[2], "base64");
  const mimeType = match[1];
  const valid = mimeType.startsWith("video/")
    ? (mimeType === "video/webm" ? buffer.length >= 4 && buffer.subarray(0, 4).toString("ascii") === "\x1aE\xdf\xa3" : buffer.length >= 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp")
    : mimeType === "image/png"
    ? buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    : mimeType === "image/jpeg"
      ? buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
      : buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (!valid) throw new AppError("validation_failed", "محتوای فایل با فرمت اعلام‌شده سازگار نیست.", 400);
  return { mimeType, buffer };
}
