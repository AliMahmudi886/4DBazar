import crypto from "node:crypto";
import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";

export async function createSupportTicket(db: Kysely<Database>, input: { userId: string; subject: string; message: string }) {
  const now = new Date();
  return db.insertInto("support_tickets").values({
    id: crypto.randomUUID(), user_id: input.userId, subject: input.subject.trim().slice(0, 160),
    message: input.message.trim(), status: "open", admin_reply: null, created_at: now, updated_at: now
  }).returningAll().executeTakeFirstOrThrow();
}

export function listSupportTickets(db: Kysely<Database>, userId?: string) {
  if (userId) {
    return db.selectFrom("support_tickets").selectAll().where("user_id", "=", userId).orderBy("created_at", "desc").limit(100).execute();
  }
  return db.selectFrom("support_tickets")
    .leftJoin("users", "users.id", "support_tickets.user_id")
    .leftJoin("user_profiles", "user_profiles.user_id", "support_tickets.user_id")
    .select([
      "support_tickets.id", "support_tickets.user_id", "support_tickets.subject", "support_tickets.message",
      "support_tickets.status", "support_tickets.admin_reply", "support_tickets.created_at", "support_tickets.updated_at",
      "users.phone_number as user_phone_number", "user_profiles.display_name as user_display_name",
      "user_profiles.first_name as user_first_name", "user_profiles.last_name as user_last_name"
    ])
    .orderBy("support_tickets.created_at", "desc").limit(100).execute();
}

export async function replyToSupportTicket(db: Kysely<Database>, input: { ticketId: string; reply: string; status?: "open" | "in_progress" | "closed" }) {
  return db.updateTable("support_tickets").set({ admin_reply: input.reply.trim(), status: input.status ?? "closed", updated_at: new Date() })
    .where("id", "=", input.ticketId).returningAll().executeTakeFirstOrThrow();
}
