import crypto from "node:crypto";
import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";

export interface CreateContactIntentInput {
  contentId: string;
  requesterUserId: string;
  ownerUserId: string;
}

export interface CreateConversationMessageInput {
  conversationId: string;
  senderUserId: string;
  body: string;
}

export interface CreateReportInput {
  reporterUserId: string;
  targetType: "content" | "user" | "message";
  targetId: string;
  reason: string;
  description?: string;
}

export interface UpdateConversationPreferenceInput {
  conversationId: string;
  userId: string;
  isMuted: boolean;
}

export interface UpdateConversationBlockInput {
  conversationId: string;
  userId: string;
  isBlocked: boolean;
}

export interface CreateModerationDecisionInput {
  caseId: string;
  actorUserId: string;
  decision: "dismiss_report" | "escalate" | "reject_content";
  reason: string;
}

export async function createContactIntent(db: Kysely<Database>, input: CreateContactIntentInput) {
  const id = crypto.randomUUID();
  const conversationId = crypto.randomUUID();
  const now = new Date();

  await db.transaction().execute(async (trx) => {
    await trx
      .insertInto("contact_events")
      .values({
        id,
        content_id: input.contentId,
        requester_user_id: input.requesterUserId,
        owner_user_id: input.ownerUserId,
        event_type: "contact_started",
        status: "created",
        created_at: now
      })
      .execute();

    await trx
      .insertInto("conversations")
      .values({
        id: conversationId,
        content_id: input.contentId,
        buyer_user_id: input.requesterUserId,
        seller_user_id: input.ownerUserId,
        status: "open",
        created_at: now,
        updated_at: now
      })
      .onConflict((oc) =>
        oc.columns(["content_id", "buyer_user_id", "seller_user_id"]).doUpdateSet({
          status: "open",
          updated_at: now
        })
      )
      .execute();
  });

  const contact = await db.selectFrom("contact_events").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
  const conversation = await findConversationByParticipants(db, input.contentId, input.requesterUserId, input.ownerUserId);
  return { ...contact, conversation };
}

export async function findConversationByParticipants(
  db: Kysely<Database>,
  contentId: string,
  buyerUserId: string,
  sellerUserId: string
) {
  return db
    .selectFrom("conversations")
    .selectAll()
    .where("content_id", "=", contentId)
    .where("buyer_user_id", "=", buyerUserId)
    .where("seller_user_id", "=", sellerUserId)
    .executeTakeFirstOrThrow();
}

