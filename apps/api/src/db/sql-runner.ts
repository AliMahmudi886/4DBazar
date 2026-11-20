import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

export async function runSqlFiles(databaseUrl: string, directory: string, trackMigrations: boolean) {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const files = (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort();

    for (const file of files) {
      const id = file;
      if (trackMigrations) {
        await client.query(
          "create table if not exists schema_migrations (id varchar(128) primary key, applied_at timestamptz not null default now())"
        );
        const existing = await client.query("select id from schema_migrations where id = $1", [id]);
        if (existing.rowCount) {
          continue;
        }
      }

      const sql = await readFile(path.join(directory, file), "utf8");
      await client.query("begin");
      try {
        await client.query(sql);
        if (trackMigrations) {
          await client.query("insert into schema_migrations (id) values ($1)", [id]);
        }
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}
