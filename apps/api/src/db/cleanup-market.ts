import "dotenv/config";
import path from "node:path";
import { config as loadDotenv } from "dotenv";
import pg from "pg";
import { loadConfig } from "../config.js";

const confirmation = "DELETE_ALL_MARKET_CONTENT";

loadDotenv({ path: path.resolve(process.cwd(), "../../.env"), quiet: true });
loadDotenv({ path: path.resolve(process.cwd(), ".env"), quiet: true });

if (process.env.MARKET_CLEANUP_CONFIRM !== confirmation) {
  throw new Error(
    `Refusing to delete market content. Set MARKET_CLEANUP_CONFIRM=${confirmation} to continue.`
  );
}

const config = loadConfig();
const client = new pg.Client({ connectionString: config.DATABASE_URL });

await client.connect();

try {
  await client.query("begin");
  await client.query(`
    create temporary table _4d_content_to_delete on commit drop as
    select id from market_contents
  `);

  const countResult = await client.query<{ count: string }>(
    "select count(*)::text as count from _4d_content_to_delete"
  );
  const contentCount = Number(countResult.rows[0]?.count ?? 0);

  await client.query(`
    delete from moderation_cases
    where target_id in (select id from _4d_content_to_delete)
       or report_id in (
         select id from reports
         where target_id in (select id from _4d_content_to_delete)
       )
  `);
  await client.query(
    "delete from reports where target_id in (select id from _4d_content_to_delete)"
  );
  await client.query(
    "delete from audit_logs where target_id in (select id from _4d_content_to_delete)"
  );
  await client.query(
    "delete from analytics_events where target_id in (select id from _4d_content_to_delete)"
  );
  await client.query(
    "delete from market_contents where id in (select id from _4d_content_to_delete)"
  );
  await client.query("commit");

  console.info(`Market cleanup deleted ${contentCount} content item(s).`);
  console.info("Uploaded media files were preserved.");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
