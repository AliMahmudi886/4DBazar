import { getListingFieldPolicy, type ContentType } from "@four-d/shared";
import { ArrowLeft, CalendarDays, Eye, Heart, MapPin, MessageCircle, Share2, ShieldCheck, Sparkles, Store, Tag, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getListingAttributes, getListingMedia, type ListingDetailViewModel } from "./listingDetailModel.js";
import IdentityBadge from "./IdentityBadge.js";

interface CategoryMetadataField {
  key: string;
  label_fa: string;
  options?: Array<{ value: string; label_fa: string }>;
}

interface ListingDetailPageProps {
  id: string;
  apiBaseUrl: string;
  cities: Array<{ id: string; name_fa: string }>;
  categories: Array<{ id: string; slug?: string; name_fa: string; metadata_schema?: CategoryMetadataField[] }>;
  mediaUrl: (value?: string | null) => string;
  formatPrice: (value?: number | string | null, priceType?: string | null) => string;
  authToken?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void | Promise<void>;
  onStartContact?: (listing: { id: string; title: string; status?: string }) => void | Promise<void>;
}

interface BusinessProfile {
  business_name?: string | null;
  business_type?: string | null;
  bio?: string | null;
  service_area?: string | null;
  opening_hours?: string | null;
  is_public?: boolean;
}

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(date);
}

