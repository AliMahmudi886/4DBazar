import { isIP } from "node:net";
import { z } from "zod";

const configSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    API_HOST: z.string().default("127.0.0.1"),
    API_PORT: z.coerce.number().int().positive().default(4000),
    LOAD_TEST_MODE: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
    CORS_ORIGINS: z.string().default("https://4dbazar.ir,http://127.0.0.1:5173,http://localhost:5173"),
    DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:55432/four_d"),
    SESSION_SECRET: z.string().min(8).default("development-secret"),
    OTP_PROVIDER: z.enum(["stub", "sms"]).default("stub"),
    SMS_VENDOR: z.enum(["generic", "kavenegar"]).default("generic"),
    SMS_API_URL: z.string().optional(),
    SMS_API_IP: z
      .string()
      .refine((value) => isIP(value) !== 0, "SMS_API_IP must be a valid IPv4 or IPv6 address.")
      .optional(),
    SMS_API_KEY: z.string().optional(),
    SMS_SENDER: z.string().optional(),
    SMS_TEMPLATE_ID: z.string().optional(),
    ADMIN_PHONE_NUMBERS: z.string().default(""),
    MEDIA_STORAGE_DIR: z.string().min(1).default("data/media"),
    MEDIA_PUBLIC_PATH: z.string().min(1).default("/media"),
    MEDIA_STORAGE_PROVIDER: z.enum(["local", "s3", "disabled"]).default("local"),
    MEDIA_S3_BUCKET: z.string().optional(),
    MEDIA_S3_REGION: z.string().default("us-east-1"),
    MEDIA_S3_ENDPOINT: z.string().optional(),
    MEDIA_S3_ACCESS_KEY_ID: z.string().optional(),
    MEDIA_S3_SECRET_ACCESS_KEY: z.string().optional(),
    MEDIA_S3_PUBLIC_BASE_URL: z.string().optional(),
    VAPID_PUBLIC_KEY: z.string().optional(),
    VAPID_PRIVATE_KEY: z.string().optional(),
    VAPID_SUBJECT: z.string().default("mailto:admin@4d.local"),
    EXPO_PUSH_API_URL: z.string().url().default("https://exp.host/--/api/v2/push"),
    AI_PROVIDER: z.enum(["local", "avalai", "openai-compatible"]).default("local"),
    AI_API_URL: z.string().default("https://api.avalai.ir/v1"),
    AI_API_KEY: z.string().optional(),
    AVALAI_API_KEY: z.string().optional(),
    AI_MODEL: z.string().default("gpt-5.6-luna"),
    ANALYTICS_RETENTION_DAYS: z.coerce.number().int().positive().default(90)
  })
  .superRefine((value, context) => {
    if (value.LOAD_TEST_MODE && value.NODE_ENV === "production") {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["LOAD_TEST_MODE"], message: "LOAD_TEST_MODE is not allowed in production." });
    }
    if (value.LOAD_TEST_MODE && !["127.0.0.1", "localhost", "::1"].includes(value.API_HOST)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["API_HOST"], message: "LOAD_TEST_MODE is only allowed on a local API host." });
    }
    if (value.NODE_ENV !== "production") return;

    if (value.SESSION_SECRET === "development-secret") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SESSION_SECRET"],
        message: "SESSION_SECRET must be changed in production."
      });
    }

    if (value.OTP_PROVIDER === "stub") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["OTP_PROVIDER"],
        message: "OTP_PROVIDER=stub is not allowed in production."
      });
    }

    if (value.OTP_PROVIDER === "sms" && value.SMS_VENDOR === "generic" && !value.SMS_API_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SMS_API_URL"],
        message: "SMS_API_URL is required when OTP_PROVIDER=sms and SMS_VENDOR=generic in production."
      });
    }

    if (value.OTP_PROVIDER === "sms" && !value.SMS_API_KEY) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SMS_API_KEY"],
        message: "SMS_API_KEY is required when OTP_PROVIDER=sms in production."
      });
    }

    if (value.OTP_PROVIDER === "sms" && value.SMS_VENDOR === "kavenegar" && !value.SMS_SENDER) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SMS_SENDER"],
        message: "SMS_SENDER is required when OTP_PROVIDER=sms and SMS_VENDOR=kavenegar in production."
      });
    }

    if (value.NODE_ENV === "production" && value.MEDIA_STORAGE_PROVIDER === "local") {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["MEDIA_STORAGE_PROVIDER"], message: "Local media storage is not allowed in production." });
    }
    if (value.MEDIA_STORAGE_PROVIDER === "s3") {
      for (const field of ["MEDIA_S3_BUCKET", "MEDIA_S3_ACCESS_KEY_ID", "MEDIA_S3_SECRET_ACCESS_KEY", "MEDIA_S3_PUBLIC_BASE_URL"] as const) {
        if (!value[field]) context.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `${field} is required when MEDIA_STORAGE_PROVIDER=s3.` });
      }
    }
  });

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse(env);
}
