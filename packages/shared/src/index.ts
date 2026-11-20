export const FOUR_D_CITIES = ["garmeh", "jajarm", "eivar", "dorq"] as const;

export type FourDCityCode = (typeof FOUR_D_CITIES)[number];

export const CONTENT_TYPES = [
  "listing",
  "wanted",
  "service_listing",
  "service_request"
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export interface ListingFieldPolicy {
  showPrice: boolean;
  showItemCondition: boolean;
  showServiceDetails: boolean;
}

const ITEM_CONDITION_CATEGORY_SLUGS = new Set([
  "general-used-goods",
  "vehicles",
  "mobile-digital",
  "home-kitchen",
  "tools-equipment",
  "personal-fashion",
  "sports-hobbies",
  "business-equipment"
]);

const PRICELESS_CATEGORY_SLUGS = new Set(["jobs", "local-transport"]);

export function getListingFieldPolicy(
  categorySlug?: string | null,
  contentType: ContentType = "listing"
): ListingFieldPolicy {
  const slug = categorySlug?.trim() ?? "";
  return {
    showPrice: !PRICELESS_CATEGORY_SLUGS.has(slug),
    showItemCondition: contentType === "listing" && ITEM_CONDITION_CATEGORY_SLUGS.has(slug),
    showServiceDetails: contentType === "service_listing"
  };
}

export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation_failed"
  | "invalid_phone"
  | "invalid_otp"
  | "invalid_credentials"
  | "captcha_required"
  | "captcha_invalid"
  | "captcha_expired"
  | "conversation_blocked"
  | "rate_limited"
  | "conflict"
  | "content_not_public"
  | "moderation_required"
  | "service_unavailable"
  | "internal_error";

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: Record<string, string[]>;
    request_id: string;
  };
}

export function isFourDCityCode(value: string): value is FourDCityCode {
  return (FOUR_D_CITIES as readonly string[]).includes(value);
}
