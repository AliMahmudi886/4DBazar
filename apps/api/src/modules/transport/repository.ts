import crypto from "node:crypto";
import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";

export type TransportMode = "offer" | "request";

export interface TransportSearchInput {
  query?: string | undefined;
  origin?: string | undefined;
  destination?: string | undefined;
  departureDate?: string | undefined;
  mode?: TransportMode | undefined;
  limit: number;
}

export interface CreateTransportInput {
  ownerUserId: string; cityId: string; categoryId: string; mode: TransportMode;
  title: string; description: string; originLabel: string; destinationLabel: string;
  originCityId?: string | null | undefined; destinationCityId?: string | null | undefined; departureDate: string;
  timeFrom: string; timeTo?: string | null | undefined; seatsAvailable?: number | null | undefined;
  passengerCount?: number | null | undefined; vehicleType?: string | null | undefined;
  priceType: "fixed" | "negotiable"; priceAmount?: number | null | undefined;
}

function query(db: Kysely<Database>) {
  return db.selectFrom("market_contents").innerJoin("transport_details", "transport_details.content_id", "market_contents.id").select([
    "market_contents.id", "market_contents.content_type", "market_contents.owner_user_id", "market_contents.city_id", "market_contents.category_id", "market_contents.title", "market_contents.description", "market_contents.status", "market_contents.created_at",
    "transport_details.mode", "transport_details.origin_label", "transport_details.destination_label", "transport_details.origin_city_id", "transport_details.destination_city_id", "transport_details.departure_date", "transport_details.time_from", "transport_details.time_to", "transport_details.seats_available", "transport_details.passenger_count", "transport_details.vehicle_type", "transport_details.price_type", "transport_details.price_amount", "transport_details.lifecycle_status", "transport_details.expires_at", "transport_details.cancelled_at"
  ]);
}

export async function createTransport(db: Kysely<Database>, input: CreateTransportInput) {
  const id = crypto.randomUUID(); const now = new Date();
  await db.transaction().execute(async (trx) => {
    await trx.insertInto("market_contents").values({ id, content_type: input.mode === "offer" ? "transport_offer" : "transport_request", owner_user_id: input.ownerUserId, city_id: input.cityId, category_id: input.categoryId, title: input.title, description: input.description, status: "submitted", published_at: null, expires_at: null, search_text: `${input.title} ${input.description} ${input.originLabel} ${input.destinationLabel}`, created_at: now, updated_at: now, deleted_at: null }).execute();
    await trx.insertInto("transport_details").values({ content_id: id, mode: input.mode, origin_label: input.originLabel, destination_label: input.destinationLabel, origin_city_id: input.originCityId ?? null, destination_city_id: input.destinationCityId ?? null, departure_date: input.departureDate, time_from: input.timeFrom, time_to: input.timeTo ?? null, seats_available: input.seatsAvailable ?? null, passenger_count: input.passengerCount ?? null, vehicle_type: input.vehicleType ?? null, price_type: input.priceType, price_amount: input.priceAmount ?? null, lifecycle_status: "active", expires_at: null, cancelled_at: null, created_at: now, updated_at: now }).execute();
  });
  return getTransport(db, id);
}

export async function getTransport(db: Kysely<Database>, contentId: string) { return query(db).where("market_contents.id", "=", contentId).where("market_contents.deleted_at", "is", null).executeTakeFirstOrThrow(); }
export async function listUserTransport(db: Kysely<Database>, ownerUserId: string) { return query(db).where("market_contents.owner_user_id", "=", ownerUserId).where("market_contents.deleted_at", "is", null).orderBy("market_contents.created_at", "desc").limit(50).execute(); }

export async function searchTransport(db: Kysely<Database>, input: TransportSearchInput) {
  let result = db.selectFrom("market_contents")
    .innerJoin("transport_details", "transport_details.content_id", "market_contents.id")
    .select([
      "market_contents.id", "market_contents.title", "market_contents.description",
      "market_contents.owner_user_id", "market_contents.city_id", "market_contents.category_id",
      "market_contents.created_at", "market_contents.published_at", "transport_details.mode",
      "transport_details.origin_label", "transport_details.destination_label",
      "transport_details.departure_date", "transport_details.time_from", "transport_details.time_to",
      "transport_details.seats_available", "transport_details.passenger_count", "transport_details.vehicle_type",
      "transport_details.price_type", "transport_details.price_amount", "transport_details.lifecycle_status"
    ])
    .where("market_contents.deleted_at", "is", null)
    .where("market_contents.status", "=", "approved")
    .where("transport_details.lifecycle_status", "=", "active");
  if (input.mode) result = result.where("transport_details.mode", "=", input.mode);
  if (input.departureDate) result = result.where("transport_details.departure_date", "=", input.departureDate);
  if (input.origin) result = result.where((eb) => eb.or([
    eb("transport_details.origin_label", "ilike", likePattern(input.origin)),
    eb("market_contents.search_text", "ilike", likePattern(input.origin))
  ]));
  if (input.destination) result = result.where((eb) => eb.or([
    eb("transport_details.destination_label", "ilike", likePattern(input.destination)),
    eb("market_contents.search_text", "ilike", likePattern(input.destination))
  ]));
  if (input.query) result = result.where("market_contents.search_text", "ilike", likePattern(input.query));
  return result.orderBy("transport_details.departure_date", "asc").orderBy("market_contents.created_at", "desc").limit(input.limit).execute();
}

export function normalizeTransportText(value: string) {
  return value.replace(/[يى]/g, "ی").replace(/[ك]/g, "ک").replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/\s+/g, " ").trim();
}

function likePattern(value: string | undefined) {
  const normalized = normalizeTransportText(value ?? "").slice(0, 80).replace(/[\\%_]/g, "\\$&");
  return `%${normalized}%`;
}
export async function cancelTransport(db: Kysely<Database>, contentId: string, ownerUserId: string) {
  const result = await db.updateTable("transport_details").set({ lifecycle_status: "cancelled", cancelled_at: new Date(), updated_at: new Date() }).where("content_id", "=", contentId).where("lifecycle_status", "=", "active").where("content_id", "in", db.selectFrom("market_contents").select("id").where("owner_user_id", "=", ownerUserId).where("deleted_at", "is", null)).executeTakeFirst();
  if (!result || Number(result.numUpdatedRows) === 0) throw new Error("transport_not_owned_or_inactive");
  return getTransport(db, contentId);
}
