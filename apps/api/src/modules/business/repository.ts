import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";

export interface BusinessProfileInput {
  businessName: string;
  businessType: string;
  bio: string | undefined;
  serviceArea: string;
  openingHours: string;
  isPublic: boolean;
}

export async function getBusinessProfile(db: Kysely<Database>, userId: string) {
  return db.selectFrom("business_profiles").selectAll().where("user_id", "=", userId).executeTakeFirst();
}

export async function upsertBusinessProfile(db: Kysely<Database>, userId: string, input: BusinessProfileInput) {
  const now = new Date();
  const values = {
    user_id: userId,
    business_name: input.businessName.trim().slice(0, 160),
    business_type: input.businessType.trim().slice(0, 80),
    bio: input.bio?.trim().slice(0, 500) || null,
    service_area: input.serviceArea.trim().slice(0, 160),
    opening_hours: input.openingHours.trim().slice(0, 160),
    is_public: input.isPublic,
    created_at: now,
    updated_at: now
  };
  await db.insertInto("business_profiles").values(values).onConflict((oc) => oc.column("user_id").doUpdateSet({
    business_name: values.business_name,
    business_type: values.business_type,
    bio: values.bio,
    service_area: values.service_area,
    opening_hours: values.opening_hours,
    is_public: values.is_public,
    updated_at: now
  })).execute();
  return getBusinessProfile(db, userId);
}

export async function getPublicTrustSummary(db: Kysely<Database>, userId: string) {
  const [user, profile, identity, storefront, listingCount, conversationCount, respondedConversationCount] = await Promise.all([
    db.selectFrom("users").select(["phone_verified_at", "created_at", "status"]).where("id", "=", userId).executeTakeFirst(),
    db.selectFrom("user_profiles").select(["first_name", "last_name", "display_name", "verification_status"]).where("user_id", "=", userId).executeTakeFirst(),
    db.selectFrom("identity_verification_requests").select(["status", "verified_at"]).where("user_id", "=", userId).orderBy("created_at", "desc").executeTakeFirst().catch(() => undefined),
    db.selectFrom("storefronts").select(["status", "verified_at"]).where("owner_user_id", "=", userId).executeTakeFirst().catch(() => undefined),
    db.selectFrom("market_contents").select((eb) => eb.fn.countAll<number>().as("count")).where("owner_user_id", "=", userId).where("status", "=", "approved").where("deleted_at", "is", null).executeTakeFirst(),
    db.selectFrom("conversations").select((eb) => eb.fn.countAll<number>().as("count")).where("seller_user_id", "=", userId).executeTakeFirst(),
    db.selectFrom("conversations").innerJoin("conversation_messages", "conversation_messages.conversation_id", "conversations.id").select("conversations.id").where("conversations.seller_user_id", "=", userId).where("conversation_messages.sender_user_id", "=", userId).groupBy("conversations.id").execute()
  ]);
  const phoneVerified = Boolean(user?.phone_verified_at);
  const profileComplete = Boolean(profile?.first_name?.trim() && profile?.last_name?.trim() && profile?.display_name?.trim());
  const identityVerified = identity?.status === "verified";
  const storefrontVerified = storefront?.status === "active";
  const accountAgeDays = user?.created_at ? Math.max(0, Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86_400_000)) : 0;
  const approvedListings = Number(listingCount?.count ?? 0);
  const seriousViolationCount = await db.selectFrom("moderation_cases").select((eb) => eb.fn.countAll<number>().as("count")).where("target_type", "=", "user").where("target_id", "=", userId).where("priority", "=", "high").where("status", "in", ["open", "escalated"]).executeTakeFirst().then((row) => Number(row?.count ?? 0)).catch(() => 0);
  const trustScore = Math.max(0, Math.min(100, (identityVerified ? 35 : 0) + (phoneVerified ? 20 : 0) + (profileComplete ? 10 : 0) + (storefrontVerified ? 15 : 0) + Math.min(15, Math.floor(accountAgeDays / 30)) + Math.min(5, approvedListings) - Math.min(25, seriousViolationCount * 25)));
  const publicBadges = [
    ...(accountAgeDays < 30 ? ["new_account"] : []),
    ...(phoneVerified ? ["phone_verified"] : []),
    ...(identityVerified ? ["identity_verified"] : []),
    ...(approvedListings >= 3 ? ["experienced_seller"] : []),
    ...(storefrontVerified ? ["verified_storefront"] : [])
  ];
  return {
    phone_verified: phoneVerified,
    profile_complete: profileComplete,
    identity_verified: identityVerified,
    identity_verified_at: identityVerified ? identity?.verified_at ?? null : null,
    storefront_verified: storefrontVerified,
    approved_listings: Number(listingCount?.count ?? 0),
    seller_response_rate: Number(conversationCount?.count ?? 0) > 0 ? Math.round((respondedConversationCount.length / Number(conversationCount?.count ?? 1)) * 100) : null,
    public_badges: publicBadges,
    trust_tier: trustScore >= 70 ? "established" : trustScore >= 35 ? "active" : "new"
  };
}
