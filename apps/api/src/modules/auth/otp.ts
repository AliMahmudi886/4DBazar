import { request as httpsRequest } from "node:https";
import { AppError } from "../../errors.js";

export interface OtpConfig {
  provider: "stub" | "sms";
  requirePersistentStore?: boolean;
  smsVendor?: "generic" | "kavenegar";
  smsApiUrl?: string;
  smsApiIp?: string;
  smsApiKey?: string;
  smsSender?: string;
  smsTemplateId?: string;
}

export interface OtpChallengeStore {
  save(phoneNumber: string, code: string, expiresAt: Date, maxAttempts: number): Promise<void>;
  verify(phoneNumber: string, code: string): Promise<boolean>;
}

interface InMemoryOtpChallenge {
  code: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

export class OtpService {
  private readonly fallbackStore = new InMemoryOtpChallengeStore();

  constructor(
    private readonly config: OtpConfig,
    private readonly store?: OtpChallengeStore
  ) {}

  async request(phoneNumber: string) {
    const code = this.config.provider === "stub" ? "123456" : createOtpCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await this.saveChallenge(phoneNumber, code, expiresAt);

    if (this.config.provider === "sms") {
      await sendSmsCode(this.config, phoneNumber, code);
    }

    return {
      delivery: this.config.provider,
      expires_in_seconds: Math.floor(OTP_TTL_MS / 1000),
      dev_code: this.config.provider === "stub" ? code : undefined
    };
  }

  async verify(phoneNumber: string, code: string) {
    try {
      if (this.store && (await this.store.verify(phoneNumber, code))) return true;
      if (this.store) return false;
    } catch {
      if (this.config.requirePersistentStore) {
        throw new AppError("service_unavailable", "امکان بررسی کد تایید در حال حاضر وجود ندارد.", 503);
      }
      return this.fallbackStore.verify(phoneNumber, code);
    }

    return this.fallbackStore.verify(phoneNumber, code);
  }

  private async saveChallenge(phoneNumber: string, code: string, expiresAt: Date) {
    try {
      if (this.store) {
        await this.store.save(phoneNumber, code, expiresAt, MAX_VERIFY_ATTEMPTS);
        return;
      }
    } catch {
      if (this.config.requirePersistentStore) {
        throw new AppError("service_unavailable", "امکان ذخیره کد تایید در حال حاضر وجود ندارد.", 503);
      }
      // Development fallback keeps local OTP usable if migrations are not applied yet.
    }

    await this.fallbackStore.save(phoneNumber, code, expiresAt, MAX_VERIFY_ATTEMPTS);
  }
}

class InMemoryOtpChallengeStore implements OtpChallengeStore {
  private readonly challenges = new Map<string, InMemoryOtpChallenge>();

  async save(phoneNumber: string, code: string, expiresAt: Date, maxAttempts: number) {
    this.challenges.set(phoneNumber, {
      code,
      expiresAt,
      attempts: 0,
      maxAttempts
    });
  }

