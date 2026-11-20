import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type { Database } from "./types.js";

const { Pool } = pg;

export function createDatabase(databaseUrl: string): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: databaseUrl
      })
    })
  });
}

export async function checkDatabase(db: Kysely<Database>): Promise<boolean> {
  try {
    await db.selectFrom("regions").select("id").limit(1).execute();
    return true;
  } catch {
    return false;
  }
}
