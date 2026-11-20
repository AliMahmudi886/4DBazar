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
  return (await getPublicTrustSummaries(db, [userId])).get(userId) ?? null;
}
export async function getPublicTrustSummaries(db: Kysely<Database>, ids: string[]) {
  if (!ids.length) return new Map<string, never>();
  const [users, profiles, identities, storefronts, listings, conversations, responses, violations] = await Promise.all([
    db.selectFrom("users").select(["phone_verified_at", "created_at", "status"]).select("id").where("id", "in", ids).execute(),
    db.selectFrom("user_profiles").select(["first_name", "last_name", "display_name", "verification_status"]).select("user_id").where("user_id", "in", ids).execute(),
    db.selectFrom("identity_verification_requests").select(["status", "verified_at"]).select("user_id").distinctOn("user_id").where("user_id", "in", ids).orderBy("user_id").orderBy("created_at", "desc").orderBy("id", "desc").execute().catch(() => []),
    db.selectFrom("storefronts").select(["status", "verified_at"]).select("owner_user_id").where("owner_user_id", "in", ids).execute().catch(() => []),
    db.selectFrom("market_contents").select((eb) => eb.fn.countAll<number>().as("count")).select("owner_user_id").where("owner_user_id", "in", ids).where("status", "=", "approved").where("deleted_at", "is", null).groupBy("owner_user_id").execute(),
    db.selectFrom("conversations").select((eb) => eb.fn.countAll<number>().as("count")).select("seller_user_id").where("seller_user_id", "in", ids).groupBy("seller_user_id").execute(),
    db.selectFrom("conversations").innerJoin("conversation_messages", "conversation_messages.conversation_id", "conversations.id").select("conversations.seller_user_id").select(eb => eb.fn.count("conversations.id").distinct().as("count")).where("conversations.seller_user_id", "in", ids).whereRef("conversation_messages.sender_user_id", "=", "conversations.seller_user_id").groupBy("conversations.seller_user_id").execute(),
    db.selectFrom("moderation_cases").select("target_id").select(eb => eb.fn.countAll().as("count")).where("target_type", "=", "user").where("target_id", "in", ids).where("priority", "=", "high").where("status", "in", ["open", "escalated"]).groupBy("target_id").execute()
  ]);
  return new Map(users.map(user => {
    const userId = user.id;
    const profile = profiles.find(row => row.user_id === userId);
    const identity = identities.find(row => row.user_id === userId);
    const storefront = storefronts.find(row => row.owner_user_id === userId);
    const listingCount = listings.find(row => row.owner_user_id === userId);
    const conversationCount = conversations.find(row => row.seller_user_id === userId);
    const respondedCount = Number(responses.find(row => row.seller_user_id === userId)?.count ?? 0);
    const seriousViolationCount = Number(violations.find(row => row.target_id === userId)?.count ?? 0);
      const phoneVerified = Boolean(user?.phone_verified_at);
      const profileComplete = Boolean(profile?.first_name?.trim() && profile?.last_name?.trim() && profile?.display_name?.trim());
      const identityVerified = identity?.status === "verified";
      const storefrontVerified = storefront?.status === "active";
      const accountAgeDays = user?.created_at ? Math.max(0, Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86_400_000)) : 0;
      const approvedListings = Number(listingCount?.count ?? 0);
      const trustScore = Math.max(0, Math.min(100, (identityVerified ? 35 : 0) + (phoneVerified ? 20 : 0) + (profileComplete ? 10 : 0) + (storefrontVerified ? 15 : 0) + Math.min(15, Math.floor(accountAgeDays / 30)) + Math.min(5, approvedListings) - Math.min(25, seriousViolationCount * 25)));
      const publicBadges = [
        ...(accountAgeDays < 30 ? ["new_account"] : []),
        ...(phoneVerified ? ["phone_verified"] : []),
        ...(identityVerified ? ["identity_verified"] : []),
        ...(approvedListings >= 3 ? ["experienced_seller"] : []),
        ...(storefrontVerified ? ["verified_storefront"] : [])
      ];
      return [userId, {
        phone_verified: phoneVerified,
        profile_complete: profileComplete,
        identity_verified: identityVerified,
        identity_verified_at: identityVerified ? identity?.verified_at ?? null : null,
        storefront_verified: storefrontVerified,
        approved_listings: Number(listingCount?.count ?? 0),
        seller_response_rate: Number(conversationCount?.count ?? 0) > 0 ? Math.round((respondedCount / Number(conversationCount?.count ?? 1)) * 100) : null,
        public_badges: publicBadges,
        trust_tier: trustScore >= 70 ? "established" : trustScore >= 35 ? "active" : "new"
      }] as const;
  }));
}