  async verify(phoneNumber: string, code: string) {
    const challenge = this.challenges.get(phoneNumber);
    if (!challenge || challenge.expiresAt.getTime() < Date.now()) {
      this.challenges.delete(phoneNumber);
      return false;
    }

    if (challenge.attempts >= challenge.maxAttempts) return false;
    challenge.attempts += 1;

    if (challenge.code !== code) return false;

    this.challenges.delete(phoneNumber);
    return true;
  }
}

function createOtpCode() {
  return crypto.getRandomValues(new Uint32Array(1))[0]!.toString().padStart(6, "0").slice(-6);
}

async function sendSmsCode(config: OtpConfig, phoneNumber: string, code: string) {
  if (!config.smsApiUrl || !config.smsApiKey) {
    if (config.smsVendor === "kavenegar" && config.smsApiKey) {
      await sendKavenegarCode(config, phoneNumber, code);
    }
    return;
  }

  if (config.smsVendor === "kavenegar") {
    await sendKavenegarCode(config, phoneNumber, code);
    return;
  }

  const message = `کد تایید 4D: ${code}`;
  const response = await fetch(config.smsApiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.smsApiKey}`,
      "x-api-key": config.smsApiKey
    },
    body: JSON.stringify({
      to: phoneNumber,
      message,
      sender: config.smsSender,
      template_id: config.smsTemplateId,
      parameters: {
        code
      }
    })
  });

  if (!response.ok) {
    throw new AppError("service_unavailable", "ارسال پیامک تایید در حال حاضر انجام نشد.", 503);
  }
}

async function sendKavenegarCode(config: OtpConfig, phoneNumber: string, code: string) {
  if (!config.smsApiKey) return;

  const endpoint =
    config.smsApiUrl ?? `https://api.kavenegar.com/v1/${encodeURIComponent(config.smsApiKey)}/sms/send.json`;
  const body = new URLSearchParams({
    receptor: toIranLocalPhone(phoneNumber),
    sender: config.smsSender ?? "",
    message: `کد تایید 4D: ${code}`
  });

  let response: Response;
  try {
    response = config.smsApiIp
      ? await postFormToResolvedIp(endpoint, body, config.smsApiIp)
      : await fetch(endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          },
          body
        });
  } catch (error) {
    console.error("Kavenegar SMS network request failed", getSafeNetworkError(error));
    throw new AppError("service_unavailable", "اتصال به سرویس پیامک کاوه‌نگار برقرار نشد.", 503);
  }

  const payload = await readKavenegarResponse(response);
  const providerStatus = payload?.return?.status;

  if (!response.ok || providerStatus !== 200) {
    console.error("Kavenegar SMS request rejected", {
      httpStatus: response.status,
      providerStatus: providerStatus ?? null,
      providerMessage: payload?.return?.message?.slice(0, 200) ?? null
    });
    const statusSuffix = providerStatus ? ` (کد ${providerStatus})` : "";
    throw new AppError("service_unavailable", `کاوه‌نگار ارسال پیامک را نپذیرفت${statusSuffix}.`, 503);
  }

  const entry = Array.isArray(payload?.entries) ? payload.entries[0] : undefined;
  if (!entry?.messageid) {
    console.error("Kavenegar SMS response did not include a message id", {
      httpStatus: response.status,
      providerStatus
    });
    throw new AppError("service_unavailable", "پاسخ ارسال پیامک از کاوه‌نگار کامل نبود.", 503);
  }

  console.info("Kavenegar SMS accepted", {
    messageId: entry.messageid,
    messageStatus: entry.status ?? null,
    statusText: entry.statustext?.slice(0, 200) ?? null
  });
}

function postFormToResolvedIp(endpoint: string, body: URLSearchParams, resolvedIp: string): Promise<Response> {
  const url = new URL(endpoint);
  if (url.protocol !== "https:") {
    return Promise.reject(new Error("SMS_API_IP requires an HTTPS SMS endpoint."));
  }

  const bodyText = body.toString();
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      {
        protocol: "https:",
        hostname: resolvedIp,
        port: url.port || 443,
        method: "POST",
        path: `${url.pathname}${url.search}`,
        servername: url.hostname,
        headers: {
          host: url.host,
          "content-type": "application/x-www-form-urlencoded",
          "content-length": Buffer.byteLength(bodyText)
        }
      },
      (providerResponse) => {
        const chunks: Buffer[] = [];
        providerResponse.on("data", (chunk: Buffer | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        providerResponse.on("end", () => {
          resolve(
            new Response(Buffer.concat(chunks).toString("utf8"), {
              status: providerResponse.statusCode ?? 502,
              headers: {
                "content-type": providerResponse.headers["content-type"] ?? "application/json"
              }
            })
          );
        });
      }
    );

    request.setTimeout(15_000, () => request.destroy(new Error("Kavenegar SMS request timed out.")));
    request.on("error", reject);
    request.end(bodyText);
  });
}

interface KavenegarSendResponse {
  return?: {
    status?: number;
    message?: string;
  };
  entries?: Array<{
    messageid?: number;
    status?: number;
    statustext?: string;
  }>;
}

async function readKavenegarResponse(response: Response): Promise<KavenegarSendResponse | undefined> {
  try {
    return (await response.json()) as KavenegarSendResponse;
  } catch {
    return undefined;
  }
}

function getSafeNetworkError(error: unknown) {
  const cause = error instanceof Error && "cause" in error ? error.cause : undefined;
  return {
    message: error instanceof Error ? error.message.slice(0, 200) : "unknown network error",
    causeCode:
      cause && typeof cause === "object" && "code" in cause && typeof cause.code === "string"
        ? cause.code.slice(0, 80)
        : null,
    causeMessage: cause instanceof Error ? cause.message.slice(0, 200) : null
  };
}

function toIranLocalPhone(phoneNumber: string) {
  return phoneNumber.startsWith("+98") ? `0${phoneNumber.slice(3)}` : phoneNumber;
}
