import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";
import { AppError } from "../../errors.js";

export async function assertPublicContent(db: Kysely<Database>, id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new AppError("not_found", "آگهی پیدا نشد.", 404);
  }
  const row = await db.selectFrom("market_contents").select("id")
    .where("id", "=", id).where("status", "=", "approved").where("deleted_at", "is", null)
    .where((eb) => eb.or([eb("expires_at", "is", null), eb("expires_at", ">", new Date())]))
    .executeTakeFirst();
  if (!row) throw new AppError("not_found", "آگهی پیدا نشد.", 404);
}