export async function listUserConversations(db: Kysely<Database>, userId: string) {
  const conversations = await db
    .selectFrom("conversations")
    .innerJoin("market_contents", "market_contents.id", "conversations.content_id")
    .select([
      "conversations.id",
      "conversations.content_id",
      "conversations.buyer_user_id",
      "conversations.seller_user_id",
      "conversations.status",
      "conversations.created_at",
      "conversations.updated_at",
      "market_contents.title as content_title"
    ])
    .where((eb) => eb.or([eb("conversations.buyer_user_id", "=", userId), eb("conversations.seller_user_id", "=", userId)]))
    .orderBy("conversations.updated_at", "desc")
    .limit(50)
    .execute();

  return Promise.all(
    conversations.map(async (conversation) => {
      const otherUserId = conversation.buyer_user_id === userId ? conversation.seller_user_id : conversation.buyer_user_id;
      const [readState, preferences, blocks, recentMessages, participantProfile, participantIdentity] = await Promise.all([
        db
          .selectFrom("conversation_reads")
          .select("last_read_at")
          .where("conversation_id", "=", conversation.id)
          .where("user_id", "=", userId)
          .executeTakeFirst(),
        db
          .selectFrom("conversation_preferences")
          .select("is_muted")
          .where("conversation_id", "=", conversation.id)
          .where("user_id", "=", userId)
          .executeTakeFirst(),
        db
          .selectFrom("conversation_blocks")
          .select(["blocker_user_id", "blocked_user_id"])
          .where("conversation_id", "=", conversation.id)
          .execute(),
        db
          .selectFrom("conversation_messages")
          .select(["body", "sender_user_id", "created_at"])
          .where("conversation_id", "=", conversation.id)
          .orderBy("created_at", "desc")
          .limit(30)
          .execute(),
        db
          .selectFrom("user_profiles")
          .leftJoin("cities", "cities.id", "user_profiles.primary_city_id")
          .select(["user_profiles.display_name", "user_profiles.first_name", "user_profiles.last_name", "user_profiles.primary_city_id", "cities.name_fa as primary_city_name"])
          .where("user_profiles.user_id", "=", otherUserId)
          .executeTakeFirst(),
        db.selectFrom("identity_verification_requests").select("status").where("user_id", "=", otherUserId).orderBy("created_at", "desc").executeTakeFirst().catch(() => undefined)
      ]);
      const lastReadAt = readState?.last_read_at ? new Date(readState.last_read_at).getTime() : 0;
      const unreadCount = recentMessages.filter(
        (message) => message.sender_user_id !== userId && new Date(message.created_at).getTime() > lastReadAt
      ).length;
      const lastMessage = recentMessages[0];
      const participantName = participantProfile?.display_name || [participantProfile?.first_name, participantProfile?.last_name].filter(Boolean).join(" ") || "کاربر 4D";

      return {
        ...conversation,
        unread_count: unreadCount,
        is_muted: preferences?.is_muted ?? false,
        is_blocked: blocks.length > 0,
        is_blocked_by_me: blocks.some((block) => block.blocker_user_id === userId),
        last_message_body: lastMessage?.body ?? null,
        last_message_at: lastMessage?.created_at ?? null,
        last_message_sender_user_id: lastMessage?.sender_user_id ?? null,
        participant: {
          user_id: otherUserId,
          display_name: participantName,
          city_id: participantProfile?.primary_city_id ?? null,
          city_name: participantProfile?.primary_city_name ?? null,
          identity_verified: participantIdentity?.status === "verified"
        }
      };
    })
  );
}

export async function listConversationMessages(db: Kysely<Database>, conversationId: string, userId: string) {
  await assertConversationParticipant(db, conversationId, userId);
  const conversation = await db.selectFrom("conversations").select(["buyer_user_id", "seller_user_id"]).where("id", "=", conversationId).executeTakeFirstOrThrow();
  const otherUserId = conversation.buyer_user_id === userId ? conversation.seller_user_id : conversation.buyer_user_id;
  const otherRead = await db.selectFrom("conversation_reads").select("last_read_at").where("conversation_id", "=", conversationId).where("user_id", "=", otherUserId).executeTakeFirst();
  const messages = await db
    .selectFrom("conversation_messages")
    .selectAll()
    .where("conversation_id", "=", conversationId)
    .orderBy("created_at", "asc")
    .limit(100)
    .execute();
  await markConversationRead(db, conversationId, userId);
  const otherReadAt = otherRead?.last_read_at ? new Date(otherRead.last_read_at).getTime() : 0;
  return messages.map((message) => ({ ...message, read_by_recipient: new Date(message.created_at).getTime() <= otherReadAt }));
}

