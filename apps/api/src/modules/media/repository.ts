import crypto from "node:crypto";
import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";

export interface CreateMediaAssetInput {
  ownerUserId: string;
  storageKey: string;
  publicUrl: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
}

export async function createMediaAsset(db: Kysely<Database>, input: CreateMediaAssetInput) {
  const id = crypto.randomUUID();
  return db.insertInto("media_assets").values({
    id,
    owner_user_id: input.ownerUserId,
    storage_key: input.storageKey,
    public_url: input.publicUrl,
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes,
    checksum_sha256: input.checksumSha256,
    created_at: new Date()
  }).returningAll().executeTakeFirstOrThrow();
}

export async function attachMediaAssets(db: Kysely<Database>, contentId: string, ownerUserId: string, assetIds: string[]) {
  if (!assetIds.length) return;
  const assets = await db.selectFrom("media_assets").select(["id", "mime_type"]).where("owner_user_id", "=", ownerUserId).where("id", "in", assetIds).execute();
  if (assets.length !== assetIds.length) throw new Error("media_not_owned");
  const videos = assets.filter((asset) => asset.mime_type.startsWith("video/")).length;
  const images = assets.length - videos;
  if (videos > 1 || images > 6) throw new Error("media_limit");
  await db.insertInto("listing_media").values(assetIds.map((assetId, index) => ({
    content_id: contentId, asset_id: assetId, media_role: assets.find((asset) => asset.id === assetId)?.mime_type.startsWith("video/") ? "video" : "image", sort_order: index, created_at: new Date()
  }))).execute();
}

export async function listMediaForContents(db: Kysely<Database>, contentIds: string[]) {
  if (!contentIds.length) return new Map<string, Array<{ asset_id: string; url: string; mime_type: string; media_role: string; sort_order: number }>>();
  const rows = await db.selectFrom("listing_media").innerJoin("media_assets", "media_assets.id", "listing_media.asset_id")
    .select(["listing_media.content_id", "listing_media.asset_id", "media_assets.public_url as url", "media_assets.mime_type", "listing_media.media_role", "listing_media.sort_order"])
    .where("listing_media.content_id", "in", contentIds).orderBy("listing_media.sort_order", "asc").execute();
  const result = new Map<string, Array<{ asset_id: string; url: string; mime_type: string; media_role: string; sort_order: number }>>();
  for (const row of rows) result.set(row.content_id, [...(result.get(row.content_id) ?? []), row]);
  return result;
}
