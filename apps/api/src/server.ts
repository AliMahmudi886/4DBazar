import { createHash } from "node:crypto";
import { normalizePushEndpoint } from "./security/push-endpoint.js";
import { assertPublicContent } from "./modules/content/public-access.js";
import { identityDecisionFields } from "./modules/auth/identity-decision.js";
import cors from "@fastify/cors";
import { getListingFieldPolicy, type ContentType } from "@four-d/shared";
import Fastify from "fastify";
import { AppError, toErrorBody } from "./errors.js";
import type { AppConfig } from "./config.js";
import { checkDatabase, createDatabase } from "./db/database.js";
import { attachAuthenticatedUser, requireMobileVerified, requireRole } from "./security/auth.js";
import { CompositeAuditLogger, ConsoleAuditLogger, DatabaseAuditLogger } from "./security/audit.js";
import { createCaptchaProofService } from "./security/captcha.js";
import { registerInMemoryRateLimit } from "./security/rate-limit.js";
import { listCategories, listCities } from "./modules/catalog/repository.js";
import {
  createListing,
  deleteListing,
  deleteListingByModerator,
  getContentDetail,
  listFeedContents,
  listSubmittedContents,
  listUserContents,
  moderateContent
  ,updateListing
} from "./modules/content/repository.js";
import {
  assertMessageVisibleToUser,
  createContactIntent,
  createConversationMessage,
  createModerationDecision,
  createReport,
  getConversationNotificationTarget,
  isConversationBlocked,
  listConversationMessages,
  listUserConversations,
  listModerationCases,
  updateConversationBlock,
  updateConversationPreference
} from "./modules/trust/repository.js";
import {
  cleanupOtpChallenges,
  countRecentOtpChallenges,
  createOtpChallenge,
  createSessionPair,
  createSessionToken,
  ensureVerifiedUser,
  findUserById,
  findUserByPhone,
  getUserProfile,
  grantUserRole,
  hashOtpCode,
  hashSessionToken,
  isProfileComplete,
  getProfileCompletionMissingFields,
  revokeSession,
  rotateSessionPair,
  setUserPassword,
  updateUserProfile,
  verifyPassword,
  verifyOtpChallenge
} from "./modules/auth/repository.js";
import {
  listActivePushSubscriptions,
  enqueueNotification,
  getNotificationOutboxSummary,
  revokePushSubscription,
  upsertPushSubscription,
  revokeNativePushToken,
  upsertNativePushToken
} from "./modules/notifications/repository.js";
import { sendUserPushNotification } from "./modules/notifications/push-delivery.js";
import { OtpService, type OtpChallengeStore } from "./modules/auth/otp.js";
import { createLocalMediaStore } from "./modules/media/local-storage.js";
import { attachMediaAssets, createMediaAsset } from "./modules/media/repository.js";
import { createS3MediaStore } from "./modules/media/s3-storage.js";
import { addFavorite, listUserFavoriteIds, removeFavorite } from "./modules/content/favorites.js";
import { reviewListingWithAi } from "./modules/ai/listing-assistant.js";
import { getBusinessProfile, upsertBusinessProfile } from "./modules/business/repository.js";
import { getPublicTrustSummary } from "./modules/business/repository.js";
import { deleteUserAnalyticsEvents, getAnalyticsPreferences, getOwnerAnalyticsSummary, recordAnalyticsEvent, recordListingView, setAnalyticsPreferences } from "./modules/analytics/repository.js";
import { createSupportTicket, listSupportTickets, replyToSupportTicket } from "./modules/support/repository.js";
import { createStorefront, decideStorefront, getStorefrontById, getStorefrontByOwner, getStorefrontBySlug, listStorefrontListings, listStorefrontsForAdmin, normalizeStorefrontSlug, updateStorefront } from "./modules/storefront/repository.js";
import { validateCategoryMetadata } from "./modules/catalog/metadata.js";
import { cancelTransport, createTransport, getTransport, listUserTransport, normalizeTransportText, searchTransport, type TransportMode } from "./modules/transport/repository.js";

const fallbackCities = [
  { id: "00000000-0000-4000-8000-000000000101", code: "garmeh", name_fa: "گرمه", is_village: false, parent_city_id: null },
  { id: "00000000-0000-4000-8000-000000000102", code: "jajarm", name_fa: "جاجرم", is_village: false, parent_city_id: null },
  { id: "00000000-0000-4000-8000-000000000103", code: "eivar", name_fa: "ایور", is_village: false, parent_city_id: null },
  { id: "00000000-0000-4000-8000-000000000104", code: "dorq", name_fa: "درق", is_village: false, parent_city_id: null }
];

const fallbackCategories = [
  { id: "00000000-0000-4000-8000-000000000201", slug: "general-used-goods", name_fa: "کالای دست دوم عمومی", content_types: ["listing", "wanted"], metadata_schema: [] },
  { id: "00000000-0000-4000-8000-000000000206", slug: "vehicles", name_fa: "وسایل نقلیه", content_types: ["listing", "wanted"] },
  { id: "00000000-0000-4000-8000-000000000207", slug: "real-estate", name_fa: "املاک", content_types: ["listing", "wanted"] },
  { id: "00000000-0000-4000-8000-000000000202", slug: "mobile-digital", name_fa: "موبایل و دیجیتال", content_types: ["listing", "wanted"] },
  { id: "00000000-0000-4000-8000-000000000203", slug: "home-kitchen", name_fa: "لوازم خانه و آشپزخانه", content_types: ["listing", "wanted"] },
  { id: "00000000-0000-4000-8000-000000000204", slug: "tools-equipment", name_fa: "ابزار و تجهیزات", content_types: ["listing", "wanted"] },
  { id: "00000000-0000-4000-8000-000000000208", slug: "personal-fashion", name_fa: "پوشاک و لوازم شخصی", content_types: ["listing", "wanted"] },
  { id: "00000000-0000-4000-8000-000000000209", slug: "sports-hobbies", name_fa: "ورزش و سرگرمی", content_types: ["listing", "wanted"] },
  { id: "00000000-0000-4000-8000-000000000210", slug: "business-equipment", name_fa: "کسب‌وکار و تجهیزات", content_types: ["listing", "wanted"] },
  { id: "00000000-0000-4000-8000-000000000211", slug: "jobs", name_fa: "استخدام و همکاری", content_types: ["service_listing", "service_request"] },
  { id: "00000000-0000-4000-8000-000000000212", slug: "education", name_fa: "آموزش", content_types: ["service_listing", "service_request"] },
  { id: "00000000-0000-4000-8000-000000000213", slug: "beauty-care", name_fa: "زیبایی و مراقبت", content_types: ["service_listing", "service_request"] },
  { id: "00000000-0000-4000-8000-000000000214", slug: "agriculture", name_fa: "کشاورزی و دامداری", content_types: ["listing", "wanted", "service_listing"] },
  { id: "00000000-0000-4000-8000-000000000205", slug: "local-services", name_fa: "خدمات محلی", content_types: ["service_listing", "service_request"] },
  { id: "00000000-0000-4000-8000-000000000215", slug: "local-transport", name_fa: "حمل‌ونقل محلی", content_types: ["transport_offer", "transport_request"] }
];

const reportReasons = new Set(["spam", "duplicate", "fraud_suspicion", "inappropriate", "wrong_category", "other"]);
const reportTargetTypes = new Set(["content", "user", "message"]);
const OTP_PHONE_WINDOW_MS = 10 * 60 * 1000;
const OTP_PHONE_MAX_REQUESTS = 10;
const PASSWORD_LOGIN_WINDOW_MS = 10 * 60 * 1000;
const PASSWORD_LOGIN_MAX_FAILURES = 8;

