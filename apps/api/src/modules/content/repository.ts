import crypto from "node:crypto";
import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";

export const PUBLIC_FEED_STATUS = "approved" as const;
import { attachMediaAssets, listMediaForContents } from "../media/repository.js";
import { getPublicTrustSummary, getPublicTrustSummaries } from "../business/repository.js";

export interface CreateListingInput {
  contentType: "listing" | "service_listing";
  ownerUserId: string;
  cityId: string;
  categoryId: string;
  title: string;
  description: string;
  priceAmount?: number;
  priceType: "fixed" | "negotiable";
  itemCondition?: "new" | "used" | "like_new";
  imageDataUrl?: string;
  mediaAssetIds?: string[];
  serviceDetails?: {
    service_area?: string;
    pricing_model?: "quote" | "fixed" | "starting_at" | "hourly" | "daily";
    availability?: string;
    experience_years?: number;
  };
  storefrontId?: string | null;
  metadata?: Record<string, string | number>;
}

export interface ModerateContentInput {
  contentId: string;
  actorUserId: string;
  decision: "approve" | "reject";
  reason: string;
}

type ModerationMedia = {
  asset_id: string;
  url: string;
  mime_type: string;
  media_role: string;
  sort_order: number;
};

export function isSchemaCompatibilityError(error: unknown) {
  return error instanceof Error && /relation .* does not exist|column .* does not exist|undefined table|undefined column/i.test(error.message);
}

function createdListingFallback(input: CreateListingInput, contentId: string, createdAt: Date) {
  return {
    id: contentId,
    content_type: input.contentType,
    title: input.title,
    description: input.description,
    status: "submitted",
    city_id: input.cityId,
    category_id: input.categoryId,
    owner_user_id: input.ownerUserId,
    storefront_id: input.storefrontId ?? null,
    metadata_json: input.metadata ?? {},
    created_at: createdAt,
    price_amount: input.priceAmount ?? null,
    price_type: input.priceType,
    item_condition: input.itemCondition ?? null,
    image_data_url: input.imageDataUrl ?? null,
    service_area: input.serviceDetails?.service_area ?? null,
    pricing_model: input.serviceDetails?.pricing_model ?? null,
    availability: input.serviceDetails?.availability ?? null,
    experience_years: input.serviceDetails?.experience_years ?? null,
    media: input.imageDataUrl ? [{ asset_id: `legacy-${contentId}`, url: input.imageDataUrl, mime_type: "image/*", media_role: "image", sort_order: 0 }] : [],
    view_count: 0
  };
}

function legacyMediaForRows(rows: Array<{ id: string; image_data_url?: string | null }>) {
  const media = new Map<string, ModerationMedia[]>();
  for (const row of rows) {
    if (!row.image_data_url) continue;
    media.set(row.id, [{
      asset_id: `legacy-${row.id}`,
      url: row.image_data_url,
      mime_type: "image/*",
      media_role: "image",
      sort_order: 0
    }]);
  }
  return media;
}

async function attachModerationMedia(db: Kysely<Database>, rows: Array<{ id: string; image_data_url?: string | null }>) {
  try {
    return await listMediaForContents(db, rows.map((row) => row.id));
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) throw error;
    return legacyMediaForRows(rows);
  }
}

async function listLegacySubmittedContents(db: Kysely<Database>) {
  const rows = await db
    .selectFrom("market_contents")
    .leftJoin("listings", "listings.content_id", "market_contents.id")
    .select([
      "market_contents.id",
      "market_contents.content_type",
      "market_contents.title",
      "market_contents.description",
      "market_contents.status",
      "market_contents.city_id",
      "market_contents.category_id",
      "market_contents.owner_user_id",
      "market_contents.created_at",
      "listings.price_amount",
      "listings.price_type",
      "listings.item_condition",
      "listings.image_data_url"
    ])
    .where("market_contents.deleted_at", "is", null)
    .where("market_contents.status", "in", ["submitted", "pending"])
    .orderBy("market_contents.created_at", "asc")
    .limit(100)
    .execute();

  const media = legacyMediaForRows(rows);
  return rows.map((row) => ({
    ...row,
    storefront_id: null,
    metadata_json: {},
    storefront_slug: null,
    storefront_name: null,
    price_amount: row.price_amount,
    price_type: row.price_type,
    item_condition: row.item_condition,
    image_data_url: row.image_data_url,
    service_area: null,
    pricing_model: null,
    availability: null,
    experience_years: null,
    media: media.get(row.id) ?? []
  }));
}

