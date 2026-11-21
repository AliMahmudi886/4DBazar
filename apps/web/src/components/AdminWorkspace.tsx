import React from "react";
import { Inbox, RefreshCw, ShieldCheck, Trash2, UserCheck, LifeBuoy, Send } from "lucide-react";

interface City {
  id: string;
  name_fa: string;
}

interface MarketItem {
  id: string;
  title: string;
  description: string;
  city_id: string;
  media?: Array<{ asset_id?: string; url: string; mime_type?: string; media_role?: string; sort_order?: number }>;
}

interface Storefront {
  id: string;
  name: string;
  slug: string;
  city_id: string;
  business_type: string;
  short_description: string;
  status: string;
  owner_user_id: string;
  created_at?: string;
  owner_phone_number?: string | null;
  owner_display_name?: string | null;
  owner_first_name?: string | null;
  owner_last_name?: string | null;
}

interface ModerationCase {
  id: string;
  target_type: string;
  target_id: string;
  priority: string;
  reason: string | null;
  description: string | null;
  target_preview?: string | null;
}

interface AdminWorkspaceProps {
  isModerator: boolean;
  isAdmin: boolean;
  moderationCases: ModerationCase[];
  pendingContents: MarketItem[];
  moderationBusyId: string;
  items: MarketItem[];
  cities: City[];
  refreshData: () => void | Promise<void>;
  refreshAdminUsers: () => void | Promise<void>;
  refreshAdminUserContents: (userId: string) => void | Promise<void>;
  currentRoles: string[];
  refreshModerationCases: () => void | Promise<void>;
  decideModerationCase: (caseId: string, decision: "dismiss_report" | "escalate" | "reject_content") => void | Promise<void>;
  decidePendingContent: (contentId: string, decision: "approve" | "reject") => void | Promise<void>;
  navigateWorkspace: (workspace: "market" | "profile" | "admin") => void;
  adminUsers: any[];
  adminUserContents: any[];
  adminSupport: any[];
  adminStorefronts: Storefront[];
  adminIdentityVerifications: any[];
  updateUserVerification: (userId: string, status: "verified" | "rejected" | "profile_complete") => void | Promise<void>;
  deleteAdminContent: (contentId: string) => void | Promise<void>;
  replyAdminSupport: (ticketId: string, reply: string) => void | Promise<void>;
  getAdminContentDetail: (contentId: string) => Promise<any>;
  refreshAdminStorefronts: () => void | Promise<void>;
  decideAdminStorefront: (storefrontId: string, decision: "approve" | "suspend" | "archive") => void | Promise<void>;
  refreshAdminIdentityVerifications: () => void | Promise<void>;
  decideAdminIdentityVerification: (requestId: string, decision: "approve" | "reject" | "revoke", reason?: string) => void | Promise<void>;
  getAdminIdentityDocument: (requestId: string) => Promise<string>;
  mediaUrl: (value?: string | null) => string;
}

function IdentityVerificationCard({ request, busy, getDocument, decide }: { request: any; busy: boolean; getDocument: (id: string) => Promise<string>; decide: (id: string, decision: "approve" | "reject" | "revoke", reason?: string) => void | Promise<void> }) {
  const [documentUrl, setDocumentUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => () => { if (documentUrl) URL.revokeObjectURL(documentUrl); }, [documentUrl]);
  return <article className="case-card">
    <div className="case-topline"><span className={`priority ${request.status === "pending" ? "normal" : request.status === "verified" ? "low" : "high"}`}>{request.status === "pending" ? "در انتظار بررسی" : request.status === "verified" ? "تأیید شده" : "رد شده"}</span><span>{request.document_type === "national_card" ? "کارت ملی" : request.document_type === "birth_certificate" ? "شناسنامه" : "گذرنامه"}</span></div>
    <strong>{request.display_name || `${request.first_name || ""} ${request.last_name || ""}`.trim() || "کاربر بدون نام"}</strong>
    <p dir="ltr">{request.phone_number} · روش: بررسی دستی {request.verified_at ? `· تأیید: ${new Date(request.verified_at).toLocaleDateString("fa-IR")}` : request.revoked_at ? `· لغو: ${new Date(request.revoked_at).toLocaleDateString("fa-IR")}` : ""} {request.reviewed_by ? `· ادمین: ${request.reviewed_by}` : ""}</p>
    {documentUrl ? (request.document_mime_type === "application/pdf" ? <iframe title="مدرک احراز هویت" src={documentUrl} className="identity-document-preview" /> : <img alt="مدرک احراز هویت" src={documentUrl} className="identity-document-preview" />) : null}
    {request.status === "pending" ? <div className="case-actions">
      <button type="button" className="ghost-button" disabled={loading} onClick={async () => { setLoading(true); try { setDocumentUrl(await getDocument(request.id)); } finally { setLoading(false); } }}>{loading ? "در حال دریافت..." : "مشاهده مدرک"}</button>
      <button type="button" className="contact-button" disabled={busy} onClick={() => void decide(request.id, "approve")}>تایید هویت</button>
      <button type="button" className="ghost-danger" disabled={busy} onClick={() => { const reason = window.prompt("دلیل رد درخواست را وارد کن:", "مدرک واضح یا معتبر نیست."); if (reason !== null) void decide(request.id, "reject", reason); }}>رد درخواست</button>
    </div> : null}
    {request.status === "verified" ? <button type="button" className="ghost-danger" disabled={busy} onClick={() => { if (window.confirm("تأیید هویت این کاربر لغو شود؟")) void decide(request.id, "revoke", "لغو دستی تأیید هویت توسط ادمین."); }}>لغو تأیید هویت</button> : null}
  </article>;
}