export function buildServer(config: AppConfig, options: { testHeaderAuth?: boolean } = {}) {
  if (options.testHeaderAuth && config.NODE_ENV !== "test") {
    throw new Error("Test header authentication requires NODE_ENV=test");
  }
  const db = createDatabase(config.DATABASE_URL);
  const mediaStore = config.MEDIA_STORAGE_PROVIDER === "s3"
    ? createS3MediaStore({ bucket: config.MEDIA_S3_BUCKET!, region: config.MEDIA_S3_REGION, ...(config.MEDIA_S3_ENDPOINT ? { endpoint: config.MEDIA_S3_ENDPOINT } : {}), accessKeyId: config.MEDIA_S3_ACCESS_KEY_ID!, secretAccessKey: config.MEDIA_S3_SECRET_ACCESS_KEY!, publicBaseUrl: config.MEDIA_S3_PUBLIC_BASE_URL! })
    : config.MEDIA_STORAGE_PROVIDER === "local"
      ? createLocalMediaStore({ storageDir: config.MEDIA_STORAGE_DIR, publicPath: config.MEDIA_PUBLIC_PATH })
      : null;
  const captcha = createCaptchaProofService(config.SESSION_SECRET);
  const otpRequestFallbacks = new Map<string, { count: number; resetAt: number }>();
  const passwordLoginFailures = new Map<string, { count: number; resetAt: number }>();
  const app = Fastify({
    bodyLimit: 16_000_000,
    logger: {
      level: config.NODE_ENV === "test" ? "silent" : "info",
      redact: [
        "req.headers.authorization",
        "req.body.phone_number",
        "req.body.password",
        "req.body.otp",
        "req.body.token",
        "req.body.image_data_url"
      ]
    },
    genReqId: (request) => request.headers["x-request-id"]?.toString() ?? crypto.randomUUID()
  });

  const allowedOrigins = new Set(
    config.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter(Boolean)
  );
  app.register(cors, {
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id", "X-4d-user-id", "X-4d-mobile-verified", "X-4d-roles", "X-4d-view-key"],
    credentials: false,
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin.replace(/\/$/, ""))) {
        callback(null, true);
        return;
      }
      callback(null, false);
    }
  });
  app.addHook("onSend", async (request, reply, payload) => {
    reply.header("x-4d-api-version", "2026-08-25-delete-reconcile-2");
    reply.header("x-content-type-options", "nosniff");
    reply.header("x-frame-options", "DENY");
    reply.header("referrer-policy", "no-referrer");
    reply.header("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
    reply.header("content-security-policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
    if (config.NODE_ENV === "production") {
      reply.header("strict-transport-security", "max-age=31536000; includeSubDomains");
    }
    if (/^\/api\/v1\/(?:auth|me|admin|conversations)(?:\/|$)/.test(request.url)) {
      reply.header("cache-control", "no-store");
    }
    return payload;
  });
  // Load-test bypass is explicitly local-only and rejected by production config validation.
  if (!config.LOAD_TEST_MODE) registerInMemoryRateLimit(app);
  app.addHook("preHandler", attachAuthenticatedUser(db, config.SESSION_SECRET, options.testHeaderAuth === true));
  if (options.testHeaderAuth) {
    // Fixture identities are only available through Fastify.inject, never a socket.
    app.listen = (() => { throw new Error("Fixture servers cannot listen on a network interface"); }) as typeof app.listen;
  }

  const audit = new CompositeAuditLogger([new ConsoleAuditLogger(), new DatabaseAuditLogger(db)]);
  const otpStore: OtpChallengeStore = {
    save: (phoneNumber, code, expiresAt, maxAttempts) =>
      createOtpChallenge(db, {
        phoneNumber,
        codeHash: hashOtpCode(phoneNumber, code, config.SESSION_SECRET),
        expiresAt,
        maxAttempts
      }),
    verify: (phoneNumber, code) =>
      verifyOtpChallenge(db, {
        phoneNumber,
        codeHash: hashOtpCode(phoneNumber, code, config.SESSION_SECRET)
      })
  };
  const otp = new OtpService(
    {
      provider: config.OTP_PROVIDER,
      requirePersistentStore: config.NODE_ENV === "production",
      smsVendor: config.SMS_VENDOR,
      ...(config.SMS_API_URL ? { smsApiUrl: config.SMS_API_URL } : {}),
      ...(config.SMS_API_IP ? { smsApiIp: config.SMS_API_IP } : {}),
      ...(config.SMS_API_KEY ? { smsApiKey: config.SMS_API_KEY } : {}),
      ...(config.SMS_SENDER ? { smsSender: config.SMS_SENDER } : {}),
      ...(config.SMS_TEMPLATE_ID ? { smsTemplateId: config.SMS_TEMPLATE_ID } : {})
    },
    otpStore
  );

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send(toErrorBody(error, request.id));
      return;
    }

    const fastifyStatusCode = (error as { statusCode?: unknown }).statusCode;
    if (typeof fastifyStatusCode === "number" && fastifyStatusCode >= 400 && fastifyStatusCode < 500) {
      request.log.warn({ err: error }, "Invalid API request");
      reply
        .status(fastifyStatusCode)
        .send(toErrorBody(new AppError("validation_failed", "ساختار درخواست معتبر نیست.", fastifyStatusCode), request.id));
      return;
    }

    request.log.error({ err: error }, "Unhandled API error");
    reply
      .status(500)
      .send(toErrorBody(new AppError("internal_error", "خطای غیرمنتظره رخ داد.", 500), request.id));
  });

  app.addHook("onClose", async () => {
    await db.destroy();
  });

  app.get("/health/live", async () => ({ status: "ok" }));

  app.get("/health/ready", async () => {
    const databaseReady = await checkDatabase(db);
    const smsEnabled = config.OTP_PROVIDER === "sms";
    const smsConfigured = !smsEnabled
      ? "disabled"
      : config.SMS_VENDOR === "kavenegar"
        ? config.SMS_API_KEY && config.SMS_SENDER ? "configured" : "not_configured"
        : config.SMS_API_KEY && config.SMS_API_URL ? "configured" : "not_configured";
    const smsTransport = !smsEnabled
      ? "disabled"
      : config.SMS_VENDOR === "kavenegar"
        ? config.SMS_API_IP ? "fixed_ip" : "dns"
        : "url";
    return {
      status: databaseReady ? "ok" : "degraded",
      checks: {
        database: databaseReady ? "ok" : "unavailable",
        object_storage: "not_configured",
        sms: smsConfigured,
        sms_vendor: smsEnabled ? config.SMS_VENDOR : "disabled",
        sms_transport: smsTransport,
        sms_ip_configured: Boolean(config.SMS_API_IP)
      }
    };
  });

  app.get("/api/v1/regions/4d/cities", async () => {
    try {
      return {
        data: (await listCities(db)).map((city) => ({
          id: city.id,
          code: city.code,
          name_fa: city.name_fa,
          is_village: city.is_village,
          parent_city_id: city.parent_city_id
        })),
        meta: { source: "database" }
      };
    } catch {
      return { data: fallbackCities, meta: { source: "fallback" } };
    }
  });

  app.get("/api/v1/categories", async () => {
    try {
      return { data: await listCategories(db), meta: { source: "database" } };
    } catch {
      return { data: fallbackCategories, meta: { source: "fallback" } };
    }
  });

  app.get("/api/v1/auth/captcha-challenge", async () => ({
    data: captcha.createChallenge()
  }));

  app.post<{
    Body: {
      challenge_id?: unknown;
      value?: unknown;
    };
  }>("/api/v1/auth/captcha-proof", async (request) => {
    const challengeId = request.body?.challenge_id;
    const value = request.body?.value;
    if (typeof challengeId !== "string" || !challengeId || typeof value !== "number" || !Number.isFinite(value)) {
      throw new AppError("validation_failed", "پاسخ پازل معتبر نیست.", 400, {
        captcha: ["شناسه و موقعیت معتبر پازل الزامی است."]
      });
    }
    return {
      data: {
        captcha_proof: captcha.createProof(challengeId, value)
      }
    };
  });

  app.post<{
    Body: {
      phone_number?: string;
      captcha_proof?: string;
    };
  }>("/api/v1/auth/request-otp", async (request, reply) => {
    const phoneNumber = normalizeIranPhone(request.body.phone_number);
    if (!phoneNumber) {
      throw new AppError("invalid_phone", "شماره موبایل معتبر نیست.", 400, {
        phone_number: ["شماره موبایل را با پیش‌شماره 09 یا +98 وارد کن."]
      });
    }
    captcha.verifyProof(request.body.captcha_proof);

    let persistentRateLimitAvailable = false;
    try {
      await cleanupOtpChallenges(db);
      const recentCount = await countRecentOtpChallenges(
        db,
        phoneNumber,
        new Date(Date.now() - OTP_PHONE_WINDOW_MS)
      );

      if (recentCount >= OTP_PHONE_MAX_REQUESTS) {
        throw new AppError("rate_limited", "درخواست کد برای این شماره بیش از حد مجاز است.", 429);
      }
      persistentRateLimitAvailable = true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (config.NODE_ENV === "production") {
        throw new AppError("service_unavailable", "امکان بررسی محدودیت ارسال کد در حال حاضر وجود ندارد.", 503);
      }
    }

    if (!persistentRateLimitAvailable) {
      assertOtpRequestAllowed(otpRequestFallbacks, phoneNumber);
    }

    const result = await otp.request(phoneNumber);
    if (!persistentRateLimitAvailable) {
      recordOtpRequest(otpRequestFallbacks, phoneNumber);
    }
    reply.status(202).send({
      data: result
    });
  });

  app.post<{
    Body: {
      phone_number: string;
      otp: string;
    };
  }>("/api/v1/auth/verify-otp", async (request, reply) => {
    const phoneNumber = normalizeIranPhone(request.body.phone_number);
    const otpCode = normalizeOtpCode(request.body.otp);
    const invalidOtp = () => new AppError("invalid_otp", "کد تایید معتبر نیست یا منقضی شده است.", 400, {
      otp: ["کد تایید اشتباه است."]
    });
    if (!phoneNumber || !otpCode) throw invalidOtp();

    try {
      const result = await db.transaction().execute(async (trx) => {
        const verified = await verifyOtpChallenge(trx, {
          phoneNumber,
          codeHash: hashOtpCode(phoneNumber, otpCode, config.SESSION_SECRET)
        });
        // Commit failed-attempt counters before returning a validation error.
        if (!verified) return { outcome: "invalid" } as const;
        const user = await ensureVerifiedUser(trx, phoneNumber);
        if (user.status !== "active") return { outcome: "inactive" } as const;
        await grantUserRole(trx, user.id, "user");
        if (getAdminPhoneNumbers(config.ADMIN_PHONE_NUMBERS).has(phoneNumber)) {
          await grantUserRole(trx, user.id, "moderator");
          await grantUserRole(trx, user.id, "admin");
        }
        const token = createSessionToken();
        const session = await createSessionPair(trx, user.id, hashSessionToken(token, config.SESSION_SECRET), config.SESSION_SECRET);
        return { outcome: "authenticated", user, token, session } as const;
      });
      if (result.outcome === "invalid") throw invalidOtp();
      if (result.outcome === "inactive") throw new AppError("forbidden", "این حساب امکان ورود ندارد.", 403);
      const { user, token, session } = result;
      reply.status(201).send({
        data: {
          token,
          expires_at: session.accessExpiresAt.toISOString(),
          refresh_token: session.refreshToken,
          refresh_expires_at: session.refreshExpiresAt.toISOString(),
          user: {
            id: user.id,
            phone_number: user.phone_number,
            mobile_verified: Boolean(user.phone_verified_at)
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      request.log.error({ err: error }, "OTP verification session creation failed");
      throw new AppError("service_unavailable", "امکان ساخت نشست در حال حاضر وجود ندارد.", 503);
    }
  });

  app.post<{
    Body: {
      phone_number: string;
      password: string;
    };
  }>("/api/v1/auth/password-login", async (request, reply) => {
    const phoneNumber = normalizeIranPhone(request.body.phone_number);
    const password = request.body.password ?? "";
    const loginKey = getPasswordLoginKey(request.ip, phoneNumber || request.body.phone_number);
    assertPasswordLoginAllowed(passwordLoginFailures, loginKey);
    let user: Awaited<ReturnType<typeof findUserByPhone>> | undefined;
    try {
      user = phoneNumber ? await findUserByPhone(db, phoneNumber) : undefined;
    } catch {
      if (config.NODE_ENV === "production") {
        throw new AppError("service_unavailable", "امکان ورود با رمز در حال حاضر وجود ندارد.", 503);
      }
    }

    if (!user || user.status !== "active" || !verifyPassword(password, user.password_hash)) {
      recordPasswordLoginFailure(passwordLoginFailures, loginKey);
      throw new AppError("invalid_credentials", "شماره یا رمز عبور درست نیست.", 400, {
        password: ["اگر هنوز رمز نداری، با پیامک ثبت‌نام کن و در پروفایل رمز بساز."]
      });
    }
    clearPasswordLoginFailures(passwordLoginFailures, loginKey);

    await grantUserRole(db, user.id, "user");
    if (getAdminPhoneNumbers(config.ADMIN_PHONE_NUMBERS).has(phoneNumber)) {
      await grantUserRole(db, user.id, "moderator");
      await grantUserRole(db, user.id, "admin");
    }

    const token = createSessionToken();
    const session = await createSessionPair(db, user.id, hashSessionToken(token, config.SESSION_SECRET), config.SESSION_SECRET);

    reply.status(201).send({
      data: {
        token,
        expires_at: session.accessExpiresAt.toISOString(),
        refresh_token: session.refreshToken,
        refresh_expires_at: session.refreshExpiresAt.toISOString(),
        user: {
          id: user.id,
          phone_number: user.phone_number,
          mobile_verified: Boolean(user.phone_verified_at)
        }
      }
    });
  });

  app.post<{ Body: { refresh_token?: string } }>("/api/v1/auth/refresh", async (request, reply) => {
    const refreshToken = request.body?.refresh_token?.trim();
    if (!refreshToken) throw new AppError("unauthorized", "نشست قابل تمدید نیست؛ دوباره وارد شوید.", 401);
    try {
      const rotated = await rotateSessionPair(db, refreshToken, config.SESSION_SECRET);
      if (!rotated) throw new AppError("unauthorized", "نشست منقضی شده است؛ دوباره وارد شوید.", 401);
      reply.send({ data: { token: rotated.accessToken, expires_at: rotated.accessExpiresAt.toISOString(), refresh_token: rotated.refreshToken, refresh_expires_at: rotated.refreshExpiresAt.toISOString(), user: rotated.user } });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("service_unavailable", "امکان تمدید نشست در حال حاضر وجود ندارد.", 503);
    }
  });

  app.post("/api/v1/auth/logout", { preHandler: [requireMobileVerified] }, async (request, reply) => {
    const authorization = request.headers.authorization?.toString();
    const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";

    if (!token) {
      throw new AppError("validation_failed", "نشست برای خروج مشخص نیست.", 400, {
        authorization: ["Bearer token اجباری است."]
      });
    }

    try {
      await revokeSession(db, hashSessionToken(token, config.SESSION_SECRET));
      await audit.record({
        actorUserId: request.user!.id,
        action: "auth.logout",
        targetType: "user",
        targetId: request.user!.id
      });

      reply.status(204).send();
    } catch {
      throw new AppError("service_unavailable", "امکان خروج از نشست در حال حاضر وجود ندارد.", 503);
    }
  });

  app.get("/api/v1/me", { preHandler: [requireMobileVerified] }, async (request) => {
    const profile = await getUserProfile(db, request.user!.id).catch(() => undefined);
    const user = await findUserById(db, request.user!.id).catch(() => undefined);
    const businessProfile = await getBusinessProfile(db, request.user!.id).catch(() => undefined);
    const identityVerification = await db.selectFrom("identity_verification_requests")
      .select("status")
      .where("user_id", "=", request.user!.id)
      .orderBy("created_at", "desc")
      .executeTakeFirst()
      .catch(() => undefined);
    return {
        data: {
      id: request.user!.id,
      phone_number: user?.phone_number ?? null,
      created_at: user?.created_at ?? null,
      account_status: user?.status ?? null,
      identity_verification_status: identityVerification?.status ?? "not_implemented",
      mobile_verified: request.user!.mobileVerified,
        roles: request.user!.roles,
        profile: profile
          ? {
              display_name: profile.display_name,
              first_name: profile.first_name,
              last_name: profile.last_name,
              primary_city_id: profile.primary_city_id,
              verification_status: profile.verification_status
            }
          : null,
        password_set: Boolean(user?.password_hash),
        profile_complete: isProfileComplete(profile),
        can_create_listing: request.user!.mobileVerified && isProfileComplete(profile),
        profile_missing_fields: getProfileCompletionMissingFields(profile),
        business_profile: businessProfile ?? null
      }
    };
  });

  app.get("/api/v1/me/identity-verification", { preHandler: [requireMobileVerified] }, async (request) => {
    const row = await db.selectFrom("identity_verification_requests")
      .select(["id", "document_type", "national_id_last4", "status", "rejection_reason", "verification_method", "verified_at", "revoked_at", "reviewed_at", "created_at"])
      .where("user_id", "=", request.user!.id).orderBy("created_at", "desc").executeTakeFirst();
    return { data: row ?? null };
  });

  app.post<{ Body: { document_type?: string; document_data_url?: string } }>("/api/v1/me/identity-verification", { preHandler: [requireMobileVerified] }, async (request, reply) => {
    const body = request.body ?? {};
    const documentType = body.document_type?.trim();
    if (!documentType || !["national_card", "birth_certificate", "passport"].includes(documentType) || !body.document_data_url) {
      throw new AppError("validation_failed", "نوع مدرک و تصویر یا PDF مدرک الزامی است.", 400);
    }
    const validDocumentType = documentType as string;
    const documentDataUrl = body.document_data_url;
    const document = parseIdentityDocument(documentDataUrl);
    const existing = await db.selectFrom("identity_verification_requests").select("id").where("user_id", "=", request.user!.id).where("status", "=", "pending").executeTakeFirst();
    if (existing) throw new AppError("conflict", "یک درخواست احراز هویت در انتظار بررسی است.", 409);
    const id = crypto.randomUUID();
    const now = new Date();
    await db.insertInto("identity_verification_requests").values({ id, user_id: request.user!.id, document_type: validDocumentType, national_id_last4: null, document_mime_type: document.mimeType, document_data: document.buffer, status: "pending", rejection_reason: null, reviewed_by: null, reviewed_at: null, verification_method: "manual_admin", verified_at: null, revoked_at: null, created_at: now, updated_at: now }).execute();
    await audit.record({ actorUserId: request.user!.id, action: "identity_verification.submitted", targetType: "user", targetId: request.user!.id, metadata: { requestId: id, documentType: validDocumentType } });
    reply.status(201).send({ data: { id, status: "pending", created_at: now } });
  });

  app.get("/api/v1/me/business-profile", { preHandler: [requireMobileVerified] }, async (request) => ({
    data: await getBusinessProfile(db, request.user!.id).catch(() => null)
  }));

  app.put<{
    Body: {
      business_name?: string;
      business_type?: string;
      bio?: string;
      service_area?: string;
      opening_hours?: string;
      is_public?: boolean;
    };
  }>("/api/v1/me/business-profile", { preHandler: [requireMobileVerified] }, async (request) => {
    const body = request.body;
    if (!body.business_name?.trim() || !body.business_type?.trim() || !body.service_area?.trim() || !body.opening_hours?.trim()) {
      throw new AppError("validation_failed", "نام کسب‌وکار، نوع فعالیت، محدوده خدمت و ساعات کاری را کامل کن.", 400);
    }
    return {
      data: await upsertBusinessProfile(db, request.user!.id, {
        businessName: body.business_name,
        businessType: body.business_type,
        bio: body.bio,
        serviceArea: body.service_area,
        openingHours: body.opening_hours,
        isPublic: body.is_public ?? true
      })
    };
  });

  app.get<{ Params: { userId: string } }>("/api/v1/business-profiles/:userId", async (request) => {
    const profile = await getBusinessProfile(db, request.params.userId).catch(() => undefined);
    return { data: profile?.is_public ? profile : null };
  });

  app.get<{ Params: { userId: string } }>("/api/v1/business-profiles/:userId/trust", async (request) => {
    const profile = await getBusinessProfile(db, request.params.userId).catch(() => undefined);
    if (!profile?.is_public) return { data: null };
    return { data: await getPublicTrustSummary(db, request.params.userId).catch(() => null) };
  });

  type StorefrontBody = {
    category_id: string; city_id: string; name: string; slug: string; short_description: string;
    description: string; business_type: string; address?: string; phone?: string; secondary_phone?: string;
    working_hours?: unknown; logo_asset_id?: string | null; cover_asset_id?: string | null;
  };
  app.get("/api/v1/me/storefront", { preHandler: [requireMobileVerified] }, async (request) => ({ data: await getStorefrontByOwner(db, request.user!.id).catch(() => null) }));
  app.get<{ Params: { id: string } }>("/api/v1/storefronts/:id", async (request) => {
    const storefront = await getStorefrontById(db, request.params.id);
    if (!storefront || storefront.status !== "active") throw new AppError("not_found", "غرفه فعال پیدا نشد.", 404);
    return { data: { storefront: { ...storefront, owner_trust: await getPublicTrustSummary(db, storefront.owner_user_id).catch(() => null) }, listings: await listStorefrontListings(db, storefront.id) } };
  });
  app.get<{ Params: { slug: string } }>("/api/v1/storefronts/by-slug/:slug", async (request) => {
    const storefront = await getStorefrontBySlug(db, normalizeStorefrontSlug(request.params.slug));
    if (!storefront) throw new AppError("not_found", "غرفه فعال پیدا نشد.", 404);
    return { data: { storefront: { ...storefront, owner_trust: await getPublicTrustSummary(db, storefront.owner_user_id).catch(() => null) }, listings: await listStorefrontListings(db, storefront.id) } };
  });
  app.post<{ Body: StorefrontBody }>("/api/v1/storefronts", { preHandler: [requireMobileVerified] }, async (request, reply) => {
    const existing = await getStorefrontByOwner(db, request.user!.id);
    if (existing) throw new AppError("conflict", "برای این حساب یک غرفه وجود دارد؛ همان را ویرایش کن.", 409);
    const body = request.body;
    const slug = normalizeStorefrontSlug(body.slug ?? "");
    if (!body.name?.trim() || slug.length < 3 || !body.short_description?.trim() || !body.description?.trim() || !body.business_type?.trim() || !body.category_id || !body.city_id) throw new AppError("validation_failed", "اطلاعات اصلی غرفه را کامل کن.", 400);
    const duplicate = await getStorefrontBySlug(db, slug, true);
    if (duplicate) throw new AppError("conflict", "این شناسه غرفه قبلاً استفاده شده است.", 409);
    const [city, category] = await Promise.all([db.selectFrom("cities").select("id").where("id", "=", body.city_id).where("is_active", "=", true).executeTakeFirst(), db.selectFrom("categories").select("id").where("id", "=", body.category_id).where("is_active", "=", true).executeTakeFirst()]);
    if (!city || !category) throw new AppError("validation_failed", "شهر یا دسته انتخاب‌شده معتبر نیست.", 400);
    for (const assetId of [body.logo_asset_id, body.cover_asset_id]) if (assetId && !(await db.selectFrom("media_assets").select("id").where("id", "=", assetId).where("owner_user_id", "=", request.user!.id).executeTakeFirst())) throw new AppError("forbidden", "رسانه غرفه متعلق به این حساب نیست.", 403);
    const created = await createStorefront(db, { ownerUserId: request.user!.id, categoryId: body.category_id, cityId: body.city_id, name: body.name, slug, shortDescription: body.short_description, description: body.description, businessType: body.business_type, ...(body.address !== undefined ? { address: body.address } : {}), ...(body.phone !== undefined ? { phone: body.phone } : {}), ...(body.secondary_phone !== undefined ? { secondaryPhone: body.secondary_phone } : {}), ...(body.working_hours !== undefined ? { workingHours: body.working_hours } : {}), ...(body.logo_asset_id !== undefined ? { logoAssetId: body.logo_asset_id } : {}), ...(body.cover_asset_id !== undefined ? { coverAssetId: body.cover_asset_id } : {}) });
    reply.status(201).send({ data: created });
  });
  app.patch<{ Body: StorefrontBody }>("/api/v1/me/storefront", { preHandler: [requireMobileVerified] }, async (request) => {
    const current = await getStorefrontByOwner(db, request.user!.id);
    if (!current) throw new AppError("not_found", "ابتدا غرفه را ایجاد کن.", 404);
    const body = request.body;
    const slug = normalizeStorefrontSlug(body.slug ?? "");
    if (!body.name?.trim() || slug.length < 3 || !body.short_description?.trim() || !body.description?.trim() || !body.business_type?.trim() || !body.category_id || !body.city_id) throw new AppError("validation_failed", "اطلاعات اصلی غرفه را کامل کن.", 400);
    const duplicate = await getStorefrontBySlug(db, slug, true);
    if (duplicate && duplicate.id !== current.id) throw new AppError("conflict", "این شناسه غرفه قبلاً استفاده شده است.", 409);
    const [city, category] = await Promise.all([db.selectFrom("cities").select("id").where("id", "=", body.city_id).where("is_active", "=", true).executeTakeFirst(), db.selectFrom("categories").select("id").where("id", "=", body.category_id).where("is_active", "=", true).executeTakeFirst()]);
    if (!city || !category) throw new AppError("validation_failed", "شهر یا دسته انتخاب‌شده معتبر نیست.", 400);
    for (const assetId of [body.logo_asset_id, body.cover_asset_id]) if (assetId && !(await db.selectFrom("media_assets").select("id").where("id", "=", assetId).where("owner_user_id", "=", request.user!.id).executeTakeFirst())) throw new AppError("forbidden", "رسانه غرفه متعلق به این حساب نیست.", 403);
    return { data: await updateStorefront(db, current.id, { ownerUserId: request.user!.id, categoryId: body.category_id, cityId: body.city_id, name: body.name, slug, shortDescription: body.short_description, description: body.description, businessType: body.business_type, ...(body.address !== undefined ? { address: body.address } : {}), ...(body.phone !== undefined ? { phone: body.phone } : {}), ...(body.secondary_phone !== undefined ? { secondaryPhone: body.secondary_phone } : {}), ...(body.working_hours !== undefined ? { workingHours: body.working_hours } : {}), ...(body.logo_asset_id !== undefined ? { logoAssetId: body.logo_asset_id } : {}), ...(body.cover_asset_id !== undefined ? { coverAssetId: body.cover_asset_id } : {}) }) };
  });
  app.get("/api/v1/admin/storefronts", { preHandler: [requireRole("moderator")] }, async () => ({ data: await listStorefrontsForAdmin(db) }));
  app.post<{ Params: { id: string }; Body: { decision: "approve" | "suspend" | "archive"; reason?: string } }>("/api/v1/admin/storefronts/:id/decisions", { preHandler: [requireRole("moderator")] }, async (request) => {
    if (!["approve", "suspend", "archive"].includes(request.body.decision)) throw new AppError("validation_failed", "تصمیم غرفه معتبر نیست.", 400);
    const result = await decideStorefront(db, request.params.id, request.body.decision, request.body.reason);
    if (!result) throw new AppError("not_found", "غرفه پیدا نشد.", 404);
    await audit.record({ actorUserId: request.user!.id, action: "storefront.moderation_decision", targetType: "storefront", targetId: request.params.id, metadata: { decision: request.body.decision } });
    return { data: result };
  });

  app.get("/api/v1/privacy-policy", async () => ({ data: {
    version: "2026-08-13",
    analytics: "4D فقط eventهای محدود محصولی را برای سنجش عملکرد آگهی‌ها نگه می‌دارد.",
    control: "کاربر می‌تواند ثبت eventهای شخصی را متوقف کند و داده‌های رفتاری actor خود را حذف کند.",
    retention_days: config.ANALYTICS_RETENTION_DAYS,
    sensitive_data: "متن پیام، OTP، token و اطلاعات حساس در analytics ذخیره نمی‌شوند."
  } }));

  app.put<{
    Body: {
      first_name: string;
      last_name: string;
      display_name?: string;
      primary_city_id?: string;
      password?: string;
    };
  }>("/api/v1/me/profile", { preHandler: [requireMobileVerified] }, async (request) => {
    const body = request.body;
    if (!body.first_name?.trim() || !body.last_name?.trim() || !body.primary_city_id) {
      throw new AppError("validation_failed", "برای احراز هویت سبک، نام، نام خانوادگی و شهر را کامل کن.", 400, {
        first_name: body.first_name?.trim() ? [] : ["نام اجباری است."],
        last_name: body.last_name?.trim() ? [] : ["نام خانوادگی اجباری است."],
        primary_city_id: body.primary_city_id ? [] : ["شهر اصلی اجباری است."]
      });
    }
    if (body.password !== undefined && body.password.length > 0 && body.password.length < 8) {
      throw new AppError("validation_failed", "رمز عبور باید حداقل ۸ کاراکتر باشد.", 400, {
        password: ["رمز قوی‌تر انتخاب کن."]
      });
    }
    const city = await db
      .selectFrom("cities")
      .select("id")
      .where("id", "=", body.primary_city_id)
      .where("is_active", "=", true)
      .executeTakeFirst();
    if (!city) {
      throw new AppError("validation_failed", "شهر انتخاب‌شده معتبر نیست؛ فهرست شهرها را تازه‌سازی کن.", 400, {
        primary_city_id: ["شهر انتخاب‌شده معتبر نیست."]
      });
    }
    const user = await findUserById(db, request.user!.id);
    const profile = await updateUserProfile(db, request.user!.id, {
      firstName: body.first_name,
      lastName: body.last_name,
      ...(body.display_name ? { displayName: body.display_name } : {}),
      primaryCityId: body.primary_city_id
    });
    if (body.password) {
      await setUserPassword(db, request.user!.id, body.password);
    }

    return {
      data: {
        profile,
        password_set: Boolean(body.password || user?.password_hash),
        profile_complete: isProfileComplete(profile),
        can_create_listing: request.user!.mobileVerified && isProfileComplete(profile),
        profile_missing_fields: getProfileCompletionMissingFields(profile)
      }
    };
  });

  app.get("/api/v1/me/push-subscriptions", { preHandler: [requireMobileVerified] }, async (request) => ({
    data: await listActivePushSubscriptions(db, request.user!.id)
  }));

  app.post<{
    Body: {
      endpoint: string;
      keys?: {
        p256dh?: string;
        auth?: string;
      };
    };
  }>("/api/v1/me/push-subscriptions", { preHandler: [requireMobileVerified] }, async (request, reply) => {
    const endpoint = normalizePushEndpoint(request.body.endpoint);
    if (!endpoint || !request.body.keys?.p256dh || !request.body.keys?.auth) {
      throw new AppError("validation_failed", "Push subscription معتبر نیست.", 400, {
        endpoint: endpoint ? [] : ["endpoint باید یک URL امن باشد."],
        keys: request.body.keys?.p256dh && request.body.keys?.auth ? [] : ["کلیدهای p256dh و auth الزامی هستند."]
      });
    }

    try {
      const subscription = await upsertPushSubscription(db, {
        userId: request.user!.id,
        endpoint,
        p256dh: request.body.keys.p256dh,
        auth: request.body.keys.auth,
        ...(request.headers["user-agent"] ? { userAgent: request.headers["user-agent"].toString() } : {})
      });
      reply.status(201).send({ data: subscription });
    } catch {
      throw new AppError("service_unavailable", "امکان ذخیره اعلان push در حال حاضر وجود ندارد.", 503);
    }
  });

  app.delete<{
    Body: {
      endpoint: string;
    };
  }>("/api/v1/me/push-subscriptions", { preHandler: [requireMobileVerified] }, async (request, reply) => {
    const endpoint = normalizePushEndpoint(request.body.endpoint);
    if (!endpoint) {
      throw new AppError("validation_failed", "Push subscription معتبر نیست.", 400, {
        endpoint: ["endpoint باید یک URL امن باشد."]
      });
    }

    await revokePushSubscription(db, request.user!.id, endpoint);
    reply.status(204).send();
  });

  app.post<{
    Body: { token: string; platform: string; provider?: string };
  }>("/api/v1/me/native-push-tokens", { preHandler: [requireMobileVerified] }, async (request, reply) => {
    const token = request.body.token?.trim();
    const platform = request.body.platform?.trim().toLowerCase();
    const provider = request.body.provider?.trim().toLowerCase() || "expo";
    if (!token || token.length > 512 || !["android", "ios"].includes(platform) || !["expo"].includes(provider)) {
      throw new AppError("validation_failed", "توکن اعلان موبایل معتبر نیست.", 400);
    }
    const saved = await upsertNativePushToken(db, { userId: request.user!.id, token, platform, provider });
    reply.status(201).send({ data: saved });
  });

  app.delete<{
    Body: { token: string };
  }>("/api/v1/me/native-push-tokens", { preHandler: [requireMobileVerified] }, async (request, reply) => {
    const token = request.body.token?.trim();
    if (!token || token.length > 512) throw new AppError("validation_failed", "توکن اعلان موبایل معتبر نیست.", 400);
    await revokeNativePushToken(db, request.user!.id, token);
    reply.status(204).send();
  });

  app.post("/api/v1/me/push-test", { preHandler: [requireMobileVerified] }, async (request, reply) => {
    try {
      const result = await sendUserPushNotification(db, config, {
        userId: request.user!.id,
        title: "تست اعلان 4D",
        body: "اگر این پیام را دیدی، Push واقعی روی این دستگاه آماده است.",
        tag: "four-d-push-test",
        url: "/profile"
      });

      reply.status(202).send({ data: result });
    } catch (error) {
      request.log.warn({ err: error }, "push self-test failed");
      throw new AppError("service_unavailable", "امکان ارسال تست Push در حال حاضر وجود ندارد.", 503);
    }
  });

  app.get("/api/v1/feed", async (request) => {
    try {
      return {
        data: await listFeedContents(db),
        page: {
          next_cursor: null,
          has_more: false
        },
        meta: { source: "database" }
      };
    } catch (error) {
      request.log.error({ err: error }, "market feed query failed");
      return {
        data: [],
        page: {
          next_cursor: null,
          has_more: false
        },
        meta: { source: "unavailable" }
      };
    }
  });

  app.post<{
    Body: {
      image_data_url?: string;
      media_data_url?: string;
    };
  }>("/api/v1/media/listing-images", { preHandler: [requireMobileVerified] }, async (request, reply) => {
    const dataUrl = request.body?.media_data_url ?? request.body?.image_data_url;
    if (!dataUrl) {
      throw new AppError("validation_failed", "رسانه برای آپلود ارسال نشده است.", 400, {
        image_data_url: ["عکس الزامی است."]
      });
    }

    if (!mediaStore) throw new AppError("service_unavailable", "آپلود رسانهٔ آگهی فعلاً غیرفعال است.", 503);
    const result = await mediaStore.saveListingMedia({
      dataUrl,
      ownerUserId: request.user!.id
    });
    const asset = await createMediaAsset(db, {
      ownerUserId: request.user!.id,
      storageKey: result.storage_key,
      publicUrl: result.url,
      mimeType: result.mime_type,
      sizeBytes: result.size_bytes,
      checksumSha256: result.checksum_sha256
    }).catch((error) => {
      request.log.error({ err: error }, "media asset persistence failed");
      if (config.NODE_ENV === "test") return undefined;
      throw new AppError("service_unavailable", "رسانه ذخیره شد اما ثبت آن در پایگاه‌داده انجام نشد؛ migration رسانه را اجرا کن.", 503);
    });

    reply.status(201).send({ data: { ...result, ...(asset ? { asset_id: asset.id } : {}) } });
  });

  app.get<{ Params: { "*": string } }>(`${config.MEDIA_PUBLIC_PATH}/*`, async (request, reply) => {
    if (!mediaStore) throw new AppError("not_found", "رسانه پیدا نشد.", 404);
    const asset = await mediaStore.readPublicAsset(request.params["*"]);
    reply.header("cache-control", "public, max-age=31536000, immutable");
    reply.type(asset.mime_type).send(asset.body);
  });

  app.post<{
    Body: {
      content_type?: "listing" | "service_listing";
      title: string;
      description: string;
      city_id: string;
      category_id: string;
      price_amount?: number;
      price_type?: "fixed" | "negotiable";
      item_condition?: "new" | "used" | "like_new";
      image_data_url?: string;
      image_url?: string;
      media_asset_ids?: string[];
      service_details?: {
        service_area?: string;
        pricing_model?: "quote" | "fixed" | "starting_at" | "hourly" | "daily";
        availability?: string;
        experience_years?: number;
      };
      storefront_id?: string | null;
      metadata?: Record<string, unknown>;
    };
  }>(
    "/api/v1/listings",
    { preHandler: [requireMobileVerified] },
    async (request, reply) => {
      const body = request.body;
      if (!body.title || !body.description || !body.city_id || !body.category_id) {
        throw new AppError("validation_failed", "اطلاعات واردشده معتبر نیست.", 400, {
          title: body.title ? [] : ["عنوان اجباری است."],
          description: body.description ? [] : ["توضیح اجباری است."],
          city_id: body.city_id ? [] : ["شهر اجباری است."],
          category_id: body.category_id ? [] : ["دسته اجباری است."]
        });
      }
      const profile = await getUserProfile(db, request.user!.id).catch(() => undefined);
      if (!isProfileComplete(profile)) {
        const missing = getProfileCompletionMissingFields(profile);
        throw new AppError("forbidden", `قبل از ثبت آگهی، ${missing.includes("primary_city_id") ? "شهر اصلی" : "نام و نام خانوادگی"} را کامل کن.`, 403, { profile: missing });
      }
      if (body.image_data_url && body.image_data_url.startsWith("data:") && body.image_data_url.length > 2_000_000) {
        throw new AppError("validation_failed", "حجم عکس برای MVP زیاد است.", 400, {
          image_data_url: ["عکس بعد از فشرده‌سازی باید کوچک‌تر از 2MB باشد."]
        });
      }
      const imageUrl = body.image_url ?? body.image_data_url;
      if (body.price_amount !== undefined && (!Number.isFinite(body.price_amount) || body.price_amount < 0)) {
        throw new AppError("validation_failed", "مبلغ واردشده معتبر نیست.", 400, { price_amount: ["مبلغ باید یک عدد صفر یا بزرگ‌تر باشد."] });
      }
      const priceType = body.price_amount != null && Number(body.price_amount) > 0 ? "fixed" : "negotiable";
      const contentType = body.content_type ?? "listing";
      let storefrontId: string | null = null;
      if (body.storefront_id) {
        const storefront = await getStorefrontById(db, body.storefront_id);
        if (!storefront || storefront.owner_user_id !== request.user!.id) throw new AppError("forbidden", "این غرفه متعلق به شما نیست.", 403);
        if (storefront.status !== "active" && storefront.status !== "pending_review" && storefront.status !== "draft") throw new AppError("validation_failed", "غرفه برای اتصال به آگهی آماده نیست.", 400);
        storefrontId = storefront.id;
      }
      if (body.media_asset_ids && (!Array.isArray(body.media_asset_ids) || body.media_asset_ids.length > 7)) {
        throw new AppError("validation_failed", "حداکثر ۶ عکس و ۱ ویدیو برای هر آگهی مجاز است.", 400);
      }
      const category = await db.selectFrom("categories").select(["slug", "content_types", "metadata_schema"]).where("id", "=", body.category_id).where("is_active", "=", true).executeTakeFirst();
      if (!category) throw new AppError("validation_failed", "دسته انتخاب‌شده معتبر نیست.", 400, { category_id: ["دسته را دوباره انتخاب کن."] });
      const contentTypes = Array.isArray(category.content_types) ? category.content_types.map(String) : [];
      if (!contentTypes.includes(contentType)) throw new AppError("validation_failed", "این دسته برای نوع انتخاب‌شده مناسب نیست.", 400, { category_id: ["برای ثبت خدمت، یک دسته خدماتی انتخاب کن."] });
      const metadataResult = validateCategoryMetadata(body.metadata, category.metadata_schema);
      if (metadataResult.errors.length) throw new AppError("validation_failed", "ویژگی‌های اختصاصی دسته را کامل کن.", 400, { metadata: metadataResult.errors });
      if (contentType === "service_listing" && (!body.service_details?.service_area?.trim() || !body.service_details.pricing_model || !body.service_details.availability?.trim())) {
        throw new AppError("validation_failed", "اطلاعات خدمت کامل نیست.", 400, { service_details: ["حوزه خدمت، مدل قیمت‌گذاری و زمان ارائه را کامل کن."] });
      }
      const fieldPolicy = getListingFieldPolicy(category.slug, contentType as ContentType);

      let listing;
      try {
        listing = await createListing(db, {
          ownerUserId: request.user!.id,
          contentType,
          cityId: body.city_id,
          categoryId: body.category_id,
          title: body.title,
          description: body.description,
          ...(fieldPolicy.showPrice && priceType === "fixed" ? { priceAmount: body.price_amount } : {}),
          priceType: fieldPolicy.showPrice ? priceType : "negotiable",
          ...(fieldPolicy.showItemCondition && body.item_condition ? { itemCondition: body.item_condition } : {}),
          ...(imageUrl ? { imageDataUrl: imageUrl } : {}),
          ...(body.media_asset_ids?.length ? { mediaAssetIds: body.media_asset_ids } : {}),
          ...(body.service_details ? { serviceDetails: body.service_details } : {}),
          metadata: metadataResult.metadata,
          storefrontId
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message === "media_not_owned") {
          throw new AppError("validation_failed", "یکی از فایل‌های انتخاب‌شده متعلق به این حساب نیست.", 400, {
            media_asset_ids: ["فایل‌ها را دوباره انتخاب و بارگذاری کن."]
          });
        }
        if (message === "media_limit") {
          throw new AppError("validation_failed", "حداکثر ۶ عکس و ۱ ویدیو برای هر آگهی مجاز است.", 400, {
            media_asset_ids: ["تعداد رسانه‌ها بیش از حد مجاز است."]
          });
        }
        throw error;
      }

      await audit.record({
        ...(request.user?.id ? { actorUserId: request.user.id } : {}),
        action: "content.submitted",
        targetType: "listing",
        targetId: listing.id
      });

      reply.status(202).send({
        data: listing
      });
    }
  );

  app.put<{ Params: { contentId: string }; Body: { title: string; description: string; city_id: string; category_id: string; price_amount?: number | null; price_type?: "fixed" | "negotiable"; item_condition?: "new" | "used" | "like_new" | null; image_url?: string | null; media_asset_ids?: string[]; metadata?: Record<string, unknown> } }>("/api/v1/me/contents/:contentId", { preHandler: [requireMobileVerified] }, async (request) => {
    const body = request.body;
    if (!body.title?.trim() || !body.description?.trim() || !body.city_id || !body.category_id) throw new AppError("validation_failed", "اطلاعات آگهی کامل نیست.", 400);
    if (body.price_amount != null && (!Number.isFinite(body.price_amount) || body.price_amount < 0)) throw new AppError("validation_failed", "مبلغ واردشده معتبر نیست.", 400);
    const priceType = body.price_amount != null && Number(body.price_amount) > 0 ? "fixed" : "negotiable";
    if (body.media_asset_ids && (!Array.isArray(body.media_asset_ids) || body.media_asset_ids.length > 7)) throw new AppError("validation_failed", "حداکثر ۶ عکس و ۱ ویدیو مجاز است.", 400);
    try {
      const category = await db.selectFrom("categories").select(["slug", "metadata_schema"]).where("id", "=", body.category_id).where("is_active", "=", true).executeTakeFirst();
      if (!category) throw new AppError("validation_failed", "دسته انتخاب‌شده معتبر نیست.", 400);
      const currentContent = await db.selectFrom("market_contents").select("content_type").where("id", "=", request.params.contentId).executeTakeFirst();
      const fieldPolicy = getListingFieldPolicy(category.slug, (currentContent?.content_type ?? "listing") as ContentType);
      const metadataResult = validateCategoryMetadata(body.metadata, category.metadata_schema);
      if (metadataResult.errors.length) throw new AppError("validation_failed", "ویژگی‌های اختصاصی دسته را کامل کن.", 400, { metadata: metadataResult.errors });
      return { data: await updateListing(db, { contentId: request.params.contentId, ownerUserId: request.user!.id, cityId: body.city_id, categoryId: body.category_id, title: body.title.trim(), description: body.description.trim(), priceAmount: fieldPolicy.showPrice ? body.price_amount ?? null : null, priceType: fieldPolicy.showPrice ? priceType : "negotiable", itemCondition: fieldPolicy.showItemCondition ? body.item_condition ?? null : null, ...(body.image_url === undefined ? {} : { imageDataUrl: body.image_url }), ...(body.media_asset_ids === undefined ? {} : { mediaAssetIds: body.media_asset_ids }), metadata: metadataResult.metadata }) };
    }
    catch (error) {
      if (error instanceof Error && error.message === "listing_not_owned") throw new AppError("forbidden", "این آگهی متعلق به شما نیست.", 403);
      if (error instanceof Error && error.message === "listing_edit_window_expired") throw new AppError("forbidden", "مهلت ویرایش این آگهی (۲۴ ساعت) تمام شده است.", 403);
      if (error instanceof Error && error.message === "media_not_owned") throw new AppError("validation_failed", "یکی از رسانه‌های انتخاب‌شده متعلق به این حساب نیست.", 400);
      if (error instanceof Error && error.message === "media_limit") throw new AppError("validation_failed", "حداکثر ۶ عکس و ۱ ویدیو مجاز است.", 400);
      request.log.error({ err: error }, "listing update failed");
      throw new AppError("service_unavailable", "ویرایش آگهی انجام نشد.", 503);
    }
  });

  app.delete<{ Params: { contentId: string } }>("/api/v1/me/contents/:contentId", { preHandler: [requireMobileVerified] }, async (request, reply) => {
    try {
      const data = await deleteListing(db, request.params.contentId, request.user!.id);
      return reply.status(200).send({ data });
    }
    catch (error) {
      if (error instanceof Error && error.message === "listing_not_owned") throw new AppError("forbidden", "این آگهی متعلق به شما نیست یا قبلاً حذف شده است.", 403);
      request.log.error({ err: error }, "listing delete failed");
      throw new AppError("service_unavailable", "حذف آگهی انجام نشد؛ وضعیت API یا migration را بررسی کن.", 503);
    }
  });

  app.post<{ Body: {
    mode: TransportMode; title: string; description: string; city_id: string; category_id: string;
    origin_label: string; destination_label: string; origin_city_id?: string | null; destination_city_id?: string | null;
    departure_date: string; time_from: string; time_to?: string | null; seats_available?: number | null;
    passenger_count?: number | null; vehicle_type?: string | null; price_type?: "fixed" | "negotiable"; price_amount?: number | null;
  } }>("/api/v1/transport/trips", { preHandler: [requireMobileVerified] }, async (request, reply) => {
    const body = request.body;
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(body.departure_date ?? "");
    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(body.time_from ?? "");
    if (!(["offer", "request"] as string[]).includes(body.mode) || !body.title?.trim() || !body.description?.trim() || !body.city_id || !body.category_id || !body.origin_label?.trim() || !body.destination_label?.trim() || !validDate || !validTime) {
      throw new AppError("validation_failed", "اطلاعات سفر کامل یا معتبر نیست.", 400);
    }
    if (body.time_to && !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time_to)) throw new AppError("validation_failed", "بازه زمانی معتبر نیست.", 400);
    if (body.seats_available != null && (!Number.isInteger(body.seats_available) || body.seats_available < 1 || body.seats_available > 50)) throw new AppError("validation_failed", "ظرفیت باید بین ۱ تا ۵۰ باشد.", 400);
    if (body.passenger_count != null && (!Number.isInteger(body.passenger_count) || body.passenger_count < 1 || body.passenger_count > 50)) throw new AppError("validation_failed", "تعداد مسافر معتبر نیست.", 400);
    if (body.price_amount != null && (!Number.isFinite(body.price_amount) || body.price_amount < 0)) throw new AppError("validation_failed", "مبلغ معتبر نیست.", 400);
    if ((body.price_type ?? "negotiable") === "fixed" && (!Number.isFinite(body.price_amount) || Number(body.price_amount) <= 0)) throw new AppError("validation_failed", "برای مبلغ ثابت، قیمت را وارد کن.", 400);
    const profile = await getUserProfile(db, request.user!.id).catch(() => undefined);
    const user = await findUserById(db, request.user!.id).catch(() => undefined);
    if (!isProfileComplete(profile) || !user?.password_hash) throw new AppError("forbidden", "قبل از ثبت سفر، پروفایل و احراز هویت را کامل کن.", 403);
    const category = await db.selectFrom("categories").select("content_types").where("id", "=", body.category_id).where("is_active", "=", true).executeTakeFirst();
    const contentType = body.mode === "offer" ? "transport_offer" : "transport_request";
    const types = Array.isArray(category?.content_types) ? category.content_types.map(String) : [];
    if (!category || !types.includes(contentType)) throw new AppError("validation_failed", "دسته حمل‌ونقل معتبر نیست.", 400);
    const data = await createTransport(db, { ownerUserId: request.user!.id, cityId: body.city_id, categoryId: body.category_id, mode: body.mode, title: body.title.trim(), description: body.description.trim(), originLabel: body.origin_label.trim(), destinationLabel: body.destination_label.trim(), originCityId: body.origin_city_id, destinationCityId: body.destination_city_id, departureDate: body.departure_date, timeFrom: body.time_from, timeTo: body.time_to, seatsAvailable: body.seats_available, passengerCount: body.passenger_count, vehicleType: body.vehicle_type?.trim(), priceType: body.price_type ?? "negotiable", priceAmount: body.price_amount });
    await audit.record({ actorUserId: request.user!.id, action: "transport.submitted", targetType: "transport", targetId: data.id });
    reply.status(202).send({ data });
  });

  app.get<{ Querystring: Record<string, string | undefined> }>("/api/v1/transport/search", async (request) => {
    const query = request.query;
    const mode = query.mode === "offer" || query.mode === "request" ? query.mode : undefined;
    const data = await searchTransport(db, {
      query: query.q ? normalizeTransportText(query.q) : undefined,
      origin: query.origin ? normalizeTransportText(query.origin) : undefined,
      destination: query.destination ? normalizeTransportText(query.destination) : undefined,
      departureDate: query.date,
      mode,
      limit: Math.min(Math.max(Number(query.limit) || 20, 1), 50)
    });
    return { data };
  });
  app.get<{ Params: { contentId: string } }>("/api/v1/transport/:contentId", async (request) => {
    await assertPublicContent(db, request.params.contentId);
    return { data: await getTransport(db, request.params.contentId) };
  });
  app.get("/api/v1/me/transport", { preHandler: [requireMobileVerified] }, async (request) => ({ data: await listUserTransport(db, request.user!.id) }));
  app.post<{ Params: { contentId: string } }>("/api/v1/me/transport/:contentId/cancel", { preHandler: [requireMobileVerified] }, async (request) => {
    try { return { data: await cancelTransport(db, request.params.contentId, request.user!.id) }; }
    catch (error) { if (error instanceof Error && error.message === "transport_not_owned_or_inactive") throw new AppError("forbidden", "این سفر متعلق به شما نیست یا قبلاً بسته شده است.", 403); throw error; }
  });

  app.get<{ Params: { contentId: string } }>("/api/v1/contents/:contentId", async (request, reply) => {
    try {
      await assertPublicContent(db, request.params.contentId);
    } catch (error) {
      const { contentId } = request.params;
      if (!(error instanceof AppError) || error.code !== "not_found" || !request.user ||
          !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(contentId)) throw error;
      const user = request.user;
      let preview = db.selectFrom("market_contents").select("id")
        .where("id", "=", contentId).where("deleted_at", "is", null);
      if (!user.roles.some((role) => role === "admin" || role === "moderator")) {
        preview = preview.where("owner_user_id", "=", user.id);
      }
      if (!await preview.executeTakeFirst()) throw error;
      reply.header("cache-control", "private, no-store");
      return { data: await getContentDetail(db, contentId) };
    }
    const content = { id: request.params.contentId };
    const viewerHash = createHash("sha256").update(`${request.ip}|${config.SESSION_SECRET}`).digest("hex");
    await recordListingView(db, { contentId: content.id, ...(request.user?.id ? { actorUserId: request.user.id } : {}), viewerHash }).catch(() => undefined);
    return { data: await getContentDetail(db, content.id) };
  });

  app.get("/api/v1/me/favorites", { preHandler: [requireMobileVerified] }, async (request) => {
    try {
      return { data: await listUserFavoriteIds(db, request.user!.id), meta: { source: "database" } };
    } catch {
      return { data: [], meta: { source: "unavailable" } };
    }
  });

  app.post<{ Params: { contentId: string } }>("/api/v1/contents/:contentId/favorite", { preHandler: [requireMobileVerified] }, async (request, reply) => {
    const result = await addFavorite(db, request.user!.id, request.params.contentId);
    await recordAnalyticsEvent(db, { actorUserId: request.user!.id, eventName: "favorite_added", targetType: "listing", targetId: request.params.contentId }).catch(() => undefined);
    reply.status(201).send({ data: result });
  });

  app.delete<{ Params: { contentId: string } }>("/api/v1/contents/:contentId/favorite", { preHandler: [requireMobileVerified] }, async (request) => ({
    data: await removeFavorite(db, request.user!.id, request.params.contentId)
  }));

  app.post<{ Body: { title: string; description: string; price_amount?: number | null; category_name?: string | null } }>("/api/v1/ai/listing-review", { preHandler: [requireMobileVerified] }, async (request) => ({
    data: await reviewListingWithAi({
      provider: config.AI_PROVIDER,
      apiUrl: config.AI_API_URL,
      apiKey: config.AI_API_KEY ?? config.AVALAI_API_KEY,
      model: config.AI_MODEL
    }, request.body)
  }));

  app.post<{
    Body: {
      content_id: string;
    };
  }>(
    "/api/v1/contact-intents",
    { preHandler: [requireMobileVerified] },
    async (request, reply) => {
      if (!request.body.content_id) {
        throw new AppError("validation_failed", "آگهی برای شروع تماس مشخص نیست.", 400, {
          content_id: ["شناسه محتوا اجباری است."]
        });
      }

      try {
        await assertPublicContent(db, request.body.content_id);
        const content = await getContentDetail(db, request.body.content_id);
        if (content.owner_user_id === request.user!.id) {
          throw new AppError("validation_failed", "برای آگهی خودتان نمی‌توانید تماس شروع کنید.", 400);
        }

        const contact = await createContactIntent(db, {
          contentId: request.body.content_id,
          requesterUserId: request.user!.id,
          ownerUserId: content.owner_user_id
        });
        await recordAnalyticsEvent(db, { actorUserId: request.user!.id, eventName: "contact_started", targetType: "listing", targetId: request.body.content_id }).catch(() => undefined);

        await audit.record({
          actorUserId: request.user!.id,
          action: "contact.started",
          targetType: "content",
          targetId: request.body.content_id
        });

        reply.status(201).send({ data: contact });
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("service_unavailable", "امکان ثبت تماس در حال حاضر وجود ندارد.", 503);
      }
    }
  );

  app.get("/api/v1/me/conversations", { preHandler: [requireMobileVerified] }, async (request) => ({
    data: await listUserConversations(db, request.user!.id)
  }));

  app.get<{ Params: { conversationId: string } }>(
    "/api/v1/conversations/:conversationId/messages",
    { preHandler: [requireMobileVerified] },
    async (request) => ({
      data: await listConversationMessages(db, request.params.conversationId, request.user!.id)
    })
  );

  app.post<{
    Params: { conversationId: string };
    Body: { body: string };
  }>(
    "/api/v1/conversations/:conversationId/messages",
    { preHandler: [requireMobileVerified] },
    async (request, reply) => {
      const body = request.body.body?.trim();
      if (!body || body.length > 1000) {
        throw new AppError("validation_failed", "متن پیام معتبر نیست.", 400, {
          body: ["پیام باید بین ۱ تا ۱۰۰۰ کاراکتر باشد."]
        });
      }

      if (await isConversationBlocked(db, request.params.conversationId)) {
        throw new AppError("conversation_blocked", "این گفتگو مسدود شده و امکان ارسال پیام جدید وجود ندارد.", 403);
      }

      const message = await createConversationMessage(db, {
        conversationId: request.params.conversationId,
        senderUserId: request.user!.id,
        body
      });

      try {
        const target = await getConversationNotificationTarget(db, request.params.conversationId, request.user!.id);
        if (!target.isMuted) await enqueueNotification(db, { userId: target.recipientUserId, title: target.contentTitle, body, tag: request.params.conversationId, url: "/profile" });
      } catch (error) { request.log.warn({ err: error }, "notification outbox enqueue failed"); }

      reply.status(201).send({ data: message });
    }
  );

  app.put<{
    Params: { conversationId: string };
    Body: { is_muted: boolean };
  }>(
    "/api/v1/conversations/:conversationId/preferences",
    { preHandler: [requireMobileVerified] },
    async (request) => {
      if (typeof request.body.is_muted !== "boolean") {
        throw new AppError("validation_failed", "تنظیمات گفتگو معتبر نیست.", 400, {
          is_muted: ["مقدار mute باید true یا false باشد."]
        });
      }

      const preference = await updateConversationPreference(db, {
        conversationId: request.params.conversationId,
        userId: request.user!.id,
        isMuted: request.body.is_muted
      });

      return { data: preference };
    }
  );

  app.put<{
    Params: { conversationId: string };
    Body: { is_blocked: boolean };
  }>(
    "/api/v1/conversations/:conversationId/block",
    { preHandler: [requireMobileVerified] },
    async (request) => {
      if (typeof request.body.is_blocked !== "boolean") {
        throw new AppError("validation_failed", "تنظیمات مسدودسازی گفتگو معتبر نیست.", 400, {
          is_blocked: ["مقدار block باید true یا false باشد."]
        });
      }

      const block = await updateConversationBlock(db, {
        conversationId: request.params.conversationId,
        userId: request.user!.id,
        isBlocked: request.body.is_blocked
      });

      return { data: block };
    }
  );

  app.post<{
    Body: {
      target_type: "content" | "user" | "message";
      target_id: string;
      reason: string;
      description?: string;
    };
  }>(
    "/api/v1/reports",
    { preHandler: [requireMobileVerified] },
    async (request, reply) => {
      const body = request.body;
      if (!body.target_type || !reportTargetTypes.has(body.target_type) || !body.target_id || !body.reason || !reportReasons.has(body.reason)) {
        throw new AppError("validation_failed", "گزارش معتبر نیست.", 400, {
          target_type: body.target_type ? [] : ["نوع هدف اجباری است."],
          target_id: body.target_id ? [] : ["شناسه هدف اجباری است."],
          reason: reportReasons.has(body.reason) ? [] : ["دلیل گزارش معتبر نیست."]
        });
      }

      try {
        if (body.target_type === "message") {
          await assertMessageVisibleToUser(db, body.target_id, request.user!.id);
        }

        const report = await createReport(db, {
          reporterUserId: request.user!.id,
          targetType: body.target_type,
          targetId: body.target_id,
          reason: body.reason,
          ...(body.description ? { description: body.description } : {})
        });

        await audit.record({
          actorUserId: request.user!.id,
          action: "report.created",
          targetType: body.target_type,
          targetId: body.target_id
        });

        reply.status(201).send({ data: report });
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("service_unavailable", "امکان ثبت گزارش در حال حاضر وجود ندارد.", 503);
      }
    }
  );

  app.get("/api/v1/me/contents", { preHandler: [requireMobileVerified] }, async (request) => {
    try {
      return { data: await listUserContents(db, request.user!.id), meta: { source: "database" } };
    } catch {
      return { data: [], meta: { source: "unavailable" } };
    }
  });

  app.get("/api/v1/me/analytics", { preHandler: [requireMobileVerified] }, async (request) => ({ data: await getOwnerAnalyticsSummary(db, request.user!.id).catch(() => ({ totals: { views: 0, favorites: 0, contacts: 0 }, listings: [] })) }));
  app.get("/api/v1/me/analytics/preferences", { preHandler: [requireMobileVerified] }, async (request) => ({ data: await getAnalyticsPreferences(db, request.user!.id).catch(() => ({ allow_personalized_events: true })) }));
  app.put<{ Body: { allow_personalized_events?: boolean } }>("/api/v1/me/analytics/preferences", { preHandler: [requireMobileVerified] }, async (request) => {
    if (typeof request.body.allow_personalized_events !== "boolean") throw new AppError("validation_failed", "تنظیم analytics معتبر نیست.", 400);
    return { data: await setAnalyticsPreferences(db, request.user!.id, request.body.allow_personalized_events) };
  });
  app.delete("/api/v1/me/analytics/events", { preHandler: [requireMobileVerified] }, async (request) => ({ data: { deleted_events: await deleteUserAnalyticsEvents(db, request.user!.id) } }));

  app.get("/api/v1/me/support", { preHandler: [requireMobileVerified] }, async (request) => ({
    data: await listSupportTickets(db, request.user!.id)
  }));
  app.post<{ Body: { subject?: string; message?: string } }>("/api/v1/me/support", { preHandler: [requireMobileVerified] }, async (request, reply) => {
    const subject = request.body.subject?.trim() ?? "";
    const message = request.body.message?.trim() ?? "";
    if (!subject || subject.length > 160 || !message || message.length > 4000) {
      throw new AppError("validation_failed", "موضوع و متن پیام پشتیبانی را کامل و کوتاه وارد کن.", 400);
    }
    reply.status(201).send({ data: await createSupportTicket(db, { userId: request.user!.id, subject, message }) });
  });

  app.get("/api/v1/admin/notifications/outbox-summary", { preHandler: [requireRole("moderator")] }, async () => ({ data: await getNotificationOutboxSummary(db) }));

  app.get("/api/v1/admin/users", { preHandler: [requireRole("admin")] }, async () => ({
    data: await db.selectFrom("users")
      .leftJoin("user_profiles", "user_profiles.user_id", "users.id")
      .select([
        "users.id", "users.phone_number", "users.phone_verified_at", "users.status", "users.created_at",
        "user_profiles.display_name", "user_profiles.first_name", "user_profiles.last_name",
        "user_profiles.verification_status", "user_profiles.primary_city_id"
      ]).orderBy("users.created_at", "desc").limit(200).execute()
  }));
  app.get("/api/v1/admin/identity-verifications", { preHandler: [requireRole("admin")] }, async () => ({
    data: await db.selectFrom("identity_verification_requests")
      .innerJoin("users", "users.id", "identity_verification_requests.user_id")
      .leftJoin("user_profiles", "user_profiles.user_id", "users.id")
      .select(["identity_verification_requests.id", "identity_verification_requests.user_id", "identity_verification_requests.document_type", "identity_verification_requests.national_id_last4", "identity_verification_requests.document_mime_type", "identity_verification_requests.status", "identity_verification_requests.rejection_reason", "identity_verification_requests.verification_method", "identity_verification_requests.verified_at", "identity_verification_requests.revoked_at", "identity_verification_requests.reviewed_by", "identity_verification_requests.reviewed_at", "identity_verification_requests.created_at", "users.phone_number", "user_profiles.display_name", "user_profiles.first_name", "user_profiles.last_name"])
      .orderBy("identity_verification_requests.created_at", "desc").limit(200).execute()
  }));

  app.get<{ Params: { id: string } }>("/api/v1/admin/identity-verifications/:id/document", { preHandler: [requireRole("admin")] }, async (request, reply) => {
    const row = await db.selectFrom("identity_verification_requests").select(["document_data", "document_mime_type"]).where("id", "=", request.params.id).executeTakeFirst();
    if (!row) throw new AppError("not_found", "مدرک احراز هویت پیدا نشد.", 404);
    reply.header("cache-control", "no-store").type(row.document_mime_type).send(row.document_data);
  });

  app.post<{ Params: { id: string }; Body: { decision?: "approve" | "reject" | "revoke"; reason?: string } }>("/api/v1/admin/identity-verifications/:id/decision", { preHandler: [requireRole("admin")] }, async (request) => {
    const decision = request.body?.decision;
    if (decision !== "approve" && decision !== "reject" && decision !== "revoke") throw new AppError("validation_failed", "تصمیم احراز هویت معتبر نیست.", 400);
    const status = decision === "approve" ? "verified" : "rejected";
    await db.transaction().execute(async (trx) => {
      const row = await trx.selectFrom("identity_verification_requests").select(["user_id", "status"])
        .where("id", "=", request.params.id).forUpdate().executeTakeFirst();
      if (!row) throw new AppError("not_found", "درخواست احراز هویت پیدا نشد.", 404);
      if (row.status !== (decision === "revoke" ? "verified" : "pending")) {
        throw new AppError("validation_failed", "این تصمیم برای وضعیت فعلی درخواست معتبر نیست.", 409);
      }
      await trx.updateTable("identity_verification_requests")
        .set({ ...identityDecisionFields(decision, new Date(), request.body?.reason), reviewed_by: request.user!.id })
        .where("id", "=", request.params.id).execute();
      await new DatabaseAuditLogger(trx).record({ actorUserId: request.user!.id, action: decision === "revoke" ? "identity_verification.revoked" : "identity_verification.reviewed", targetType: "user", targetId: row.user_id, metadata: { requestId: request.params.id, decision } });
    });
    return { data: { id: request.params.id, status } };
  });

  app.get<{ Params: { userId: string } }>("/api/v1/admin/users/:userId/contents", { preHandler: [requireRole("admin")] }, async (request) => ({
    data: await listUserContents(db, request.params.userId)
  }));
  app.put<{ Params: { userId: string }; Body: { status?: "verified" | "rejected" | "profile_complete" } }>("/api/v1/admin/users/:userId/verification", { preHandler: [requireRole("admin")] }, async (request) => {
    const status = request.body.status;
    if (status !== "verified" && status !== "rejected" && status !== "profile_complete") throw new AppError("validation_failed", "وضعیت احراز هویت معتبر نیست.", 400);
    const profile = await db.transaction().execute(async (trx) => {
      const now = new Date();
      const updated = await trx.updateTable("user_profiles").set({ verification_status: status, updated_at: now })
        .where("user_id", "=", request.params.userId).returningAll().executeTakeFirst();
      if (!updated) throw new AppError("not_found", "پروفایل کاربر پیدا نشد.", 404);
      if (status === "verified" || status === "rejected") {
        const pending = await trx.selectFrom("identity_verification_requests").select("id")
          .where("user_id", "=", request.params.userId).where("status", "=", "pending")
          .orderBy("created_at", "desc").forUpdate().executeTakeFirst();
        if (!pending) throw new AppError("validation_failed", "درخواست احراز هویت در انتظار بررسی وجود ندارد.", 409);
        await trx.updateTable("identity_verification_requests")
          .set({ ...identityDecisionFields(status === "verified" ? "approve" : "reject", now), reviewed_by: request.user!.id })
          .where("id", "=", pending.id).execute();
      }
      await new DatabaseAuditLogger(trx).record({ actorUserId: request.user!.id, action: "user.verification_updated", targetType: "user", targetId: request.params.userId, metadata: { status } });
      return updated;
    });
    return { data: profile };
  });
  app.get("/api/v1/admin/support", { preHandler: [requireRole("moderator")] }, async () => ({ data: await listSupportTickets(db) }));
  app.put<{ Params: { ticketId: string }; Body: { reply?: string; status?: "open" | "in_progress" | "closed" } }>("/api/v1/admin/support/:ticketId", { preHandler: [requireRole("moderator")] }, async (request) => {
    if (!request.body.reply?.trim()) throw new AppError("validation_failed", "پاسخ پشتیبانی را وارد کن.", 400);
    return { data: await replyToSupportTicket(db, { ticketId: request.params.ticketId, reply: request.body.reply, ...(request.body.status ? { status: request.body.status } : {}) }) };
  });

  app.get(
    "/api/v1/admin/moderation/cases",
    { preHandler: [requireRole("moderator")] },
    async () => {
      try {
        return {
          data: await listModerationCases(db),
          page: {
            next_cursor: null,
            has_more: false
          },
          meta: { source: "database" }
        };
      } catch {
        return {
          data: [],
          page: {
            next_cursor: null,
            has_more: false
          },
          meta: { source: "unavailable" }
        };
      }
    }
  );

  app.get(
    "/api/v1/admin/moderation/contents",
    { preHandler: [requireRole("moderator")] },
    async (request) => {
      try {
        return {
          data: await listSubmittedContents(db),
          page: {
            next_cursor: null,
            has_more: false
          },
          meta: { source: "database" }
        };
      } catch (error) {
        request.log.error({ err: error }, "moderation queue unavailable");
        const message = error instanceof Error && /relation .* does not exist|column .* does not exist/i.test(error.message)
          ? "صف بررسی آگهی آماده نیست؛ migrationهای 0021 و 0022 را روی همین دیتابیس اجرا کن و API را restart کن."
          : "صف بررسی آگهی موقتاً در دسترس نیست؛ وضعیت API و اتصال دیتابیس را بررسی کن.";
        throw new AppError("service_unavailable", message, 503);
      }
    }
  );

  app.get<{ Params: { contentId: string } }>("/api/v1/admin/contents/:contentId", { preHandler: [requireRole("moderator")] }, async (request) => {
    const content = await getContentDetail(db, request.params.contentId).catch(() => undefined);
    if (!content) throw new AppError("not_found", "آگهی پیدا نشد.", 404);
    const creator = await db.selectFrom("users").leftJoin("user_profiles", "user_profiles.user_id", "users.id")
      .select(["users.id", "users.phone_number", "users.phone_verified_at", "users.status", "user_profiles.display_name", "user_profiles.first_name", "user_profiles.last_name", "user_profiles.verification_status"])
      .where("users.id", "=", content.owner_user_id).executeTakeFirst();
    return { data: { content, creator: creator ?? null } };
  });
  app.delete<{ Params: { contentId: string } }>("/api/v1/admin/contents/:contentId", { preHandler: [requireRole("admin")] }, async (request) => {
    try {
      const data = await deleteListingByModerator(db, request.params.contentId);
      await audit.record({ actorUserId: request.user!.id, action: "content.deleted_by_admin", targetType: "content", targetId: request.params.contentId });
      return { data };
    } catch { throw new AppError("not_found", "آگهی پیدا نشد یا قبلاً حذف شده است.", 404); }
  });

  app.post<{
    Params: { contentId: string };
    Body: {
      decision: "approve" | "reject";
      reason: string;
    };
  }>(
    "/api/v1/admin/moderation/contents/:contentId/decisions",
    { preHandler: [requireRole("moderator")] },
    async (request, reply) => {
      if (!request.body.decision || !request.body.reason) {
        throw new AppError("validation_failed", "تصمیم بررسی آگهی معتبر نیست.", 400, {
          decision: request.body.decision ? [] : ["تصمیم اجباری است."],
          reason: request.body.reason ? [] : ["دلیل تصمیم اجباری است."]
        });
      }

      try {
        const content = await moderateContent(db, {
          contentId: request.params.contentId,
          actorUserId: request.user!.id,
          decision: request.body.decision,
          reason: request.body.reason
        });

        await audit.record({
          actorUserId: request.user!.id,
          action: "content.moderation_decision",
          targetType: "content",
          targetId: request.params.contentId,
          metadata: { decision: request.body.decision }
        });

        reply.status(201).send({ data: content });
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("service_unavailable", "امکان ثبت تصمیم بررسی آگهی وجود ندارد.", 503);
      }
    }
  );

  app.post<{
    Params: { caseId: string };
    Body: {
      decision: "dismiss_report" | "escalate" | "reject_content";
      reason: string;
    };
  }>(
    "/api/v1/admin/moderation/cases/:caseId/decisions",
    { preHandler: [requireRole("moderator")] },
    async (request, reply) => {
      if (!request.body.decision || !request.body.reason) {
        throw new AppError("validation_failed", "تصمیم moderation معتبر نیست.", 400, {
          decision: request.body.decision ? [] : ["تصمیم اجباری است."],
          reason: request.body.reason ? [] : ["دلیل تصمیم اجباری است."]
        });
      }

      try {
        const decision = await createModerationDecision(db, {
          caseId: request.params.caseId,
          actorUserId: request.user!.id,
          decision: request.body.decision,
          reason: request.body.reason
        });

        await audit.record({
          actorUserId: request.user!.id,
          action: "moderation.decision_created",
          targetType: "moderation_case",
          targetId: request.params.caseId,
          metadata: { decision: request.body.decision }
        });

        reply.status(201).send({ data: decision });
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("service_unavailable", "امکان ثبت تصمیم moderation وجود ندارد.", 503);
      }
    }
  );

  return app;
}

function normalizeIranPhone(value?: string) {
  const input = value?.trim().replace(/\s|-/g, "");
  if (!input) return "";
  if (/^9\d{9}$/.test(input)) return `+98${input}`;
  if (/^09\d{9}$/.test(input)) return `+98${input.slice(1)}`;
  if (/^\+989\d{9}$/.test(input)) return input;
  if (/^989\d{9}$/.test(input)) return `+${input}`;
  return "";
}

function normalizeOtpCode(value?: string) {
  const input = value?.trim()
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  return input && /^\d{6}$/.test(input) ? input : "";
}

function getAdminPhoneNumbers(value: string) {
  return new Set(
    value
      .split(",")
      .map((phone) => normalizeIranPhone(phone))
      .filter(Boolean)
  );
}

function getPasswordLoginKey(ip: string, phoneNumber: string | undefined) {
  return `${ip}:${normalizeIranPhone(phoneNumber ?? "") || (phoneNumber ?? "").trim().toLowerCase() || "unknown"}`;
}

function assertOtpRequestAllowed(buckets: Map<string, { count: number; resetAt: number }>, phoneNumber: string) {
  const current = buckets.get(phoneNumber);
  if (!current || current.resetAt <= Date.now()) {
    buckets.delete(phoneNumber);
    return;
  }
  if (current.count >= OTP_PHONE_MAX_REQUESTS) {
    throw new AppError("rate_limited", "درخواست کد برای این شماره بیش از حد مجاز است.", 429);
  }
}

function recordOtpRequest(buckets: Map<string, { count: number; resetAt: number }>, phoneNumber: string) {
  const now = Date.now();
  const current = buckets.get(phoneNumber);
  if (!current || current.resetAt <= now) {
    buckets.set(phoneNumber, { count: 1, resetAt: now + OTP_PHONE_WINDOW_MS });
    return;
  }
  current.count += 1;
}

function assertPasswordLoginAllowed(buckets: Map<string, { count: number; resetAt: number }>, key: string) {
  const current = buckets.get(key);
  if (!current || current.resetAt <= Date.now()) {
    buckets.delete(key);
    return;
  }
  if (current.count >= PASSWORD_LOGIN_MAX_FAILURES) {
    throw new AppError("rate_limited", "تلاش ورود با رمز برای این شماره زیاد شده است. کمی صبر کن و دوباره تلاش کن.", 429);
  }
}

function recordPasswordLoginFailure(buckets: Map<string, { count: number; resetAt: number }>, key: string) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + PASSWORD_LOGIN_WINDOW_MS });
    return;
  }
  current.count += 1;
}

function clearPasswordLoginFailures(buckets: Map<string, { count: number; resetAt: number }>, key: string) {
  buckets.delete(key);
}

function parseIdentityDocument(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,([a-zA-Z0-9+/=]+)$/.exec(dataUrl.trim());
  if (!match) throw new AppError("validation_failed", "مدرک باید تصویر JPG، PNG، WEBP یا PDF معتبر باشد.", 400);
    const buffer = Buffer.from(match[2]!, "base64");
  if (!buffer.length || buffer.byteLength > 5_000_000) throw new AppError("validation_failed", "حجم مدرک باید حداکثر ۵ مگابایت باشد.", 400);
    return { mimeType: match[1]!, buffer };
}
