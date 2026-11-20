export interface ListingDetailViewModel {
  id: string;
  title: string;
  description: string;
  city_id: string;
  category_id: string;
  owner_user_id?: string;
  status: string;
  price_amount?: number | null;
  price_type?: string | null;
  item_condition?: string | null;
  image_data_url?: string | null;
  content_type?: string;
  created_at?: string;
  storefront_slug?: string | null;
  storefront_name?: string | null;
  view_count?: number;
  metadata_json?: Record<string, string | number> | null;
  media?: Array<{ url: string; mime_type: string; sort_order: number }>;
  service_area?: string | null;
  pricing_model?: string | null;
  availability?: string | null;
  experience_years?: number | null;
}

export interface ListingMetadataField {
  key: string;
  label_fa: string;
  options?: Array<{ value: string; label_fa: string }>;
}

export function toListingDetailViewModel<T extends ListingDetailViewModel>(listing: T): ListingDetailViewModel {
  return listing;
}

export function getListingAttributes(
  listing: Pick<ListingDetailViewModel, "metadata_json">,
  fields: ListingMetadataField[] = []
) {
  return Object.entries(listing.metadata_json ?? {}).map(([key, value]) => {
    const schema = fields.find((field) => field.key === key);
    const option = schema?.options?.find((item) => item.value === String(value));
    return { key, label: schema?.label_fa ?? key.replaceAll("_", " "), value: option?.label_fa ?? String(value) };
  });
}

export function getListingMedia(listing: Pick<ListingDetailViewModel, "image_data_url" | "media">) {
  const assets = (listing.media ?? []).slice().sort((a, b) => a.sort_order - b.sort_order).map((asset) => ({ url: asset.url, mime: asset.mime_type }));
  if (listing.image_data_url && !assets.some((asset) => asset.url === listing.image_data_url)) assets.unshift({ url: listing.image_data_url, mime: "image/*" });
  return assets;
}