export default function AdminWorkspace({
  isModerator,
  isAdmin,
  moderationCases,
  pendingContents,
  moderationBusyId,
  items,
  cities,
  refreshData,
  refreshAdminUsers,
  refreshAdminUserContents,
  currentRoles,
  refreshModerationCases,
  decideModerationCase,
  decidePendingContent,
  navigateWorkspace,
  adminUsers,
  adminUserContents,
  adminSupport,
  adminStorefronts,
  adminIdentityVerifications,
  updateUserVerification,
  deleteAdminContent,
  replyAdminSupport,
  getAdminContentDetail,
  refreshAdminStorefronts,
  decideAdminStorefront,
  refreshAdminIdentityVerifications,
  decideAdminIdentityVerification,
  getAdminIdentityDocument,
  mediaUrl
}: AdminWorkspaceProps) {
    const [userQuery, setUserQuery] = React.useState("");
    const [selectedUserId, setSelectedUserId] = React.useState("");
  const [contentDetail, setContentDetail] = React.useState<any>(null);
  const [detailError, setDetailError] = React.useState("");
    const filteredUsers = adminUsers.filter((user) => `${user.display_name ?? ""} ${user.first_name ?? ""} ${user.last_name ?? ""} ${user.phone_number ?? ""}`.toLocaleLowerCase().includes(userQuery.toLocaleLowerCase()));
  const selectedUser = filteredUsers.find((user) => user.id === selectedUserId) ?? filteredUsers[0];
  React.useEffect(() => { void refreshAdminUserContents(selectedUser?.id ?? ""); }, [selectedUser?.id]);
  React.useEffect(() => {
    if (!contentDetail) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setContentDetail(null); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [contentDetail]);
  if (!isModerator) {
    return (
      <section className="admin-band access-denied" aria-label="دسترسی ادمین">
        <div className="access-panel">
          <ShieldCheck size={34} />
          <div>
            <span className="eyebrow">Admin Boundary</span>
            <h2>برای دیدن صف ادمین نقش moderator لازم است</h2>
            <p>
              API هم این مسیرها را با role واقعی محافظت می‌کند. اگر حساب moderator داری، وارد شو یا نشستت را
              تازه‌سازی کن.
            </p>
          </div>
          <div className="access-actions">
            <button type="button" className="ghost-button" onClick={() => void refreshData()}>
              <RefreshCw size={16} />
              بررسی دوباره
            </button>
            <button type="button" className="submit-button" onClick={() => navigateWorkspace("profile")}>
              <ShieldCheck size={16} />
              ورود
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-band" aria-label="پنل moderation">
      <div className="admin-header">
        <div>
          <span className="eyebrow">
            <Inbox size={16} />
            پنل ادمین
          </span>
          <h2>مرکز بررسی و عملیات</h2>
        </div>
        <button type="button" className="ghost-button" onClick={() => void refreshModerationCases()}>
          <RefreshCw size={16} />
          تازه‌سازی
        </button>
      </div>

      {isAdmin ? <details className="admin-disclosure" open>
        <summary><span><ShieldCheck size={17} /> احراز هویت دستی</span><small>{adminIdentityVerifications.length.toLocaleString("fa-IR")} درخواست در انتظار</small><span className="disclosure-arrow" aria-hidden="true">+</span></summary>
        <div className="admin-disclosure-body">
          <div className="queue-title"><strong>مدارک کاربران برای بررسی</strong><button type="button" className="ghost-button compact-action" onClick={() => void refreshAdminIdentityVerifications()}><RefreshCw size={15} /> تازه‌سازی</button></div>
          {adminIdentityVerifications.length ? <div className="case-grid">{adminIdentityVerifications.map((request: any) => <IdentityVerificationCard key={request.id} request={request} busy={moderationBusyId === request.id} getDocument={getAdminIdentityDocument} decide={decideAdminIdentityVerification} />)}</div> : <div className="empty-state compact"><ShieldCheck size={24} /><h2>درخواست احراز هویت نداریم</h2><p>درخواست‌های ثبت‌شده کاربران پس از ارسال اینجا نمایش داده می‌شوند.</p></div>}
        </div>
      </details> : null}

      <details className="admin-disclosure admin-reports-disclosure">
        <summary><span><Inbox size={17} /> صف‌های بررسی</span><small>{pendingContents.length.toLocaleString("fa-IR")} آگهی · {moderationCases.length.toLocaleString("fa-IR")} گزارش</small><span className="disclosure-arrow" aria-hidden="true">+</span></summary>
        <div className="admin-disclosure-body">
      <div className="admin-columns">
        <div>
          <div className="queue-title">
            <strong>آگهی‌های در انتظار</strong>
            <span>{pendingContents.length.toLocaleString("fa-IR")}</span>
          </div>
          {pendingContents.length ? (
            <div className="case-grid">
              {pendingContents.map((content) => (
                <article className="case-card" key={content.id}>
                  <div className="case-topline">
                    <span className="priority normal">در انتظار بررسی</span>
                    <span>{cities.find((city) => city.id === content.city_id)?.name_fa ?? "4D"}</span>
                  </div>
                  <strong>{content.title}</strong>
                  <p>{content.description}</p>
                  <AdminMediaGallery media={content.media} mediaUrl={mediaUrl} />
                  <button type="button" className="ghost-button compact-action" onClick={async () => { setDetailError(""); try { setContentDetail(await getAdminContentDetail(content.id)); } catch (error) { setDetailError(error instanceof Error ? error.message : "جزئیات آگهی در دسترس نیست."); } }}>مشاهده جزئیات و آگهی‌دهنده</button>
                  <div className="case-actions">
                    <button
                      type="button"
                      className="contact-button"
                      disabled={moderationBusyId === content.id}
                      onClick={() => void decidePendingContent(content.id, "approve")}
                    >
                      تایید
                    </button>
                    {isAdmin ? (
                      <button type="button" className="ghost-danger" disabled={moderationBusyId === content.id} onClick={() => void deleteAdminContent(content.id)}>
                        <Trash2 size={15} /> حذف دائمی
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="ghost-danger"
                      disabled={moderationBusyId === content.id}
                      onClick={() => void decidePendingContent(content.id, "reject")}
                    >
                      رد
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state compact">
              <ShieldCheck size={24} />
              <h2>آگهی pending نداریم</h2>
              <p>آگهی‌های تازه قبل از انتشار اینجا می‌آیند.</p>
            </div>
          )}
        </div>

        <div>
          <div className="queue-title">
            <strong>گزارش‌های باز</strong>
            <span>{moderationCases.length.toLocaleString("fa-IR")}</span>
          </div>
          {moderationCases.length ? (
            <div className="case-grid">
              {moderationCases.map((moderationCase) => (
                <article className="case-card" key={moderationCase.id}>
                  <div className="case-topline">
                    <span className={`priority ${moderationCase.priority}`}>{priorityLabel(moderationCase.priority)}</span>
                    <span>{moderationCase.reason ?? "other"}</span>
                  </div>
                  <strong>
                    {moderationCase.target_type === "message"
                      ? "گزارش پیام چت"
                      : items.find((item) => item.id === moderationCase.target_id)?.title ?? moderationCase.target_id}
                  </strong>
                  <p>{moderationCase.target_preview ?? moderationCase.description ?? "بدون توضیح اضافه"}</p>
                  <div className="case-actions">
                    <button
                      type="button"
                      className="ghost-button"
                      disabled={moderationBusyId === moderationCase.id}
                      onClick={() => void decideModerationCase(moderationCase.id, "dismiss_report")}
                    >
                      بستن
                    </button>
                    <button
                      type="button"
                      className="contact-button"
                      disabled={moderationBusyId === moderationCase.id}
                      onClick={() => void decideModerationCase(moderationCase.id, "escalate")}
                    >
                      ارجاع
                    </button>
                    <button
                      type="button"
                      className="ghost-danger"
                      disabled={moderationBusyId === moderationCase.id}
                      onClick={() => void decideModerationCase(moderationCase.id, "reject_content")}
                    >
                      رد محتوا
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state compact">
              <ShieldCheck size={24} />
              <h2>گزارش باز نداریم</h2>
              <p>وقتی گزارشی ثبت شود، اینجا برای بررسی ادمین دیده می‌شود.</p>
            </div>
          )}
        </div>
      </div>

      </div>
      </details>

      <div className="admin-columns admin-secondary-grid">
        <div>
          <details className="admin-disclosure storefront-admin-disclosure">
            <summary><span><Inbox size={17} /> غرفه‌های در انتظار</span><small>{adminStorefronts.length.toLocaleString("fa-IR")} مورد · برای بررسی باز کن</small><span className="disclosure-arrow" aria-hidden="true">+</span></summary>
            <div className="admin-disclosure-body">
              <div className="queue-toolbar"><span className="field-help">غرفه‌های جدید پس از ثبت، تا تصمیم ادمین در این صف می‌مانند.</span><button type="button" className="ghost-button compact-action" onClick={() => void refreshAdminStorefronts()}><RefreshCw size={14} /> تازه‌سازی</button></div>
              {adminStorefronts.length ? <div className="case-grid storefront-admin-grid">{adminStorefronts.map((storefront) => { const ownerName = storefront.owner_display_name || `${storefront.owner_first_name ?? ""} ${storefront.owner_last_name ?? ""}`.trim() || "کاربر بدون نام"; return <article className="case-card" key={storefront.id}>
                <div className="case-topline"><span className="priority normal">{storefrontStatusLabel(storefront.status)}</span><span>{cities.find((city) => city.id === storefront.city_id)?.name_fa ?? "4D"}</span></div>
                <strong>{storefront.name}</strong><p>{storefront.short_description}</p><small>{storefront.business_type} · مالک: {ownerName}</small><small dir="ltr">{storefront.owner_phone_number ?? storefront.owner_user_id}</small>
                <div className="case-actions"><button type="button" className="contact-button" disabled={moderationBusyId === storefront.id} onClick={() => void decideAdminStorefront(storefront.id, "approve")}>تایید غرفه</button><button type="button" className="ghost-danger" disabled={moderationBusyId === storefront.id} onClick={() => void decideAdminStorefront(storefront.id, "suspend")}>رد / توقف</button></div>
              </article>; })}</div> : <div className="empty-state compact"><ShieldCheck size={22} /><p>غرفه‌ای در انتظار بررسی نیست.</p></div>}
            </div>
          </details>
        </div>
        <div>
          <div className="queue-title"><strong><UserCheck size={17} /> کاربران و احراز هویت</strong><span>{isAdmin ? filteredUsers.length.toLocaleString("fa-IR") : "محدود"}</span></div>
          {isAdmin ? <details className="admin-disclosure"><summary><span>فهرست کاربران</span><small>{filteredUsers.length.toLocaleString("fa-IR")} نتیجه · برای مشاهده باز کن</small><span className="disclosure-arrow" aria-hidden="true">+</span></summary><div className="admin-disclosure-body"><div className="admin-users-toolbar"><input className="admin-search" value={userQuery} onChange={(event) => setUserQuery(event.target.value)} placeholder="جست‌وجوی نام، شماره یا شناسه کاربر" /><button type="button" className="ghost-button compact-action" onClick={() => void refreshAdminUsers()}><RefreshCw size={14} /> تازه‌سازی کاربران</button></div>
          {filteredUsers.length ? <div className="admin-user-picker"><label className="field-label" htmlFor="admin-user-select">انتخاب کاربر</label><select id="admin-user-select" className="admin-user-select" value={selectedUser?.id ?? ""} onChange={(event) => setSelectedUserId(event.target.value)}>{filteredUsers.map((user) => <option value={user.id} key={user.id}>{user.display_name || `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "کاربر بدون نام"} · {user.phone_number}</option>)}</select>{selectedUser ? <article className="admin-user-detail"><div className="admin-user-detail-head"><div><strong>{selectedUser.display_name || `${selectedUser.first_name ?? ""} ${selectedUser.last_name ?? ""}`.trim() || "کاربر بدون نام"}</strong><small dir="ltr">{selectedUser.phone_number}</small></div><span className={`status-chip ${selectedUser.verification_status === "verified" ? "verified" : ""}`}>{verificationLabel(selectedUser.verification_status)}</span></div><div className="admin-user-facts"><span>وضعیت حساب: <b>{accountStatusLabel(selectedUser.status)}</b></span><span>تأیید شماره: <b>{selectedUser.phone_verified_at ? "تأیید شده" : "تأیید نشده"}</b></span><span>عضویت: <b>{new Date(selectedUser.created_at).toLocaleDateString("fa-IR")}</b></span><span dir="ltr">ID: {selectedUser.id}</span></div><div className="case-actions"><button type="button" className="contact-button compact-action" disabled={moderationBusyId === selectedUser.id} onClick={() => void updateUserVerification(selectedUser.id, "verified")}><UserCheck size={14} /> تأیید هویت</button><button type="button" className="ghost-button compact-action" disabled={moderationBusyId === selectedUser.id} onClick={() => void updateUserVerification(selectedUser.id, "profile_complete")}>پروفایل کامل</button></div><div className="admin-user-content-list"><div className="queue-title"><strong>آگهی‌های این کاربر</strong><span>{adminUserContents.length.toLocaleString("fa-IR")} مورد</span></div>{adminUserContents.length ? adminUserContents.map((content) => <div className="admin-user-content" key={content.id}><div><strong>{content.title}</strong><small>{content.description}</small></div><span className="status-chip">{contentStatusLabel(content.status)}</span><button type="button" className="ghost-button compact-action" onClick={async () => { setDetailError(""); try { setContentDetail(await getAdminContentDetail(content.id)); } catch (error) { setDetailError(error instanceof Error ? error.message : "جزئیات آگهی در دسترس نیست."); } }}>جزئیات</button>{content.status === "submitted" ? <><button type="button" className="contact-button compact-action" disabled={moderationBusyId === content.id} onClick={() => void decidePendingContent(content.id, "approve")}>تأیید</button><button type="button" className="ghost-danger compact-action" disabled={moderationBusyId === content.id} onClick={() => void decidePendingContent(content.id, "reject")}>رد</button></> : null}</div>) : <p className="field-help">آگهی فعالی برای این کاربر پیدا نشد.</p>}</div></article> : null}</div> : <div className="empty-state compact"><UserCheck size={22} /><p>کاربری برای نمایش نیست؛ تازه‌سازی را بزن.</p></div>}</div></details> : <p className="admin-permission-note">این فهرست فقط برای نقش <code>admin</code> فعال است. نقش فعلی: {currentRoles.join("، ") || "بدون نقش"}.</p>}
        </div>

        <div>
          <details className="admin-disclosure">
            <summary><span><LifeBuoy size={17} /> پشتیبانی</span><small>{adminSupport.length.toLocaleString("fa-IR")} مورد · برای پاسخ باز کن</small><span className="disclosure-arrow" aria-hidden="true">+</span></summary>
            <div className="admin-disclosure-body">
              {adminSupport.length ? <div className="admin-list">{adminSupport.map((ticket) => <SupportRow key={ticket.id} ticket={ticket} busy={moderationBusyId === ticket.id} onReply={replyAdminSupport} />)}</div> : <div className="empty-state compact"><LifeBuoy size={22} /><p>تیکت باز یا سابقه‌ای وجود ندارد.</p></div>}
            </div>
          </details>
        </div>
      </div>
      {detailError ? <div className="admin-inline-error" role="alert">جزئیات از API دریافت نشد ({detailError}). نسخه API را به آخرین release ارتقا بده.</div> : null}
      {contentDetail ? <div className="admin-detail-scrim" onClick={() => setContentDetail(null)}><article className="admin-detail-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><div className="admin-detail-head"><span className="eyebrow">جزئیات آگهی</span><button type="button" className="icon-button" aria-label="بستن جزئیات" title="بستن" onClick={() => setContentDetail(null)}><span aria-hidden="true">×</span></button></div><h2>{contentDetail.content?.title}</h2><p>{contentDetail.content?.description}</p><AdminMediaGallery media={contentDetail.content?.media} mediaUrl={mediaUrl} large /><div className="admin-creator"><strong>آگهی‌دهنده</strong><span>{contentDetail.creator?.display_name || `${contentDetail.creator?.first_name ?? ""} ${contentDetail.creator?.last_name ?? ""}`.trim() || "بدون نام"}</span><span dir="ltr">{contentDetail.creator?.phone_number ?? "شماره ثبت نشده"}</span><span>وضعیت اعتماد: {contentDetail.creator?.verification_status ?? "pending"}</span><span>رسانه: {(contentDetail.content?.media?.length ?? 0).toLocaleString("fa-IR")}</span></div></article></div> : null}
    </section>
  );
}

function AdminMediaGallery({ media, mediaUrl, large = false }: { media?: Array<{ url: string; mime_type?: string; media_role?: string; sort_order?: number }> | undefined; mediaUrl: (value?: string | null) => string; large?: boolean }) {
  if (!media?.length) return <div className="admin-media-empty">رسانه‌ای برای این آگهی ثبت نشده است.</div>;
  return <div className={large ? "admin-media-grid admin-detail-media-grid" : "admin-media-grid"} aria-label="رسانه‌های آگهی">
    {media.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((asset, index) => {
      const src = mediaUrl(asset.url);
      const isVideo = asset.mime_type?.startsWith("video/") || asset.media_role === "listing_video";
      return isVideo ? <video className="admin-media-thumb" key={`${asset.url}-${index}`} src={src} controls preload="metadata" /> : <img className="admin-media-thumb" key={`${asset.url}-${index}`} src={src} alt={`رسانه آگهی ${index + 1}`} loading="lazy" />;
    })}
  </div>;
}

function supportStatusLabel(status: string) {
  return ({ open: "باز", in_progress: "در حال پیگیری", closed: "بسته‌شده" } as Record<string, string>)[status] ?? status;
}

function supportCode(id: string) {
  return `SUP-${id.replace(/-/g, "").slice(-6).toUpperCase()}`;
}

function supportUserName(ticket: any) {
  return ticket.user_display_name || `${ticket.user_first_name ?? ""} ${ticket.user_last_name ?? ""}`.trim() || "کاربر بدون نام";
}

function verificationLabel(status?: string | null) {
  return ({ verified: "تأییدشده", rejected: "ردشده", profile_complete: "پروفایل کامل", pending: "در انتظار بررسی" } as Record<string, string>)[status ?? "pending"] ?? status ?? "ثبت نشده";
}

function accountStatusLabel(status?: string | null) {
  return ({ active: "فعال", suspended: "تعلیق‌شده", blocked: "مسدود", pending: "در انتظار" } as Record<string, string>)[status ?? ""] ?? status ?? "ثبت نشده";
}

function contentStatusLabel(status?: string | null) {
  return ({ submitted: "در انتظار بررسی", approved: "منتشرشده", rejected: "ردشده", archived: "بایگانی‌شده" } as Record<string, string>)[status ?? ""] ?? status ?? "ثبت نشده";
}

function priorityLabel(priority?: string | null) {
  return ({ high: "مهم", normal: "عادی", low: "کم" } as Record<string, string>)[priority ?? ""] ?? priority ?? "عادی";
}

function storefrontStatusLabel(status?: string | null) {
  return ({ pending_review: "در انتظار بررسی", active: "فعال", suspended: "متوقف‌شده", archived: "بایگانی‌شده" } as Record<string, string>)[status ?? ""] ?? status ?? "ثبت نشده";
}

function SupportRow({ ticket, busy, onReply }: { ticket: any; busy: boolean; onReply: (id: string, reply: string) => void | Promise<void> }) {
  const [reply, setReply] = React.useState("");
  return <article className="admin-list-row support-row">
    <div><strong>{ticket.subject}</strong><small>{ticket.message}</small><small>{supportUserName(ticket)}{ticket.user_phone_number ? ` · ${ticket.user_phone_number}` : ""}</small><small className="field-help" dir="ltr">{supportCode(ticket.id)} · {new Date(ticket.created_at).toLocaleString("fa-IR")}</small></div>
    <span className={`status-chip ${ticket.status === "closed" ? "verified" : ""}`}>{supportStatusLabel(ticket.status)}</span>
    {ticket.status !== "closed" ? <div className="support-reply"><input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="پاسخ کوتاه ادمین" /><button type="button" className="contact-button compact-action" disabled={busy || !reply.trim()} onClick={() => void onReply(ticket.id, reply)}><Send size={14} /> ارسال</button></div> : null}
  </article>;
}
