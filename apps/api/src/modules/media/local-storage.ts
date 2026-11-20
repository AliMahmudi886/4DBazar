import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { AppError } from "../../errors.js";

const MAX_IMAGE_BYTES = 1_500_000;
const MAX_VIDEO_BYTES = 12_000_000;
const supportedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);
const supportedVideoTypes = new Map([["video/mp4", "mp4"], ["video/webm", "webm"], ["video/quicktime", "mov"]]);

export interface LocalMediaStore {
  saveListingImage(input: { dataUrl: string; ownerUserId: string }): Promise<{ url: string; storage_key: string; size_bytes: number; mime_type: string; checksum_sha256: string }>;
  saveListingMedia(input: { dataUrl: string; ownerUserId: string }): Promise<{ url: string; storage_key: string; size_bytes: number; mime_type: string; checksum_sha256: string }>;
  readPublicAsset(relativePath: string): Promise<{ body: Buffer; mime_type: string }>;
}

export function createLocalMediaStore(input: { storageDir: string; publicPath: string }): LocalMediaStore {
  const rootDir = path.resolve(process.cwd(), input.storageDir);
  const publicPath = input.publicPath.startsWith("/") ? input.publicPath : `/${input.publicPath}`;

  return {
    async saveListingMedia({ dataUrl, ownerUserId }) {
      const parsed = parseMediaDataUrl(dataUrl);
      const extension = supportedMimeTypes.get(parsed.mimeType) ?? supportedVideoTypes.get(parsed.mimeType);
      if (!extension) {
        throw new AppError("validation_failed", "فرمت رسانه پشتیبانی نمی‌شود.", 400, {
          media: ["عکس‌های JPG، PNG، WEBP و ویدیوی MP4، WEBM یا MOV مجاز است."]
        });
      }
      const maxBytes = parsed.mimeType.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      if (parsed.buffer.byteLength > maxBytes) {
        throw new AppError("validation_failed", "حجم رسانه زیاد است.", 400, {
          media: [parsed.mimeType.startsWith("video/") ? "ویدیو باید کوچک‌تر از 12MB باشد." : "عکس باید کوچک‌تر از 1.5MB باشد."]
        });
      }

      const safeOwner = ownerUserId.replace(/[^a-zA-Z0-9_-]/g, "");
      const folderName = parsed.mimeType.startsWith("video/") ? "listing-videos" : "listing-images";
      const folder = path.join(rootDir, folderName, safeOwner);
      const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
      await mkdir(folder, { recursive: true });
      await writeFile(path.join(folder, filename), parsed.buffer);

      return {
        url: `${publicPath}/${folderName}/${safeOwner}/${filename}`,
        storage_key: `${folderName}/${safeOwner}/${filename}`,
        size_bytes: parsed.buffer.byteLength,
        mime_type: parsed.mimeType,
        checksum_sha256: crypto.createHash("sha256").update(parsed.buffer).digest("hex")
      };
    },
    async saveListingImage(input) { return this.saveListingMedia(input); },

    async readPublicAsset(relativePath) {
      const cleanRelativePath = relativePath.replace(/^[/\\]+/, "");
      const resolved = path.resolve(rootDir, cleanRelativePath);
      const relativeToRoot = path.relative(rootDir, resolved);
      if (!relativeToRoot || relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
        throw new AppError("not_found", "فایل پیدا نشد.", 404);
      }
      const extension = path.extname(resolved).toLowerCase();
      const mimeType = extension === ".png" ? "image/png" : extension === ".webp" ? "image/webp" : "image/jpeg";
      try {
        return {
          body: await readFile(resolved),
          mime_type: mimeType
        };
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          throw new AppError("not_found", "فایل رسانه پیدا نشد.", 404);
        }
        throw error;
      }
    }
  };
}

function parseMediaDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp)|video\/(?:mp4|webm|quicktime));base64,([a-zA-Z0-9+/=]+)$/.exec(dataUrl);
  const mimeType = match?.[1];
  const base64Body = match?.[2];
  if (!mimeType || !base64Body) {
    throw new AppError("validation_failed", "داده عکس معتبر نیست.", 400, {
      image: ["عکس باید به شکل data URL معتبر ارسال شود."]
    });
  }
  return {
    mimeType,
    buffer: validateMediaSignature(Buffer.from(base64Body, "base64"), mimeType)
  };
}

function validateMediaSignature(buffer: Buffer, mimeType: string) {
  if (mimeType.startsWith("video/")) {
    const valid = mimeType === "video/mp4" || mimeType === "video/quicktime"
      ? buffer.length >= 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp"
      : buffer.length >= 4 && buffer.subarray(0, 4).toString("ascii") === "\x1aE\xdf\xa3";
    if (!valid) throw new AppError("validation_failed", "محتوای ویدیو معتبر نیست.", 400);
    return buffer;
  }
  const valid = mimeType === "image/png"
    ? buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    : mimeType === "image/jpeg"
      ? buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
      : buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (!valid) {
    throw new AppError("validation_failed", "محتوای فایل با فرمت اعلام‌شده سازگار نیست.", 400, {
        image: ["فقط فایل واقعی JPG، PNG یا WEBP قابل پذیرش است."]
    });
  }
  return buffer;
}
