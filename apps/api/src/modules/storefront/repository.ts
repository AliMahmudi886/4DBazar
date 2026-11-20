import crypto from "node:crypto";
import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";
import { listMediaForContents } from "../media/repository.js";
import { PUBLIC_FEED_STATUS } from "../content/repository.js";

export interface StorefrontInput {
  ownerUserId: string;
  categoryId: string;
  cityId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  businessType: string;
  address?: string;
  phone?: string;
  secondaryPhone?: string;
  workingHours?: unknown;
  logoAssetId?: string | null;
  coverAssetId?: string | null;
}

export function normalizeStorefrontSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-").slice(0, 80);
}

const selectFields = ["id", "owner_user_id", "category_id", "city_id", "name", "slug", "short_description", "description", "business_type", "address", "phone", "secondary_phone", "working_hours", "logo_asset_id", "cover_asset_id", "status", "rejection_reason", "verified_at", "created_at", "updated_at"] as const;

export async function getStorefrontById(db: Kysely<Database>, id: string) {
  return db.selectFrom("storefronts").select(selectFields).where("id", "=", id).executeTakeFirst();
}

export async function getStorefrontBySlug(db: Kysely<Database>, slug: string, includePrivate = false) {
  let query = db.selectFrom("storefronts").select(selectFields).where("slug", "=", slug);
  if (!includePrivate) query = query.where("status", "=", "active");
  return query.executeTakeFirst();
}

export async function getStorefrontByOwner(db: Kysely<Database>, ownerUserId: string) {
  return db.selectFrom("storefronts").select(selectFields).where("owner_user_id", "=", ownerUserId).executeTakeFirst();
}

export async function createStorefront(db: Kysely<Database>, input: StorefrontInput) {
  const now = new Date();
  const id = crypto.randomUUID();
  await db.insertInto("storefronts").values({
    id, owner_user_id: input.ownerUserId, category_id: input.categoryId, city_id: input.cityId,
    name: input.name.trim().slice(0, 160), slug: normalizeStorefrontSlug(input.slug),
    short_description: input.shortDescription.trim().slice(0, 240), description: input.description.trim().slice(0, 5000),
    business_type: input.businessType.trim().slice(0, 100), address: input.address?.trim().slice(0, 240) || null,
    phone: input.phone?.trim().slice(0, 32) || null, secondary_phone: input.secondaryPhone?.trim().slice(0, 32) || null,
    working_hours: input.workingHours ?? {}, logo_asset_id: input.logoAssetId ?? null, cover_asset_id: input.coverAssetId ?? null,
    status: "pending_review", rejection_reason: null, verified_at: null, created_at: now, updated_at: now
  }).execute();
  return getStorefrontById(db, id);
}

export async function updateStorefront(db: Kysely<Database>, id: string, input: StorefrontInput) {
  const now = new Date();
  await db.updateTable("storefronts").set({
    category_id: input.categoryId, city_id: input.cityId, name: input.name.trim().slice(0, 160), slug: normalizeStorefrontSlug(input.slug),
    short_description: input.shortDescription.trim().slice(0, 240), description: input.description.trim().slice(0, 5000), business_type: input.businessType.trim().slice(0, 100),
    address: input.address?.trim().slice(0, 240) || null, phone: input.phone?.trim().slice(0, 32) || null, secondary_phone: input.secondaryPhone?.trim().slice(0, 32) || null,
    working_hours: input.workingHours ?? {}, logo_asset_id: input.logoAssetId ?? null, cover_asset_id: input.coverAssetId ?? null,
    status: "pending_review", rejection_reason: null, updated_at: now
  }).where("id", "=", id).where("owner_user_id", "=", input.ownerUserId).execute();
  return getStorefrontById(db, id);
}

export async function listStorefrontListings(db: Kysely<Database>, storefrontId: string) {
  const rows = await db.selectFrom("market_contents").leftJoin("listings", "listings.content_id", "market_contents.id")
    .leftJoin("storefronts", "storefronts.id", "market_contents.storefront_id")
    .select(["market_contents.id", "market_contents.title", "market_contents.description", "market_contents.city_id", "market_contents.category_id", "market_contents.content_type", "market_contents.status", "market_contents.created_at", "market_contents.storefront_id", "storefronts.slug as storefront_slug", "storefronts.name as storefront_name", "market_contents.metadata_json", "listings.price_amount", "listings.price_type", "listings.item_condition", "listings.image_data_url"])
    .where("market_contents.storefront_id", "=", storefrontId).where("market_contents.status", "=", PUBLIC_FEED_STATUS).where("market_contents.deleted_at", "is", null).where((eb) => eb.or([eb("market_contents.expires_at", "is", null), eb("market_contents.expires_at", ">", new Date())])).orderBy("market_contents.created_at", "desc").limit(50).execute();
  const media = await listMediaForContents(db, rows.map((row) => row.id));
  const viewRows = rows.length ? await db.selectFrom("analytics_events").select("target_id").select((eb) => eb.fn.countAll<number>().as("count")).where("event_name", "=", "listing_view").where("target_type", "=", "listing").where("target_id", "in", rows.map((row) => row.id)).groupBy("target_id").execute() : [];
  const viewCounts = new Map(viewRows.map((row) => [row.target_id, Number(row.count)]));
  return rows.map((row) => ({ ...row, media: media.get(row.id) ?? [], view_count: viewCounts.get(row.id) ?? 0 }));
}

export async function listStorefrontsForAdmin(db: Kysely<Database>) {
  return db.selectFrom("storefronts")
    .leftJoin("users", "users.id", "storefronts.owner_user_id")
    .leftJoin("user_profiles", "user_profiles.user_id", "storefronts.owner_user_id")
    .select([
      "storefronts.id", "storefronts.owner_user_id", "storefronts.category_id", "storefronts.city_id", "storefronts.name", "storefronts.slug", "storefronts.short_description", "storefronts.description", "storefronts.business_type", "storefronts.address", "storefronts.phone", "storefronts.secondary_phone", "storefronts.working_hours", "storefronts.logo_asset_id", "storefronts.cover_asset_id", "storefronts.status", "storefronts.rejection_reason", "storefronts.verified_at", "storefronts.created_at", "storefronts.updated_at",
      "users.phone_number as owner_phone_number",
      "user_profiles.display_name as owner_display_name",
      "user_profiles.first_name as owner_first_name",
      "user_profiles.last_name as owner_last_name"
    ])
    .where("storefronts.status", "in", ["pending_review", "suspended"])
    .orderBy("storefronts.updated_at", "desc")
    .limit(100)
    .execute();
}

export async function decideStorefront(db: Kysely<Database>, id: string, decision: "approve" | "suspend" | "archive", reason?: string) {
  const status = decision === "approve" ? "active" : decision === "suspend" ? "suspended" : "archived";
  await db.updateTable("storefronts").set({ status, rejection_reason: reason?.trim().slice(0, 500) || null, verified_at: status === "active" ? new Date() : null, updated_at: new Date() }).where("id", "=", id).execute();
  return getStorefrontById(db, id);
}