export interface UpdateListingInput {
  contentId: string;
  ownerUserId: string;
  cityId: string;
  categoryId: string;
  title: string;
  description: string;
  priceAmount?: number | null;
  priceType: "fixed" | "negotiable";
  itemCondition?: "new" | "used" | "like_new" | null;
  imageDataUrl?: string | null;
  mediaAssetIds?: string[];
  metadata?: Record<string, string | number>;
}

export const LISTING_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function updateListing(db: Kysely<Database>, input: UpdateListingInput) {
  const now = new Date();
  await db.transaction().execute(async (trx) => {
    const content = await trx.selectFrom("market_contents").select(["id", "owner_user_id", "created_at"]).where("id", "=", input.contentId).where("deleted_at", "is", null).executeTakeFirst();
    if (!content || content.owner_user_id !== input.ownerUserId) throw new Error("listing_not_owned");
    if (Date.now() - new Date(content.created_at).getTime() > LISTING_EDIT_WINDOW_MS) throw new Error("listing_edit_window_expired");
    await trx.updateTable("market_contents").set({ city_id: input.cityId, category_id: input.categoryId, title: input.title, description: input.description, metadata_json: input.metadata ?? {}, search_text: `${input.title} ${input.description}`, status: "submitted", published_at: null, updated_at: now }).where("id", "=", input.contentId).execute();
    await trx.updateTable("listings").set({ price_amount: input.priceAmount ?? null, price_type: input.priceType, item_condition: input.itemCondition ?? null, ...(input.imageDataUrl === undefined ? {} : { image_data_url: input.imageDataUrl }) }).where("content_id", "=", input.contentId).execute();
    if (input.mediaAssetIds !== undefined) {
      await trx.deleteFrom("listing_media").where("content_id", "=", input.contentId).execute();
      if (input.mediaAssetIds.length) await attachMediaAssets(trx, input.contentId, input.ownerUserId, input.mediaAssetIds);
    }
  });
  return getContentDetail(db, input.contentId);
}

export async function deleteListing(db: Kysely<Database>, contentId: string, ownerUserId: string) {
  const content = await db
    .selectFrom("market_contents")
    .select(["owner_user_id", "deleted_at"])
    .where("id", "=", contentId)
    .executeTakeFirst();
  if (!content || content.owner_user_id !== ownerUserId) throw new Error("listing_not_owned");
  if (content.deleted_at) return { id: contentId, deleted: true };

  const deleted = await db
    .updateTable("market_contents")
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where("id", "=", contentId)
    .where("owner_user_id", "=", ownerUserId)
    .where("deleted_at", "is", null)
    .returning("id")
    .executeTakeFirst();

  // A concurrent request may have deleted the row after the initial read.
  // Treat that state as success, but never report success for an untouched row.
  if (!deleted) {
    const current = await db
      .selectFrom("market_contents")
      .select(["owner_user_id", "deleted_at"])
      .where("id", "=", contentId)
      .executeTakeFirst();
    if (!current || current.owner_user_id !== ownerUserId || !current.deleted_at) {
      throw new Error("listing_delete_failed");
    }
  }
  return { id: contentId, deleted: true };
}

export async function deleteListingByModerator(db: Kysely<Database>, contentId: string) {
  const result = await db.updateTable("market_contents").set({ deleted_at: new Date(), updated_at: new Date() })
    .where("id", "=", contentId).where("deleted_at", "is", null).returning("id").executeTakeFirst();
  if (!result) throw new Error("listing_not_found");
  return { id: contentId, deleted: true };
}

