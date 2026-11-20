import crypto from "node:crypto";
import type { Kysely } from "kysely";
import type { Database } from "../db/types.js";

export interface AuditEntry {
  actorUserId?: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogger {
  record(entry: AuditEntry): Promise<void>;
}

export class ConsoleAuditLogger implements AuditLogger {
  async record(entry: AuditEntry): Promise<void> {
    console.info(
      JSON.stringify({
        type: "audit",
        ...entry,
        createdAt: new Date().toISOString()
      })
    );
  }
}

export class CompositeAuditLogger implements AuditLogger {
  constructor(private readonly loggers: readonly AuditLogger[]) {}

  async record(entry: AuditEntry): Promise<void> {
    const results = await Promise.allSettled(this.loggers.map((logger) => logger.record(entry)));
    for (const result of results) {
      if (result.status === "rejected") {
        console.warn(
          JSON.stringify({
            type: "audit_logger_error",
            message: result.reason instanceof Error ? result.reason.message : "unknown audit logger failure"
          })
        );
      }
    }
  }
}

export class DatabaseAuditLogger implements AuditLogger {
  constructor(private readonly db: Kysely<Database>) {}

  async record(entry: AuditEntry): Promise<void> {
    await this.db
      .insertInto("audit_logs")
      .values({
        id: crypto.randomUUID(),
        actor_user_id: entry.actorUserId ?? null,
        action: entry.action,
        target_type: entry.targetType,
        target_id: entry.targetId,
        metadata_json: entry.metadata ?? null,
        created_at: new Date()
      })
      .execute();
  }
}
