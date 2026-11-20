import crypto from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../db/types.js";

export interface SessionUser {
  id: string;
  phone_number: string;
  phone_verified_at: Date | string | null;
  status: string;
  roles: string[];
}

export interface UserProfileInput {
  firstName: string;
  lastName: string;
  displayName?: string;
  primaryCityId?: string | null;
}

export function hashSessionToken(token: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashOtpCode(phoneNumber: string, code: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(`${phoneNumber}:${code}`).digest("hex");
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto.scryptSync(password, salt, 64).toString("base64url");
  return `scrypt:v1:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash?: string | null) {
  if (!storedHash) return false;
  const [algorithm, version, salt, expected] = storedHash.split(":");
  if (algorithm !== "scrypt" || version !== "v1" || !salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "base64url");
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer);
}

export async function ensureVerifiedUser(db: Kysely<Database>, phoneNumber: string) {
  const userId = crypto.randomUUID();
  const now = new Date();

  await db
    .insertInto("users")
    .values({
      id: userId,
      phone_number: phoneNumber,
      phone_verified_at: now,
      password_hash: null,
      status: "active",
      created_at: now,
      updated_at: now
    })
    .onConflict((oc) =>
      oc.column("phone_number").doUpdateSet({
        phone_verified_at: now,
        updated_at: now
      })
    )
    .execute();

  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("phone_number", "=", phoneNumber)
    .executeTakeFirstOrThrow();

  await db
    .insertInto("user_profiles")
    .values({
      user_id: user.id,
      display_name: "کاربر 4D",
      first_name: null,
      last_name: null,
      primary_city_id: null,
      verification_status: "profile_incomplete",
      profile_completed_at: null,
      created_at: now,
      updated_at: now
    })
    .onConflict((oc) => oc.column("user_id").doNothing())
    .execute();

  return user;
}

export async function findUserByPhone(db: Kysely<Database>, phoneNumber: string) {
  return db.selectFrom("users").selectAll().where("phone_number", "=", phoneNumber).executeTakeFirst();
}

export async function findUserById(db: Kysely<Database>, userId: string) {
  return db.selectFrom("users").selectAll().where("id", "=", userId).executeTakeFirst();
}

export async function getUserProfile(db: Kysely<Database>, userId: string) {
  return db.selectFrom("user_profiles").selectAll().where("user_id", "=", userId).executeTakeFirst();
}

export function isProfileComplete(profile?: Awaited<ReturnType<typeof getUserProfile>>) {
  return getProfileCompletionMissingFields(profile).length === 0;
}

export function getProfileCompletionMissingFields(profile?: Awaited<ReturnType<typeof getUserProfile>>) {
  const missing: string[] = [];
  if (!profile?.first_name?.trim()) missing.push("first_name");
  if (!profile?.last_name?.trim()) missing.push("last_name");
  if (!profile?.primary_city_id) missing.push("primary_city_id");
  return missing;
}

export async function updateUserProfile(db: Kysely<Database>, userId: string, input: UserProfileInput) {
  const now = new Date();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const displayName = (input.displayName?.trim() || `${firstName} ${lastName}`).slice(0, 128);
  const existingProfile = await db.selectFrom("user_profiles").select("verification_status").where("user_id", "=", userId).executeTakeFirst();
  const verificationStatus = existingProfile?.verification_status === "verified" ? "verified" : "profile_complete";

  await db
    .insertInto("user_profiles")
    .values({
      user_id: userId,
      display_name: displayName,
      first_name: firstName,
      last_name: lastName,
      primary_city_id: input.primaryCityId ?? null,
      verification_status: verificationStatus,
      profile_completed_at: now,
      created_at: now,
      updated_at: now
    })
    .onConflict((oc) =>
      oc.column("user_id").doUpdateSet({
        display_name: displayName,
        first_name: firstName,
        last_name: lastName,
        primary_city_id: input.primaryCityId ?? null,
        verification_status: verificationStatus,
        profile_completed_at: now,
        updated_at: now
      })
    )
    .execute();

  return getUserProfile(db, userId);
}

export async function setUserPassword(db: Kysely<Database>, userId: string, password: string) {
  await db
    .updateTable("users")
    .set({ password_hash: hashPassword(password), updated_at: new Date() })
    .where("id", "=", userId)
    .execute();
}

export async function grantUserRole(db: Kysely<Database>, userId: string, role: "user" | "moderator" | "admin") {
  await db
    .insertInto("user_roles")
    .values({
      user_id: userId,
      role,
      granted_at: new Date()
    })
    .onConflict((oc) => oc.columns(["user_id", "role"]).doNothing())
    .execute();
}

export async function createSession(db: Kysely<Database>, userId: string, tokenHash: string) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);

  await db
    .insertInto("sessions")
    .values({
      id: crypto.randomUUID(),
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      revoked_at: null,
      created_at: now
    })
    .execute();

  return expiresAt;
}

export async function createSessionPair(db: Kysely<Database>, userId: string, tokenHash: string, sessionSecret: string) {
  const now = new Date();
  const sessionId = crypto.randomUUID();
  const accessExpiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
  const refreshExpiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 90);
  const refreshToken = createSessionToken();

  const insertPair = async (trx: Kysely<Database>) => {
    await trx.insertInto("sessions").values({
      id: sessionId,
      user_id: userId,
      token_hash: tokenHash,
      expires_at: accessExpiresAt,
      revoked_at: null,
      created_at: now
    }).execute();
    await trx.insertInto("session_refresh_tokens").values({
      id: crypto.randomUUID(),
      session_id: sessionId,
      token_hash: hashSessionToken(refreshToken, sessionSecret),
      expires_at: refreshExpiresAt,
      revoked_at: null,
      created_at: now
    }).execute();
  };
  if (db.isTransaction) await insertPair(db);
  else await db.transaction().execute(insertPair);

  return { accessExpiresAt, refreshExpiresAt, refreshToken };
}

export async function rotateSessionPair(db: Kysely<Database>, refreshToken: string, sessionSecret: string) {
  const refreshHash = hashSessionToken(refreshToken, sessionSecret);
  const current = await db
    .selectFrom("session_refresh_tokens")
    .innerJoin("sessions", "sessions.id", "session_refresh_tokens.session_id")
    .innerJoin("users", "users.id", "sessions.user_id")
    .select(["session_refresh_tokens.id as refresh_id", "sessions.id as session_id", "sessions.user_id", "users.phone_number", "users.phone_verified_at", "users.status"])
    .where("session_refresh_tokens.token_hash", "=", refreshHash)
    .where("session_refresh_tokens.revoked_at", "is", null)
    .where("sessions.revoked_at", "is", null)
    .where("session_refresh_tokens.expires_at", ">", sql<Date>`now()`)
    .where("users.status", "=", "active")
    .executeTakeFirst();
  if (!current) return undefined;

  const accessToken = createSessionToken();
  const nextRefreshToken = createSessionToken();
  const now = new Date();
  const accessExpiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
  const refreshExpiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 90);

  const roles = await db.selectFrom("user_roles").select("role").where("user_id", "=", current.user_id).execute();
  const rotated = await db.transaction().execute(async (trx) => {
    const claimed = await trx.updateTable("session_refresh_tokens").set({ revoked_at: now }).where("id", "=", current.refresh_id).where("revoked_at", "is", null).where("expires_at", ">", sql<Date>`now()`).executeTakeFirst();
    if (Number(claimed.numUpdatedRows) !== 1) return false;
    const sessionClaim = await trx.updateTable("sessions").set({ revoked_at: now }).where("id", "=", current.session_id).where("revoked_at", "is", null).executeTakeFirst();
    if (Number(sessionClaim.numUpdatedRows) !== 1) return false;
    const nextSessionId = crypto.randomUUID();
    await trx.insertInto("sessions").values({ id: nextSessionId, user_id: current.user_id, token_hash: hashSessionToken(accessToken, sessionSecret), expires_at: accessExpiresAt, revoked_at: null, created_at: now }).execute();
    await trx.insertInto("session_refresh_tokens").values({ id: crypto.randomUUID(), session_id: nextSessionId, token_hash: hashSessionToken(nextRefreshToken, sessionSecret), expires_at: refreshExpiresAt, revoked_at: null, created_at: now }).execute();
    return true;
  });
  if (!rotated) return undefined;

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    accessExpiresAt,
    refreshExpiresAt,
    user: { id: current.user_id, phone_number: current.phone_number, mobile_verified: Boolean(current.phone_verified_at), roles: roles.length ? roles.map((row) => row.role) : ["user"] }
  };
}

export async function revokeSession(db: Kysely<Database>, tokenHash: string) {
  const result = await db
    .updateTable("sessions")
    .set({ revoked_at: new Date() })
    .where("token_hash", "=", tokenHash)
    .where("revoked_at", "is", null)
    .executeTakeFirst();

  return Number(result.numUpdatedRows) > 0;
}

export async function findUserBySessionToken(db: Kysely<Database>, tokenHash: string): Promise<SessionUser | undefined> {
  const user = await db
    .selectFrom("sessions")
    .innerJoin("users", "users.id", "sessions.user_id")
    .select(["users.id", "users.phone_number", "users.phone_verified_at", "users.status"])
    .where("sessions.token_hash", "=", tokenHash)
    .where("sessions.revoked_at", "is", null)
    .where("sessions.expires_at", ">", sql<Date>`now()`)
    .where("users.status", "=", "active")
    .executeTakeFirst();

  if (!user) return undefined;

  const roles = await db
    .selectFrom("user_roles")
    .select("role")
    .where("user_id", "=", user.id)
    .execute();

  return {
    ...user,
    roles: roles.length ? roles.map((row) => row.role) : ["user"]
  };
}

export async function createOtpChallenge(
  db: Kysely<Database>,
  input: {
    phoneNumber: string;
    codeHash: string;
    expiresAt: Date;
    maxAttempts: number;
  }
) {
  const now = new Date();

  await db
    .insertInto("otp_challenges")
    .values({
      id: crypto.randomUUID(),
      phone_number: input.phoneNumber,
      purpose: "login",
      code_hash: input.codeHash,
      attempts: 0,
      max_attempts: input.maxAttempts,
      expires_at: input.expiresAt,
      consumed_at: null,
      created_at: now
    })
    .execute();
}

export async function verifyOtpChallenge(
  db: Kysely<Database>,
  input: {
    phoneNumber: string;
    codeHash: string;
  }
) {
  const challenge = await db
    .selectFrom("otp_challenges")
    .select(["id", "code_hash", "attempts", "max_attempts"])
    .where("phone_number", "=", input.phoneNumber)
    .where("purpose", "=", "login")
    .where("consumed_at", "is", null)
    .where("expires_at", ">", sql<Date>`now()`)
    .orderBy("created_at", "desc")
    .executeTakeFirst();

  if (!challenge) return false;

  if (challenge.attempts >= challenge.max_attempts) return false;

  if (challenge.code_hash !== input.codeHash) {
    await db
      .updateTable("otp_challenges")
      .set({ attempts: sql<number>`attempts + 1` })
      .where("id", "=", challenge.id)
      .where("consumed_at", "is", null)
      .whereRef("attempts", "<", "max_attempts")
      .execute();
    return false;
  }

  const consumed = await db
    .updateTable("otp_challenges")
    .set({
      attempts: sql<number>`attempts + 1`,
      consumed_at: new Date()
    })
    .where("id", "=", challenge.id)
    .where("consumed_at", "is", null)
    .whereRef("attempts", "<", "max_attempts")
    .where("expires_at", ">", sql<Date>`now()`)
    .executeTakeFirst();

  return Number(consumed.numUpdatedRows) === 1;
}

export async function countRecentOtpChallenges(db: Kysely<Database>, phoneNumber: string, since: Date) {
  const result = await db
    .selectFrom("otp_challenges")
    .select(({ fn }) => fn.countAll().as("count"))
    .where("phone_number", "=", phoneNumber)
    .where("purpose", "=", "login")
    .where("created_at", ">", since)
    .executeTakeFirstOrThrow();

  return Number(result.count);
}

export async function cleanupOtpChallenges(db: Kysely<Database>, now = new Date()) {
  const result = await db
    .deleteFrom("otp_challenges")
    .where((eb) => eb.or([eb("expires_at", "<", now), eb("consumed_at", "is not", null)]))
    .executeTakeFirst();

  return Number(result.numDeletedRows);
}