export async function createConversationMessage(db: Kysely<Database>, input: CreateConversationMessageInput) {
  await assertConversationParticipant(db, input.conversationId, input.senderUserId);
  const now = new Date();
  const id = crypto.randomUUID();

  await db.transaction().execute(async (trx) => {
    await trx
      .insertInto("conversation_messages")
      .values({
        id,
        conversation_id: input.conversationId,
        sender_user_id: input.senderUserId,
        body: input.body,
        created_at: now
      })
      .execute();

    await trx.updateTable("conversations").set({ updated_at: now }).where("id", "=", input.conversationId).execute();
  });

  await markConversationRead(db, input.conversationId, input.senderUserId);
  return db.selectFrom("conversation_messages").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function markConversationRead(db: Kysely<Database>, conversationId: string, userId: string) {
  await assertConversationParticipant(db, conversationId, userId);
  const now = new Date();
  await db
    .insertInto("conversation_reads")
    .values({
      conversation_id: conversationId,
      user_id: userId,
      last_read_at: now
    })
    .onConflict((oc) =>
      oc.columns(["conversation_id", "user_id"]).doUpdateSet({
        last_read_at: now
      })
    )
    .execute();
}

export async function updateConversationPreference(db: Kysely<Database>, input: UpdateConversationPreferenceInput) {
  await assertConversationParticipant(db, input.conversationId, input.userId);
  const now = new Date();
  await db
    .insertInto("conversation_preferences")
    .values({
      conversation_id: input.conversationId,
      user_id: input.userId,
      is_muted: input.isMuted,
      muted_at: input.isMuted ? now : null,
      updated_at: now
    })
    .onConflict((oc) =>
      oc.columns(["conversation_id", "user_id"]).doUpdateSet({
        is_muted: input.isMuted,
        muted_at: input.isMuted ? now : null,
        updated_at: now
      })
    )
    .execute();

  return {
    conversation_id: input.conversationId,
    user_id: input.userId,
    is_muted: input.isMuted,
    muted_at: input.isMuted ? now : null,
    updated_at: now
  };
}

export async function updateConversationBlock(db: Kysely<Database>, input: UpdateConversationBlockInput) {
  const conversation = await getConversationForParticipant(db, input.conversationId, input.userId);
  const blockedUserId = conversation.buyer_user_id === input.userId ? conversation.seller_user_id : conversation.buyer_user_id;
  const now = new Date();

  if (input.isBlocked) {
    await db
      .insertInto("conversation_blocks")
      .values({
        conversation_id: input.conversationId,
        blocker_user_id: input.userId,
        blocked_user_id: blockedUserId,
        created_at: now
      })
      .onConflict((oc) =>
        oc.columns(["conversation_id", "blocker_user_id"]).doUpdateSet({
          blocked_user_id: blockedUserId,
          created_at: now
        })
      )
      .execute();
  } else {
    await db
      .deleteFrom("conversation_blocks")
      .where("conversation_id", "=", input.conversationId)
      .where("blocker_user_id", "=", input.userId)
      .execute();
  }

  return {
    conversation_id: input.conversationId,
    blocker_user_id: input.userId,
    blocked_user_id: blockedUserId,
    is_blocked: input.isBlocked,
    updated_at: now
  };
}

export async function isConversationBlocked(db: Kysely<Database>, conversationId: string) {
  const block = await db
    .selectFrom("conversation_blocks")
    .select("conversation_id")
    .where("conversation_id", "=", conversationId)
    .executeTakeFirst();

  return Boolean(block);
}

export async function getConversationNotificationTarget(db: Kysely<Database>, conversationId: string, senderUserId: string) {
  const conversation = await getConversationForParticipant(db, conversationId, senderUserId);
  const recipientUserId = conversation.buyer_user_id === senderUserId ? conversation.seller_user_id : conversation.buyer_user_id;
  const preference = await db
    .selectFrom("conversation_preferences")
    .select("is_muted")
    .where("conversation_id", "=", conversationId)
    .where("user_id", "=", recipientUserId)
    .executeTakeFirst();
  const content = await db
    .selectFrom("market_contents")
    .select("title")
    .where("id", "=", conversation.content_id)
    .executeTakeFirst();

  return {
    recipientUserId,
    contentTitle: content?.title ?? "4D",
    isMuted: preference?.is_muted ?? false
  };
}

async function assertConversationParticipant(db: Kysely<Database>, conversationId: string, userId: string) {
  await getConversationForParticipant(db, conversationId, userId);
}

async function getConversationForParticipant(db: Kysely<Database>, conversationId: string, userId: string) {
  return db
    .selectFrom("conversations")
    .select(["id", "content_id", "buyer_user_id", "seller_user_id"])
    .where("id", "=", conversationId)
    .where((eb) => eb.or([eb("buyer_user_id", "=", userId), eb("seller_user_id", "=", userId)]))
    .executeTakeFirstOrThrow();
}

export async function assertMessageVisibleToUser(db: Kysely<Database>, messageId: string, userId: string) {
  const message = await db
    .selectFrom("conversation_messages")
    .select("conversation_id")
    .where("id", "=", messageId)
    .executeTakeFirstOrThrow();

  await assertConversationParticipant(db, message.conversation_id, userId);
}

export async function createReport(db: Kysely<Database>, input: CreateReportInput) {
  const reportId = crypto.randomUUID();
  const caseId = crypto.randomUUID();
  const now = new Date();

  await db.transaction().execute(async (trx) => {
    await trx
      .insertInto("reports")
      .values({
        id: reportId,
        reporter_user_id: input.reporterUserId,
        target_type: input.targetType,
        target_id: input.targetId,
        reason: input.reason,
        description: input.description ?? null,
        status: "submitted",
        created_at: now
      })
      .execute();

    await trx
      .insertInto("moderation_cases")
      .values({
        id: caseId,
        report_id: reportId,
        target_type: input.targetType,
        target_id: input.targetId,
        status: "open",
        priority: input.reason === "fraud_suspicion" ? "high" : "normal",
        created_at: now,
        updated_at: now
      })
      .execute();
  });

  return db.selectFrom("reports").selectAll().where("id", "=", reportId).executeTakeFirstOrThrow();
}

export async function listModerationCases(db: Kysely<Database>) {
  const cases = await db
    .selectFrom("moderation_cases")
    .leftJoin("reports", "reports.id", "moderation_cases.report_id")
    .select([
      "moderation_cases.id",
      "moderation_cases.report_id",
      "moderation_cases.target_type",
      "moderation_cases.target_id",
      "moderation_cases.status",
      "moderation_cases.priority",
      "moderation_cases.created_at",
      "reports.reason",
      "reports.description",
      "reports.reporter_user_id"
    ])
    .where("moderation_cases.status", "=", "open")
    .orderBy("moderation_cases.created_at", "desc")
    .limit(50)
    .execute();

  return Promise.all(
    cases.map(async (moderationCase) => {
      if (moderationCase.target_type !== "message") {
        return { ...moderationCase, target_preview: null };
      }

      const message = await db
        .selectFrom("conversation_messages")
        .select("body")
        .where("id", "=", moderationCase.target_id)
        .executeTakeFirst();

      return { ...moderationCase, target_preview: message?.body ?? null };
    })
  );
}

export async function createModerationDecision(db: Kysely<Database>, input: CreateModerationDecisionInput) {
  const decisionId = crypto.randomUUID();
  const now = new Date();
  const nextCaseStatus = input.decision === "escalate" ? "escalated" : "closed";

  return db.transaction().execute(async (trx) => {
    const moderationCase = await trx
      .selectFrom("moderation_cases")
      .selectAll()
      .where("id", "=", input.caseId)
      .executeTakeFirstOrThrow();

    await trx
      .insertInto("moderation_decisions")
      .values({
        id: decisionId,
        case_id: input.caseId,
        actor_user_id: input.actorUserId,
        decision: input.decision,
        reason: input.reason,
        created_at: now
      })
      .execute();

    await trx
      .updateTable("moderation_cases")
      .set({
        status: nextCaseStatus,
        updated_at: now
      })
      .where("id", "=", input.caseId)
      .execute();

    if (moderationCase.report_id) {
      await trx
        .updateTable("reports")
        .set({ status: input.decision === "escalate" ? "escalated" : "reviewed" })
        .where("id", "=", moderationCase.report_id)
        .execute();
    }

    if (input.decision === "reject_content" && moderationCase.target_type === "content") {
      await trx
        .updateTable("market_contents")
        .set({
          status: "rejected",
          updated_at: now
        })
        .where("id", "=", moderationCase.target_id)
        .execute();
    }

    return trx.selectFrom("moderation_decisions").selectAll().where("id", "=", decisionId).executeTakeFirstOrThrow();
  });
}
