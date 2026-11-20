export type CategoryMetadataField = {
  key: string;
  label_fa: string;
  type: "text" | "number" | "select";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label_fa: string }>;
};

export function parseMetadataSchema(value: unknown): CategoryMetadataField[] {
  if (!Array.isArray(value)) return [];
  return value.filter((field): field is CategoryMetadataField => {
    if (!field || typeof field !== "object") return false;
    const item = field as Record<string, unknown>;
    return typeof item.key === "string" && /^[a-z][a-z0-9_]{1,48}$/.test(item.key)
      && typeof item.label_fa === "string"
      && (item.type === "text" || item.type === "number" || item.type === "select");
  }).slice(0, 12);
}

export function validateCategoryMetadata(value: unknown, schemaValue: unknown) {
  const schema = parseMetadataSchema(schemaValue);
  if (value === undefined || value === null) return { metadata: {}, errors: [] as string[] };
  if (!value || typeof value !== "object" || Array.isArray(value)) return { metadata: {}, errors: ["ویژگی‌های اختصاصی دسته معتبر نیست."] };
  const input = value as Record<string, unknown>;
  const metadata: Record<string, string | number> = {};
  const errors: string[] = [];
  for (const field of schema) {
    const raw = input[field.key];
    const empty = raw === undefined || raw === null || String(raw).trim() === "";
    if (empty) {
      if (field.required) errors.push(`${field.label_fa} اجباری است.`);
      continue;
    }
    if (field.type === "number") {
      const numeric = typeof raw === "number" ? raw : Number(String(raw).replace(/,/g, ""));
      if (!Number.isFinite(numeric)) { errors.push(`${field.label_fa} باید عدد باشد.`); continue; }
      metadata[field.key] = numeric;
    } else {
      const text = String(raw).trim();
      if (field.type === "select" && !field.options?.some((option) => option.value === text)) {
        errors.push(`${field.label_fa} انتخاب معتبری ندارد.`); continue;
      }
      metadata[field.key] = text;
    }
  }
  return { metadata, errors };
}
