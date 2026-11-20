export interface ListingReviewInput {
  title: string;
  description: string;
  price_amount?: number | null;
  category_name?: string | null;
  image_metadata?: {
    width: number;
    height: number;
    size_bytes: number;
    mime_type: string;
  } | null;
}

export interface ListingReview {
  score: number;
  suggestions: string[];
  improved_title: string;
  improved_description?: string;
  category_suggestion?: string;
  price_hint?: string;
  attribute_suggestions?: string[];
  image_advice?: string[];
  summary: string;
  provider?: "local" | "avalai" | "openai-compatible" | "fallback";
}

export interface ListingAiConfig {
  provider: "local" | "avalai" | "openai-compatible";
  apiUrl: string;
  apiKey: string | undefined;
  model: string;
}

export function reviewListing(input: ListingReviewInput): ListingReview {
  const suggestions: string[] = [];
  const title = input.title.trim();
  const description = input.description.trim();
  if (title.length < 8) suggestions.push("عنوان را دقیق‌تر کن و مدل یا وضعیت کالا را اضافه کن.");
  if (description.length < 40) suggestions.push("توضیح را کامل‌تر کن؛ وضعیت، محل تحویل و نکته مهم کالا را بنویس.");
  if (!input.price_amount && input.category_name !== "خدمات محلی") suggestions.push("اگر قیمت قطعی است مبلغ را وارد کن؛ آگهی‌های شفاف اعتماد بیشتری می‌سازند.");
  const score = Math.max(35, Math.min(98, 100 - suggestions.length * 18 - (title.length < 12 ? 8 : 0)));
  return { score, suggestions, improved_title: title || "آگهی جدید 4D", summary: suggestions.length ? "چند پیشنهاد برای آگهی بهتر داری." : "آگهی برای انتشار اولیه آماده است." };
}

function withListingFields(review: ListingReview, input: ListingReviewInput): ListingReview {
  const imageAdvice = input.image_metadata
    ? [
        ...(input.image_metadata.width < 900 || input.image_metadata.height < 700 ? ["برای نمایش بهتر، عکس با ابعاد بزرگ‌تر انتخاب کن."] : []),
        ...(input.image_metadata.size_bytes > 1_200_000 ? ["عکس فشرده شده اما بهتر است نسخه کم‌حجم‌تر استفاده شود."] : []),
        ...(input.image_metadata.width / Math.max(input.image_metadata.height, 1) < 0.65 ? ["کادر عمودی است؛ سوژه اصلی را وسط کادر نگه دار."] : [])
      ]
    : ["برای اعتماد بیشتر، حداقل یک عکس واضح از خود کالا اضافه کن."];
  return {
    ...review,
    improved_description: review.improved_description ?? input.description.trim(),
    category_suggestion: review.category_suggestion ?? input.category_name ?? "دسته‌بندی را انتخاب کن",
    price_hint: review.price_hint ?? (input.price_amount ? "قیمت واردشده آماده بررسی است." : "قیمت یا حالت توافقی را مشخص کن."),
    attribute_suggestions: review.attribute_suggestions ?? ["برند", "مدل", "وضعیت کالا"],
    image_advice: review.image_advice ?? imageAdvice
  };
}

function extractResponseText(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const value = body as Record<string, unknown>;
  if (typeof value.output_text === "string") return value.output_text;

  if (Array.isArray(value.output)) {
    for (const item of value.output) {
      if (!item || typeof item !== "object") continue;
      const content = (item as Record<string, unknown>).content;
      if (!Array.isArray(content)) continue;
      for (const part of content) {
        if (!part || typeof part !== "object") continue;
        const text = (part as Record<string, unknown>).text;
        if (typeof text === "string") return text;
      }
    }
  }

  const choices = value.choices;
  if (Array.isArray(choices) && choices[0] && typeof choices[0] === "object") {
    const message = (choices[0] as Record<string, unknown>).message;
    if (message && typeof message === "object") {
      const content = (message as Record<string, unknown>).content;
      if (typeof content === "string") return content;
    }
  }
  return "";
}

export function parseListingReview(text: string, fallback: ListingReview): ListingReview {
  const normalized = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const start = normalized.indexOf("{");
  const end = normalized.lastIndexOf("}");
  if (start < 0 || end <= start) return fallback;

  try {
    const value = JSON.parse(normalized.slice(start, end + 1)) as Record<string, unknown>;
    const suggestions = Array.isArray(value.suggestions)
      ? value.suggestions.filter((item): item is string => typeof item === "string").slice(0, 6)
      : fallback.suggestions;
    return {
      score: typeof value.score === "number" ? Math.max(0, Math.min(100, Math.round(value.score))) : fallback.score,
      suggestions,
      improved_title: typeof value.improved_title === "string" && value.improved_title.trim() ? value.improved_title.trim() : fallback.improved_title,
      ...(typeof value.improved_description === "string" && value.improved_description.trim() ? { improved_description: value.improved_description.trim() } : {}),
      ...(typeof value.category_suggestion === "string" && value.category_suggestion.trim() ? { category_suggestion: value.category_suggestion.trim() } : {}),
      ...(typeof value.price_hint === "string" && value.price_hint.trim() ? { price_hint: value.price_hint.trim() } : {}),
      ...(Array.isArray(value.attribute_suggestions) ? { attribute_suggestions: value.attribute_suggestions.filter((item): item is string => typeof item === "string").slice(0, 8) } : {}),
      ...(Array.isArray(value.image_advice) ? { image_advice: value.image_advice.filter((item): item is string => typeof item === "string").slice(0, 6) } : {}),
      summary: typeof value.summary === "string" && value.summary.trim() ? value.summary.trim() : fallback.summary
    };
  } catch {
    return fallback;
  }
}

export async function reviewListingWithAi(config: ListingAiConfig, input: ListingReviewInput): Promise<ListingReview> {
  const fallback = withListingFields(reviewListing(input), input);
  if (config.provider === "local" || !config.apiKey) return { ...fallback, provider: "local" };

  const prompt = [
    "You are a careful Persian marketplace listing assistant for a local classifieds app.",
    "Review the listing and return JSON only, with exactly these fields:",
    '{"score": number 0-100, "suggestions": string[], "improved_title": string, "improved_description": string, "category_suggestion": string, "price_hint": string, "attribute_suggestions": string[], "image_advice": string[], "summary": string}',
    "Write all values in Persian. Suggest improvements only; never claim to verify identity, safety, price, or ownership.",
    `Listing: ${JSON.stringify(input)}`
  ].join("\n");

  try {
    const response = await fetch(`${config.apiUrl.replace(/\/$/, "")}/responses`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ model: config.model, input: prompt })
    });
    if (!response.ok) return { ...fallback, provider: "fallback" };
    const parsed = parseListingReview(extractResponseText(await response.json()), fallback);
    return { ...parsed, provider: config.provider };
  } catch {
    return { ...fallback, provider: "fallback" };
  }
}