export default function ListingDetailPage({ id, apiBaseUrl, cities, categories, mediaUrl, formatPrice, authToken, isFavorite = false, onToggleFavorite, onStartContact }: ListingDetailPageProps) {
  const [listing, setListing] = useState<(ListingDetailViewModel & { content_type?: ContentType; owner_user_id: string; related?: ListingDetailViewModel[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeMedia, setActiveMedia] = useState(0);
  const [shared, setShared] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    const headers: Record<string, string> = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;
    fetch(`${apiBaseUrl}/api/v1/contents/${encodeURIComponent(id)}`, { headers })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<{ data: typeof listing extends infer T ? T : never }>;
      })
      .then((body) => { if (!cancelled) setListing(body.data); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [apiBaseUrl, id]);

  useEffect(() => {
    if (!listing?.owner_user_id) return undefined;
    let cancelled = false;
    void fetch(`${apiBaseUrl}/api/v1/business-profiles/${encodeURIComponent(listing.owner_user_id)}`)
      .then((response) => response.json() as Promise<{ data?: BusinessProfile | null }>)
      .then((body) => { if (!cancelled) setBusinessProfile(body.data ?? null); })
      .catch(() => { if (!cancelled) setBusinessProfile(null); });
    return () => { cancelled = true; };
  }, [apiBaseUrl, listing?.owner_user_id]);

  const media = useMemo(() => {
    if (!listing) return [];
    return getListingMedia(listing);
  }, [listing]);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: listing?.title ?? "آگهی 4D", url });
      else { await navigator.clipboard.writeText(url); setShared(true); }
    } catch { /* canceling the native share sheet is not an error */ }
  }

  if (loading) return <section className="listing-page-state"><Sparkles size={28} /><h1>در حال بارگیری آگهی</h1><p>اطلاعات و رسانه‌های آگهی آماده می‌شود.</p></section>;
  if (error || !listing) return <section className="listing-page-state"><Sparkles size={28} /><h1>آگهی پیدا نشد</h1><p>این آگهی حذف شده، هنوز منتشر نشده یا آدرس آن نادرست است.</p><a className="submit-button" href="/">بازگشت به بازار <ArrowLeft size={17} /></a></section>;

  const city = cities.find((item) => item.id === listing.city_id)?.name_fa ?? "منطقه 4D";
  const category = categories.find((item) => item.id === listing.category_id);
  const categoryName = category?.name_fa ?? "دسته‌بندی نشده";
  const fieldPolicy = getListingFieldPolicy(category?.slug, listing.content_type ?? "listing");
  const active = media[Math.min(activeMedia, Math.max(0, media.length - 1))];
  const publishedAt = formatDate(listing.created_at);
  const attributes = getListingAttributes(listing, category?.metadata_schema ?? []);

  return <main className="listing-detail-page" dir="rtl">
    <nav className="listing-detail-topbar" aria-label="مسیر صفحه">
      <a className="listing-detail-back" href="/"><ArrowLeft size={17} /> بازگشت به بازار</a>
      <div className="listing-detail-top-actions">
        <button type="button" className={isFavorite ? "icon-button favorite-active" : "icon-button"} aria-label={isFavorite ? "حذف از ذخیره‌شده‌ها" : "ذخیره آگهی"} aria-pressed={isFavorite} title={isFavorite ? "حذف از ذخیره‌شده‌ها" : "ذخیره آگهی"} onClick={() => void onToggleFavorite?.()}><Heart size={18} fill={isFavorite ? "currentColor" : "none"} /></button>
        <button type="button" className="icon-button" aria-label="اشتراک‌گذاری آگهی" title="اشتراک‌گذاری" onClick={() => void share()}><Share2 size={18} /></button>
      </div>
    </nav>

    <div className="listing-detail-grid">
      <section className="listing-detail-media" aria-label="گالری آگهی">
        <div className="listing-detail-main-media">
          {active?.mime.startsWith("video/") ? <video src={mediaUrl(active.url)} controls preload="metadata" /> : active ? <img src={mediaUrl(active.url)} alt={`${listing.title} - تصویر ${activeMedia + 1}`} /> : <div className="listing-detail-media-empty"><Sparkles size={38} /><strong>تصویری ثبت نشده</strong><span>جزئیات کامل آگهی را در ادامه ببینید.</span></div>}
          {media.length ? <span className={`listing-detail-media-count${media.length === 1 ? " single" : ""}`}>{(activeMedia + 1).toLocaleString("fa-IR")} / {media.length.toLocaleString("fa-IR")}</span> : null}
        </div>
        {media.length > 1 ? <div className="listing-detail-thumbs">{media.map((asset, index) => <button type="button" key={`${asset.url}-${index}`} className={index === activeMedia ? "active" : ""} onClick={() => setActiveMedia(index)} aria-label={`نمایش رسانه ${index + 1}`}>{asset.mime.startsWith("video/") ? <video src={mediaUrl(asset.url)} muted /> : <img src={mediaUrl(asset.url)} alt="" />}</button>)}</div> : null}
      </section>

      <article className="listing-detail-content">
        <header className="listing-detail-heading">
          <div className="listing-detail-heading-row"><p className="listing-detail-eyebrow"><Tag size={15} /> {categoryName}</p><span className={`status ${listing.status}`}>{listing.status === "approved" ? "منتشر شده" : listing.status}</span></div>
          <h1>{listing.title}</h1>
          {fieldPolicy.showPrice ? <strong>{formatPrice(listing.price_amount, listing.price_type)}</strong> : null}
        </header>

        <div className="listing-detail-meta">
          <span><MapPin size={16} /> {city}</span>
          {fieldPolicy.showItemCondition && listing.item_condition ? <span>{listing.item_condition === "new" ? "نو" : listing.item_condition === "like_new" ? "در حد نو" : "کارکرده"}</span> : null}
          <span><Eye size={16} /> {(listing.view_count ?? 0).toLocaleString("fa-IR")} بازدید</span>
          {publishedAt ? <span><CalendarDays size={16} /> {publishedAt}</span> : null}
        </div>

        <section className="listing-detail-description-block"><h2>توضیحات آگهی</h2><p className="listing-detail-description">{listing.description}</p></section>

        {attributes.length ? <section className="listing-attribute-panel"><h2>ویژگی‌های {categoryName}</h2><dl>{attributes.map((attribute) => <div key={attribute.key}><dt>{attribute.label}</dt><dd>{attribute.value}</dd></div>)}</dl></section> : null}

        {listing.content_type === "service_listing" && (listing.service_area || listing.pricing_model || listing.availability || listing.experience_years != null) ? <section className="listing-attribute-panel"><h2>جزئیات خدمت</h2><dl>{listing.service_area ? <div><dt>محدوده خدمت</dt><dd>{listing.service_area}</dd></div> : null}{listing.pricing_model ? <div><dt>مدل قیمت‌گذاری</dt><dd>{listing.pricing_model}</dd></div> : null}{listing.availability ? <div><dt>زمان ارائه</dt><dd>{listing.availability}</dd></div> : null}{listing.experience_years != null ? <div><dt>سابقه</dt><dd>{listing.experience_years.toLocaleString("fa-IR")} سال</dd></div> : null}</dl></section> : null}

        {businessProfile ? <section className="business-seller-card"><UserRound size={20} /><div><strong>{businessProfile.business_name ?? "فروشنده آگهی"}</strong><span>{[businessProfile.business_type, businessProfile.service_area].filter(Boolean).join(" · ")}</span>{businessProfile.opening_hours ? <small>{businessProfile.opening_hours}</small> : <small>اطلاعات عمومی فروشنده</small>}<IdentityBadge verified={(listing as any).seller_trust?.identity_verified} /></div><ShieldCheck size={17} aria-label="پروفایل عمومی" /></section> : <div className="listing-seller-summary"><UserRound size={17} /><span>فروشنده آگهی</span><IdentityBadge verified={(listing as any).seller_trust?.identity_verified} compact /></div>}

        {listing.storefront_slug ? <a className="listing-storefront-link" href={`/storefront/${listing.storefront_slug}`}><span className="listing-storefront-icon"><Store size={19} /></span><span><strong>{listing.storefront_name ?? "غرفه فروشنده"}</strong><small>مشاهده غرفه و سایر آگهی‌ها</small></span><ArrowLeft size={17} /></a> : <div className="listing-trust-note"><ShieldCheck size={19} /><span><strong>گفت‌وگوی امن در 4D</strong><small>برای هماهنگی، از گفت‌وگوی داخل برنامه استفاده کنید.</small></span></div>}

        {listing.related?.length ? <section className="listing-related-panel" aria-label="آگهی‌های مشابه"><h2>شاید این‌ها هم به کارت بیاد</h2><div className="listing-related-grid">{listing.related.map((item) => <a className="listing-related-card" href={`/listing/${item.id}`} key={item.id}><strong>{item.title}</strong><span>{formatPrice(item.price_amount, item.price_type)}</span></a>)}</div></section> : null}
        <div className="listing-detail-sticky-actions"><button type="button" className="submit-button" onClick={() => void onStartContact?.({ id: listing.id, title: listing.title, status: listing.status })}><MessageCircle size={18} /> شروع گفتگو</button><button type="button" className="ghost-button" onClick={() => void share()}><Share2 size={17} /> اشتراک‌گذاری</button></div>
        {shared ? <p className="listing-share-feedback" role="status">لینک آگهی کپی شد.</p> : null}
      </article>
    </div>
  </main>;
}
