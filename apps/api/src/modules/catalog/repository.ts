import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";

export async function listCities(db: Kysely<Database>) {
  return db
    .selectFrom("cities")
    .select(["id", "code", "name_fa", "is_active", "is_village", "parent_city_id"])
    .where("is_active", "=", true)
    .orderBy("is_village", "asc")
    .orderBy("name_fa", "asc")
    .execute();
}

export async function listCategories(db: Kysely<Database>) {
  return db
    .selectFrom("categories")
    .select(["id", "slug", "name_fa", "content_types", "metadata_schema", "sort_order", "is_active"])
    .where("is_active", "=", true)
    .orderBy("sort_order", "asc")
    .execute();
}