export async function createListing(db: Kysely<Database>, input: CreateListingInput) {
  const contentId = crypto.randomUUID();
  const now = new Date();

  try {
    await db.transaction().execute(async (trx) => {
      await trx
        .insertInto("market_contents")
        .values({
          id: contentId,
          content_type: input.contentType,
          owner_user_id: input.ownerUserId,
          city_id: input.cityId,
          category_id: input.categoryId,
          title: input.title,
          description: input.description,
          status: "submitted",
          published_at: null,
          expires_at: null,
          search_text: `${input.title} ${input.description}`,
          created_at: now,
          updated_at: now,
          deleted_at: null,
          storefront_id: input.storefrontId ?? null,
          metadata_json: input.metadata ?? {}
        })
        .execute();

      await trx
        .insertInto("listings")
        .values({
          content_id: contentId,
          price_amount: input.priceAmount ?? null,
          price_type: input.priceType,
          item_condition: input.itemCondition ?? null,
          image_data_url: input.imageDataUrl ?? null,
          service_area: input.serviceDetails?.service_area ?? null,
          pricing_model: input.serviceDetails?.pricing_model ?? null,
          availability: input.serviceDetails?.availability ?? null,
          experience_years: input.serviceDetails?.experience_years ?? null
        })
        .execute();
      if (input.mediaAssetIds?.length) await attachMediaAssets(trx, contentId, input.ownerUserId, input.mediaAssetIds);
    });
  } catch (error) {
    // A partially upgraded cPanel database may miss only the newer optional columns.
    // Retry with the foundation schema so a submitted listing is never lost.
    if (!isSchemaCompatibilityError(error)) throw error;
    await db.transaction().execute(async (trx) => {
      await trx.insertInto("market_contents").values({
        id: contentId,
        content_type: input.contentType,
        owner_user_id: input.ownerUserId,
        city_id: input.cityId,
        category_id: input.categoryId,
        title: input.title,
        description: input.description,
        status: "submitted",
        published_at: null,
        expires_at: null,
        search_text: `${input.title} ${input.description}`,
        created_at: now,
        updated_at: now,
        deleted_at: null
      }).execute();
      await trx.insertInto("listings").values({
        content_id: contentId,
        price_amount: input.priceAmount ?? null,
        price_type: input.priceType,
        item_condition: input.itemCondition ?? null,
        image_data_url: input.imageDataUrl ?? null
      }).execute();
    });
  }

  try {
    return await getContentDetail(db, contentId);
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) throw error;
    return createdListingFallback(input, contentId, now);
  }
}

export async function getContentDetail(db: Kysely<Database>, contentId: string) {
  const content = await db
    .selectFrom("market_contents")
    .leftJoin("listings", "listings.content_id", "market_contents.id")
    .leftJoin("storefronts", "storefronts.id", "market_contents.storefront_id")
    .select([
      "market_contents.id",
      "market_contents.content_type",
      "market_contents.title",
      "market_contents.description",
      "market_contents.status",
      "market_contents.city_id",
      "market_contents.category_id",
      "market_contents.owner_user_id",
      "market_contents.storefront_id",
      "market_contents.metadata_json",
      "storefronts.slug as storefront_slug",
      "storefronts.name as storefront_name",
      "market_contents.created_at",
      "listings.price_amount",
      "listings.price_type",
      "listings.item_condition",
      "listings.image_data_url",
      "listings.service_area",
      "listings.pricing_model",
      "listings.availability",
      "listings.experience_years"
    ])
    .where("market_contents.id", "=", contentId)
    .executeTakeFirstOrThrow();
  const media = await listMediaForContents(db, [contentId]);
  const views = await db.selectFrom("analytics_events")
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .where("event_name", "=", "listing_view")
    .where("target_type", "=", "listing")
    .where("target_id", "=", contentId)
    .executeTakeFirst();
  const related = await listFeedContents(db, { exclude: contentId, category: content.category_id, city: content.city_id });
  return { ...content, media: media.get(contentId) ?? [], view_count: Number(views?.count ?? 0), seller_trust: await getPublicTrustSummary(db, content.owner_user_id).catch(() => null), related };
}

export async function listUserContents(db: Kysely<Database>, ownerUserId: string) {
  const rows = await db
    .selectFrom("market_contents")
    .leftJoin("listings", "listings.content_id", "market_contents.id")
    .leftJoin("storefronts", "storefronts.id", "market_contents.storefront_id")
    .select([
      "market_contents.id",
      "market_contents.content_type",
      "market_contents.title",
      "market_contents.description",
      "market_contents.status",
      "market_contents.city_id",
      "market_contents.category_id",
      "market_contents.owner_user_id",
      "market_contents.storefront_id",
      "market_contents.metadata_json",
      "storefronts.slug as storefront_slug",
      "storefronts.name as storefront_name",
      "market_contents.created_at",
      "listings.price_amount",
      "listings.price_type",
      "listings.item_condition",
      "listings.image_data_url",
      "listings.service_area",
      "listings.pricing_model",
      "listings.availability",
      "listings.experience_years"
    ])
    .where("market_contents.owner_user_id", "=", ownerUserId)
    .where("market_contents.deleted_at", "is", null)
    .orderBy("market_contents.created_at", "desc")
    .limit(30)
    .execute();
  const media = await listMediaForContents(db, rows.map((row) => row.id));
  return Promise.all(rows.map(async (row) => ({ ...row, media: media.get(row.id) ?? [], seller_trust: await getPublicTrustSummary(db, row.owner_user_id).catch(() => null) })));
}

