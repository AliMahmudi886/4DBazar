import { sitePath } from "../sitePath.js";
import { useState } from "react";
import { ArrowLeft, CalendarDays, Eye, MapPin, Phone, Store } from "lucide-react";
import IdentityBadge from "./IdentityBadge.js";

interface StorefrontPublicPageProps {
  data: { storefront: any; listings: any[] } | null;
  cities: Array<{ id: string; name_fa: string }>;
  categories: Array<{ id: string; name_fa: string }>;
  mediaUrl: (value?: string | null) => string;
  formatPrice: (value?: number | string | null, priceType?: string | null) => string;
}

export default function StorefrontPublicPage({ data, cities, categories, mediaUrl, formatPrice }: StorefrontPublicPageProps) {
  const [activeImages, setActiveImages] = useState<Record<string, number>>({});
  if (!data) {
    return <section className="storefront-public empty-state"><Store size={30} /><h1>غرفه پیدا نشد</h1><p>این غرفه وجود ندارد، هنوز فعال نشده یا آدرس آن تغییر کرده است.</p><a className="submit-button" href={sitePath("/")}>بازگشت به بازار <ArrowLeft size={17} /></a></section>;
  }
  const { storefront, listings } = data;
  const city = cities.find((item) => item.id === storefront.city_id)?.name_fa ?? "منطقه 4D";
  const category = categories.find((item) => item.id === storefront.category_id)?.name_fa ?? "فعالیت محلی";
  return (
    <section className="storefront-public" aria-label={`غرفه ${storefront.name}`}>
      <div className="storefront-public-hero">
        <div className="storefront-public-icon"><Store size={32} /></div>
        <div><span className="eyebrow">{storefront.status === "active" ? "غرفه تأییدشده 4D" : "غرفه"}</span><h1>{storefront.name}</h1><p>{storefront.short_description}</p><div className="storefront-public-meta"><span><MapPin size={15} /> {city}</span><span>{category}</span><span>{storefront.business_type}</span></div><IdentityBadge verified={storefront.owner_trust?.identity_verified} /></div>
        <a className="ghost-button" href={sitePath("/")}><ArrowLeft size={16} /> بازار</a>
      </div>
      <div className="storefront-public-layout">
        <article className="storefront-public-about"><span className="eyebrow">درباره این غرفه</span><h2>معرفی</h2><p>{storefront.description}</p>{storefront.address ? <p><MapPin size={16} /> {storefront.address}</p> : null}{storefront.phone ? <a className="contact-button" href={`tel:${storefront.phone}`}><Phone size={16} /> تماس با غرفه</a> : null}</article>
        <section><div className="storefront-listing-heading"><div><span className="eyebrow">محصولات و خدمات</span><h2>{listings.length.toLocaleString("fa-IR")} مورد منتشرشده</h2></div></div>{listings.length ? <div className="storefront-listing-grid">{listings.map((listing) => { const media = [...(listing.media ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order).map((item: any) => item.url); if (listing.image_data_url && !media.includes(listing.image_data_url)) media.unshift(listing.image_data_url); const active = Math.min(activeImages[listing.id] ?? 0, Math.max(0, media.length - 1)); return <article className="storefront-listing-card" key={listing.id}>{media[active] ? <img src={mediaUrl(media[active])} alt={listing.title} loading="lazy" /> : <div className="storefront-listing-placeholder"><Store size={24} /></div>}{media.length > 1 ? <div className="storefront-card-thumbs">{media.map((url: string, index: number) => <button type="button" key={url} className={index === active ? "active" : ""} onClick={() => setActiveImages((current) => ({ ...current, [listing.id]: index }))} aria-label={`نمایش تصویر ${index + 1}`}><img src={mediaUrl(url)} alt="" /></button>)}</div> : null}<div><h3>{listing.title}</h3><p>{listing.description}</p><strong>{formatPrice(listing.price_amount, listing.price_type)}</strong><div className="storefront-card-meta"><span><Eye size={14} /> {(listing.view_count ?? 0).toLocaleString("fa-IR")} بازدید</span><span><CalendarDays size={14} /> {listing.created_at ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(listing.created_at)) : ""}</span></div><a className="ghost-button storefront-detail-link" href={sitePath(`/listing/${listing.id}`)}><span>مشاهده جزئیات</span><ArrowLeft size={16} /></a></div></article>; })}</div> : <div className="empty-state compact"><Store size={24} /><p>آگهی دیگری در این غرفه وجود ندارد.</p></div>}</section>
      </div>
    </section>
  );
}