export async function listFeedContents(db: Kysely<Database>, related?: { exclude: string; category: string; city: string }) {
  let query = db
    .selectFrom("market_contents")
    .leftJoin("listings", "listings.content_id", "market_contents.id")
    .leftJoin("storefronts", "storefronts.id", "market_contents.storefront_id")
    .select([
      "market_contents.id",
      "market_contents.content_type",
      "market_contents.title",
      "market_contents.description",
      "market_contents.status",
      "market_contents.city_id",
      "market_contents.category_id",
      "market_contents.owner_user_id",
      "market_contents.storefront_id",
      "market_contents.metadata_json",
      "storefronts.slug as storefront_slug",
      "storefronts.name as storefront_name",
      "market_contents.created_at",
      "listings.price_amount",
      "listings.price_type",
      "listings.item_condition",
      "listings.image_data_url",
      "listings.service_area",
      "listings.pricing_model",
      "listings.availability",
      "listings.experience_years"
    ])
    .where("market_contents.deleted_at", "is", null)
    .where("market_contents.status", "=", PUBLIC_FEED_STATUS)
    .where((eb) => eb.or([eb("market_contents.expires_at", "is", null), eb("market_contents.expires_at", ">", new Date())]))
    .orderBy("market_contents.created_at", "desc");
  if (related) query = query.where("market_contents.id", "!=", related.exclude)
    .where((eb) => eb.or([eb("market_contents.category_id", "=", related.category), eb("market_contents.city_id", "=", related.city)]));
  const rows = await query.limit(related ? 3 : 50).execute();
  const media = await listMediaForContents(db, rows.map((row) => row.id));
  const viewCounts = await listViewCounts(db, rows.map((row) => row.id));
  const trust = await getPublicTrustSummaries(db, [...new Set(rows.map(row => row.owner_user_id))]).catch(() => new Map());
  return rows.map(row => ({ ...row, media: media.get(row.id) ?? [], view_count: viewCounts.get(row.id) ?? 0, seller_trust: trust.get(row.owner_user_id) ?? null }));
}

async function listViewCounts(db: Kysely<Database>, contentIds: string[]) {
  if (!contentIds.length) return new Map<string, number>();
  const rows = await db.selectFrom("analytics_events")
    .select("target_id")
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .where("event_name", "=", "listing_view")
    .where("target_type", "=", "listing")
    .where("target_id", "in", contentIds)
    .groupBy("target_id")
    .execute();
  return new Map(rows.map((row) => [row.target_id, Number(row.count)]));
}

export async function listSubmittedContents(db: Kysely<Database>) {
  try {
    const rows = await db
      .selectFrom("market_contents")
      .leftJoin("listings", "listings.content_id", "market_contents.id")
      .leftJoin("storefronts", "storefronts.id", "market_contents.storefront_id")
      .select([
        "market_contents.id",
        "market_contents.content_type",
        "market_contents.title",
        "market_contents.description",
        "market_contents.status",
        "market_contents.city_id",
        "market_contents.category_id",
        "market_contents.owner_user_id",
        "market_contents.storefront_id",
        "market_contents.metadata_json",
        "storefronts.slug as storefront_slug",
        "storefronts.name as storefront_name",
        "market_contents.created_at",
        "listings.price_amount",
        "listings.price_type",
        "listings.item_condition",
        "listings.image_data_url",
        "listings.service_area",
        "listings.pricing_model",
        "listings.availability",
        "listings.experience_years"
      ])
      .where("market_contents.deleted_at", "is", null)
      .where("market_contents.status", "in", ["submitted", "pending"])
      .orderBy("market_contents.created_at", "asc")
      .limit(100)
      .execute();
    const media = await attachModerationMedia(db, rows);
    return rows.map((row) => ({ ...row, media: media.get(row.id) ?? [] }));
  } catch (error) {
    if (!isSchemaCompatibilityError(error)) throw error;
    return listLegacySubmittedContents(db);
  }
}

export async function moderateContent(db: Kysely<Database>, input: ModerateContentInput) {
  const nextStatus = input.decision === "approve" ? "approved" : "rejected";
  const now = new Date();

  await db.transaction().execute(async (trx) => {
    const content = await trx
      .selectFrom("market_contents")
      .select(["id", "status"])
      .where("id", "=", input.contentId)
      .where("deleted_at", "is", null)
      .executeTakeFirstOrThrow();

    await trx
      .updateTable("market_contents")
      .set({
        status: nextStatus,
        published_at: nextStatus === "approved" ? now : null,
        updated_at: now
      })
      .where("id", "=", input.contentId)
      .execute();

    await trx
      .insertInto("content_status_history")
      .values({
        id: crypto.randomUUID(),
        content_id: input.contentId,
        from_status: content.status,
        to_status: nextStatus,
        actor_user_id: input.actorUserId,
        reason: input.reason,
        created_at: now
      })
      .execute();
  });

  return getContentDetail(db, input.contentId);
}
