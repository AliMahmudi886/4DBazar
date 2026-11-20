import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Ban, Bell, BellOff, ClipboardList, Headphones, MessageCircle, Plus, Puzzle, RefreshCw, Send, ShieldCheck, Store, UserRound, Wifi, X } from "lucide-react";
import IdentityBadge from "./IdentityBadge.js";

interface WorkspaceProps {
  cities: Array<{ id: string; name_fa: string }>;
  myItems: Array<{ id: string; title: string; status: string; description?: string; city_id?: string; category_id?: string; item_condition?: string | null; image_data_url?: string | null; price_amount?: number | null; price_type?: string | null }>;
  conversations: Array<{ id: string; content_title: string; unread_count?: number; is_muted?: boolean; is_blocked?: boolean; last_message_at?: string | null; updated_at: string }>;
  pushSubscriptionCount: number;
  pushTestBusy: boolean;
  sendPushTest: () => void | Promise<void>;
  [key: string]: any;
}

function maskPhone(phone?: string | null) {
  if (!phone) return "ثبت نشده";
  const normalized = phone.replace(/\s+/g, "");
  return normalized.length > 7 ? `${normalized.slice(0, 4)}•••${normalized.slice(-3)}` : normalized;
}

function accountStatusLabel(status?: string | null) {
  return ({ active: "فعال", limited: "محدود", suspended: "تعلیق‌شده", blocked: "مسدود" } as Record<string, string>)[status ?? ""] ?? "فعال";
}

export default function ProfileWorkspace(props: WorkspaceProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportBusy, setSupportBusy] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [identityRequest, setIdentityRequest] = useState<any>(null);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [identityBusy, setIdentityBusy] = useState(false);
  const [identityError, setIdentityError] = useState("");
  const [identityDocument, setIdentityDocument] = useState("");
  const [identityDocumentType, setIdentityDocumentType] = useState("national_card");
  const [editingStorefront, setEditingStorefront] = useState(!props.myStorefront);
  useEffect(() => {
    if (props.myStorefront) setEditingStorefront(false);
  }, [props.myStorefront]);
  useEffect(() => {
    if (!supportOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSupportOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [supportOpen]);
  useEffect(() => {
    if (!props.authToken) return;
    void fetch(`${props.apiBaseUrl ?? ""}/api/v1/me/identity-verification`, { headers: props.getAuthHeaders?.(props.authToken, { json: false }) })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => setIdentityRequest(result?.data ?? null))
      .catch(() => undefined);
  }, [props.authToken, props.apiBaseUrl]);
  const {
    authToken, authMode, authStep, authPhone, authPassword, authOtp, authBusy, captchaClassName, captchaSceneStyle, captchaSolved, captchaClose,
    currentUser, profileComplete, profileForm, profileSaving, cities, myItems, deletingListingId, conversations, unreadConversationCount, notificationPermission, pushBusy, pushSubscriptionCount, pushTestBusy, sendPushTest, mySupport = [],
    captchaBoardRef, setAuthMode, setAuthPhone, setAuthPassword, setAuthOtp, requestOtp, verifyOtp, passwordLogin, startCaptchaDrag, moveCaptchaDrag, endCaptchaDrag, resetCaptcha,
    saveProfile, setProfileForm, openItem, editMyListing, deleteMyListing, enableBrowserNotifications, syncPushSubscription, openConversation, navigateWorkspace, getStatusLabel, formatPrice, getConversationPreview, formatCompactDate
  } = props;

  return (
  <section className="profile-band" aria-label="حساب کاربری">
    {!authToken ? (
      <div className="login-panel">
        <div className="login-copy">
          <span className="eyebrow">
            <ShieldCheck size={16} />
            ورود راحت، ثبت‌نام امن
          </span>
          <h1>اگر رمز داری سریع وارد شو؛ اگر نه با پیامک ثبت‌نام کن</h1>
          <p>SMS فقط برای ثبت‌نام، فراموشی رمز یا تایید دوباره شماره لازم است. بعدش ورود با رمز انجام می‌شود.</p>
        </div>
        <form className="login-form" onSubmit={(event) => (authMode === "password" ? void passwordLogin(event) : authStep === "phone" ? void requestOtp(event) : void verifyOtp(event))}>
          <div className="auth-switch" role="tablist" aria-label="روش ورود">
            <button type="button" role="tab" aria-selected={authMode === "password"} className={authMode === "password" ? "active" : ""} onClick={() => setAuthMode("password")}>
              ورود با رمز
            </button>
            <button type="button" role="tab" aria-selected={authMode === "sms"} className={authMode === "sms" ? "active" : ""} onClick={() => setAuthMode("sms")}>
              ثبت‌نام / فراموشی رمز
            </button>
          </div>
          <label>
            شماره موبایل
            <input
              aria-label="شماره موبایل"
              dir="ltr"
              inputMode="tel"
              value={authPhone}
              onChange={(event) => setAuthPhone(event.target.value)}
              placeholder="09xxxxxxxxx"
            />
          </label>
          {authMode === "password" ? (
            <label>
              رمز عبور
              <input
                aria-label="رمز عبور"
                dir="ltr"
                type="password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                placeholder="حداقل ۸ کاراکتر"
              />
            </label>
          ) : null}
          {authMode === "sms" && authStep === "phone" ? (
            <div className={captchaClassName} style={captchaSceneStyle} aria-label="پازل ضد ربات">
              <div className="puzzle-head">
                <span>
                  <Puzzle size={17} />
                  پازل ضد ربات
                </span>
                <b>{captchaSolved ? "حل شد" : captchaClose ? "تقریباً رسیدی" : "قطعه را به نشان روشن برسان"}</b>
              </div>
              <div
                className="puzzle-board"
                ref={captchaBoardRef}
                onPointerDown={startCaptchaDrag}
                onPointerMove={moveCaptchaDrag}
                onPointerUp={endCaptchaDrag}
                onPointerCancel={endCaptchaDrag}
              >
                <span className="puzzle-aurora" />
                <span className="puzzle-grid" />
                <span className="puzzle-sky" />
                <span className="puzzle-hills" />
                <span className="puzzle-sun" />
                <span className="puzzle-target-ring" />
                <span className="puzzle-cutout" />
                <span className="puzzle-scan" />
                <span className="puzzle-piece">
                  <Puzzle size={18} />
                </span>
                <span className="puzzle-success-burst" />
              </div>
              <div
                className="puzzle-track"
                onPointerDown={startCaptchaDrag}
                onPointerMove={moveCaptchaDrag}
                onPointerUp={endCaptchaDrag}
                onPointerCancel={endCaptchaDrag}
              >
                <span className="puzzle-track-fill" />
                <span className="puzzle-track-mark" />
                <span className="puzzle-handle">
                  <Puzzle size={16} />
                </span>
              </div>
              <div className="puzzle-caption">
                <span>{captchaSolved ? "انسان تایید شد" : captchaClose ? "کمی دقیق‌تر؛ همان حوالی است" : "برای گرفتن کد، قطعه را دقیق روی قاب بگذار"}</span>
                <button type="button" onClick={resetCaptcha} aria-label="پازل تازه">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
          ) : null}
          {authMode === "sms" && authStep === "otp" ? (
            <label>
              کد پیامک‌شده
              <input
                aria-label="کد پیامک‌شده"
                dir="ltr"
                inputMode="numeric"
                value={authOtp}
                onChange={(event) => setAuthOtp(event.target.value)}
                placeholder="123456"
              />
            </label>
          ) : null}
          <button type="submit" className="submit-button" disabled={authBusy || (authMode === "sms" && authStep === "phone" && !captchaSolved)}>
            <Send size={18} />
            {authBusy ? "در حال انجام" : authMode === "password" ? "ورود" : authStep === "phone" ? "ارسال کد" : "تایید و ورود"}
          </button>
          {authMode === "sms" && authStep === "otp" ? (
            <button type="button" className="ghost-button" onClick={() => void requestOtp()} disabled={authBusy}>
              ارسال دوباره کد
            </button>
          ) : null}
        </form>
      </div>
    ) : (
      <div className="profile-grid">
        <div className="profile-card">
          <UserRound size={30} />
          <div>
            <span className="eyebrow">وضعیت حساب</span>
            <h1>{profileForm.first_name || profileForm.last_name ? `${profileForm.first_name ?? ""} ${profileForm.last_name ?? ""}`.trim() : "حساب من"}</h1>
            <div className="profile-account-facts">
              <span><b>شماره موبایل</b><strong dir="ltr">{maskPhone(currentUser?.phone_number)}</strong></span>
              <span><b>شهر اصلی</b><strong>{cities.find((city: any) => city.id === profileForm.primary_city_id)?.name_fa ?? "ثبت نشده"}</strong></span>
              <span><b>وضعیت حساب</b><strong>{accountStatusLabel(currentUser?.account_status)}</strong></span>
              <span><b>عضویت</b><strong>{currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString("fa-IR") : "ثبت نشده"}</strong></span>
            </div>
            <p>{profileComplete ? "پروفایل کامل است و امکان ثبت آگهی فعال است." : "برای ثبت آگهی، اطلاعات پروفایل را کامل کن."}</p>
            <p>نقش‌ها: {(currentUser?.roles ?? ["user"]).join("، ")}</p>
          </div>
        </div>
        <div className="profile-card trust-card">
          <ShieldCheck size={30} />
          <div>
            <span className="eyebrow">اعتماد و امنیت</span>
            <h2>وضعیت‌های قابل بررسی</h2>
            <IdentityBadge verified={currentUser?.identity_verification_status === "verified"} />
            <p>هر وضعیت از اطلاعات حساب و بررسی واقعی سرور می‌آید؛ «معتمد» بدون تعریف نمایش داده نمی‌شود.</p>
            <div className="trust-signal-grid">
              <span className={currentUser?.mobile_verified ? "trust-signal verified" : "trust-signal"}>
                <ShieldCheck size={15} />
                {currentUser?.mobile_verified ? "موبایل تأییدشده" : "موبایل تأیید نشده"}
              </span>
              <span className={profileComplete ? "trust-signal verified" : "trust-signal"}>
                <UserRound size={15} />
                {profileComplete ? "پروفایل کامل" : "پروفایل ناقص"}
              </span>
              <span className={currentUser?.identity_verification_status === "verified" ? "trust-signal verified" : "trust-signal"}>
                <ShieldCheck size={15} />
                {currentUser?.identity_verification_status === "verified"
                  ? "هویت تأییدشده"
                  : currentUser?.identity_verification_status === "rejected"
                    ? "احراز هویت ردشده"
                    : "احراز هویت ثبت نشده"}
              </span>
              <span className={props.myStorefront?.status === "active" ? "trust-signal verified" : "trust-signal"}>
                <Store size={15} />
                {props.myStorefront?.status === "active" ? "غرفه تأییدشده 4D" : "غرفه تأیید نشده"}
              </span>
              <span className={myItems.length ? "trust-signal verified" : "trust-signal"}>
                <ClipboardList size={15} />
                {myItems.length ? `${myItems.length.toLocaleString("fa-IR")} آگهی ثبت‌شده` : "هنوز آگهی ثبت نشده"}
              </span>
              <span className={conversations.length ? "trust-signal verified" : "trust-signal"}>
                <MessageCircle size={15} />
                {conversations.length ? `${conversations.length.toLocaleString("fa-IR")} گفت‌وگو` : "بدون گفت‌وگو"}
              </span>
            </div>
            {currentUser?.identity_verification_status !== "verified" ? <button type="button" className="ghost-button trust-request-button" onClick={() => { setIdentityError(""); setIdentityOpen(true); }}><ShieldCheck size={16} /> تکمیل احراز هویت</button> : null}
          </div>
        </div>
        {!editingProfile ? <details className="profile-disclosure">
          <summary><UserRound size={19} /><span><strong>اطلاعات ضروری</strong><small>{profileForm.first_name} {profileForm.last_name} · {cities.find((city: any) => city.id === profileForm.primary_city_id)?.name_fa ?? "منطقه 4D"}</small></span><span className="disclosure-arrow">+</span></summary>
          <section className="profile-card profile-summary-card">
            <UserRound size={30} />
            <div><span className="eyebrow">{profileComplete ? "اطلاعات ثبت‌شده" : "پروفایل ناقص"}</span><h2>{`${profileForm.first_name ?? ""} ${profileForm.last_name ?? ""}`.trim() || "اطلاعات حساب هنوز کامل نشده"}</h2><p>{cities.find((city: any) => city.id === profileForm.primary_city_id)?.name_fa ?? "شهر اصلی ثبت نشده"}</p><button type="button" className="ghost-button" onClick={() => setEditingProfile(true)}><RefreshCw size={16} /> {profileComplete ? "تغییر اطلاعات و رمز" : "تکمیل اطلاعات حساب"}</button></div>
          </section>
        </details> : <form className={profileComplete ? "profile-card profile-form complete" : "profile-card profile-form"} onSubmit={(event) => void saveProfile(event)}>
          <ShieldCheck size={30} />
          <div>
            <span className="eyebrow">{profileComplete ? "تایید شده" : "تکمیل حساب"}</span>
            <h2>اطلاعات ضروری</h2>
            <div className="form-row">
              <label>
                نام
                <input
                  required
                  value={profileForm.first_name}
                  onChange={(event) => setProfileForm({ ...profileForm, first_name: event.target.value })}
                  placeholder="مثلا علی"
                />
              </label>
              <label>
                نام خانوادگی
                <input
                  required
                  value={profileForm.last_name}
                  onChange={(event) => setProfileForm({ ...profileForm, last_name: event.target.value })}
                  placeholder="مثلا احمدی"
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                شهر اصلی
                <select
                  value={profileForm.primary_city_id}
                  onChange={(event) => setProfileForm({ ...profileForm, primary_city_id: event.target.value })}
                >
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name_fa}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                رمز عبور
                <input
                  dir="ltr"
                  type="password"
                  required={false}
                  value={profileForm.password}
                  onChange={(event) => setProfileForm({ ...profileForm, password: event.target.value })}
                  placeholder={currentUser?.password_set ? "برای تغییر رمز پر کن" : "اختیاری؛ برای ورود با رمز"}
                />
              </label>
            </div>
            <button type="submit" className="submit-button" disabled={profileSaving}>
              <Send size={18} />
              {profileSaving ? "در حال ذخیره" : profileComplete ? "ذخیره تغییرات" : "تکمیل و فعال‌سازی ثبت آگهی"}
            </button>
          </div>
        </form>}
        {!props.myStorefront && profileComplete && !editingProfile ? <details className="profile-disclosure">
          <summary><Store size={19} /><span><strong>پروفایل کسب‌وکار</strong><small>{props.businessForm.business_name || "اختیاری · هنوز ثبت نشده"}</small></span><span className="disclosure-arrow">+</span></summary>
          <section className="profile-card business-summary-card">
            <Store size={30} />
            <div>
              <span className="eyebrow">پروفایل کسب‌وکار</span>
              <h2>{props.businessForm.business_name || "هنوز ثبت نشده"}</h2>
              <p>{props.businessForm.business_name ? `${props.businessForm.business_type || "فعالیت حرفه‌ای"} · ${props.businessForm.service_area || "محدوده خدمت مشخص نشده"}` : "این بخش اختیاری است و برای معرفی حرفه‌ای‌تر استفاده می‌شود."}</p>
              <button type="button" className="ghost-button" onClick={() => setEditingProfile(true)}><Store size={16} /> {props.businessForm.business_name ? "ویرایش پروفایل کسب‌وکار" : "افزودن پروفایل کسب‌وکار"}</button>
            </div>
          </section>
        </details> : !props.myStorefront ? <form className="profile-card profile-form business-form" onSubmit={(event) => void props.saveBusinessProfile(event)}>
          <Store size={30} />
          <div>
            <span className="eyebrow">پروفایل کسب‌وکار اختیاری</span>
            <h2>برای معرفی حرفه‌ای‌تر</h2>
            <p>اگر فروشنده، تعمیرکار یا ارائه‌دهنده خدمات هستی، این اطلاعات اعتماد بیشتری می‌سازد.</p>
            <div className="form-row">
              <label>نام کسب‌وکار<input required value={props.businessForm.business_name} onChange={(event) => props.setBusinessForm({ ...props.businessForm, business_name: event.target.value })} placeholder="مثلاً خدمات فنی مهراد" /></label>
              <label>نوع فعالیت<input required value={props.businessForm.business_type} onChange={(event) => props.setBusinessForm({ ...props.businessForm, business_type: event.target.value })} placeholder="فروش، تعمیرات، خدمات" /></label>
            </div>
            <label>معرفی کوتاه<textarea value={props.businessForm.bio} onChange={(event) => props.setBusinessForm({ ...props.businessForm, bio: event.target.value })} placeholder="چه کاری انجام می‌دهی؟" /></label>
            <div className="form-row">
              <label>محدوده خدمت<input required value={props.businessForm.service_area} onChange={(event) => props.setBusinessForm({ ...props.businessForm, service_area: event.target.value })} placeholder="گرمه و جاجرم" /></label>
              <label>ساعات کاری<input required value={props.businessForm.opening_hours} onChange={(event) => props.setBusinessForm({ ...props.businessForm, opening_hours: event.target.value })} placeholder="هر روز ۹ تا ۱۸" /></label>
            </div>
            <label className="checkbox-line"><input type="checkbox" checked={props.businessForm.is_public} onChange={(event) => props.setBusinessForm({ ...props.businessForm, is_public: event.target.checked })} /> نمایش عمومی پروفایل کسب‌وکار</label>
            <button type="submit" className="submit-button" disabled={props.businessSaving}><Send size={18} />{props.businessSaving ? "در حال ذخیره" : "ذخیره پروفایل کسب‌وکار"}</button>
          </div>
        </form> : null}
        {profileComplete ? (
          props.myStorefront && !editingStorefront ? (
            <details className="profile-disclosure storefront-disclosure">
              <summary><Store size={19} /><span><strong>غرفه من</strong><small>{props.myStorefront.name} · {props.myStorefront.status === "active" ? "فعال" : "در انتظار بررسی"}</small></span><span className="disclosure-arrow">+</span></summary>
              <section className="profile-card storefront-summary-card">
                <Store size={30} />
                <div>
                  <span className="eyebrow">صفحه عمومی غرفه</span>
                  <h2>{props.myStorefront.name}</h2>
                  <p>{props.myStorefront.short_description || "توضیح کوتاه غرفه هنوز ثبت نشده است."}</p>
                  <div className="storefront-actions">
                    <a className="ghost-button" href={`/storefront/${props.myStorefront.slug}`} target="_blank" rel="noreferrer"><Store size={16} /> مشاهده غرفه</a>
                    <button type="button" className="ghost-button" onClick={() => setEditingStorefront(true)}><RefreshCw size={16} /> ویرایش غرفه</button>
                  </div>
                </div>
              </section>
            </details>
          ) : (
            <form className="profile-card profile-form storefront-form" onSubmit={(event) => void props.saveStorefront(event)}>
              <Store size={30} />
              <div>
                <span className="eyebrow">غرفه 4D</span>
                <h2>{props.myStorefront ? "ویرایش غرفه" : "ساخت غرفه حرفه‌ای"}</h2>
                <p>غرفه، همان صفحه عمومی کسب‌وکار توست؛ معرفی، اطلاعات تماس و آگهی‌ها در یک جای منظم نمایش داده می‌شوند.</p>
                <div className="form-row">
                  <label>نام غرفه<input required value={props.storefrontForm.name} onChange={(event) => props.setStorefrontForm({ ...props.storefrontForm, name: event.target.value })} placeholder="مثلاً خدمات فنی مهراد" /></label>
                  <label>نشانی کوتاه انگلیسی<input required dir="ltr" value={props.storefrontForm.slug} onChange={(event) => props.setStorefrontForm({ ...props.storefrontForm, slug: event.target.value })} placeholder="mehrad-services" /></label>
                </div>
                <div className="form-row">
                  <label>شهر اصلی<select required value={props.storefrontForm.city_id} onChange={(event) => props.setStorefrontForm({ ...props.storefrontForm, city_id: event.target.value })}>{cities.map((city) => <option key={city.id} value={city.id}>{city.name_fa}</option>)}</select></label>
                  <label>دسته فعالیت<select required value={props.storefrontForm.category_id} onChange={(event) => props.setStorefrontForm({ ...props.storefrontForm, category_id: event.target.value })}>{(props.categories ?? []).map((category: any) => <option key={category.id} value={category.id}>{category.name_fa}</option>)}</select></label>
                </div>
                <div className="form-row">
                  <label>نوع فعالیت<input required value={props.storefrontForm.business_type} onChange={(event) => props.setStorefrontForm({ ...props.storefrontForm, business_type: event.target.value })} placeholder="فروش، تعمیرات، خدمات" /></label>
                  <label>تلفن تماس<input dir="ltr" inputMode="tel" value={props.storefrontForm.phone} onChange={(event) => props.setStorefrontForm({ ...props.storefrontForm, phone: event.target.value })} placeholder="اختیاری" /></label>
                </div>
                <label>معرفی کوتاه<input required value={props.storefrontForm.short_description} onChange={(event) => props.setStorefrontForm({ ...props.storefrontForm, short_description: event.target.value })} placeholder="در یک جمله چه کاری انجام می‌دهی؟" /></label>
                <label>توضیحات کامل<textarea required value={props.storefrontForm.description} onChange={(event) => props.setStorefrontForm({ ...props.storefrontForm, description: event.target.value })} placeholder="خدمات، شرایط و مزیت‌های اصلی" /></label>
                <div className="form-row">
                  <label>نشانی یا محدوده<input value={props.storefrontForm.address} onChange={(event) => props.setStorefrontForm({ ...props.storefrontForm, address: event.target.value })} placeholder="اختیاری" /></label>
                  <label>ساعات کاری<input value={props.storefrontForm.working_hours} onChange={(event) => props.setStorefrontForm({ ...props.storefrontForm, working_hours: event.target.value })} placeholder="هر روز ۹ تا ۱۸" /></label>
                </div>
                <div className="storefront-form-actions"><button type="submit" className="submit-button" disabled={props.storefrontSaving}><Send size={18} />{props.storefrontSaving ? "در حال ذخیره" : "ذخیره و ارسال برای بررسی"}</button>{props.myStorefront ? <button type="button" className="ghost-button" onClick={() => setEditingStorefront(false)}>انصراف</button> : null}</div>
              </div>
            </form>
          )
        ) : null}
        {typeof document !== "undefined" ? createPortal(<>
        <button type="button" className="support-fab" aria-label="بازکردن پشتیبانی" title="پشتیبانی" onClick={() => setSupportOpen(true)}><Headphones size={21} aria-hidden="true" /><span>پشتیبانی</span></button>
        {identityOpen ? <div className="support-scrim" onClick={() => setIdentityOpen(false)}><section className="support-card support-popover" role="dialog" aria-modal="true" aria-labelledby="identity-title" onClick={(event) => event.stopPropagation()}>
          <div className="support-popover-head"><div className="support-popover-title"><span className="support-icon"><ShieldCheck size={18} aria-hidden="true" /></span><div><span className="eyebrow">احراز هویت دستی</span><h2 id="identity-title">مدارک خود را ارسال کن</h2></div></div><button type="button" className="icon-button" aria-label="بستن احراز هویت" onClick={() => setIdentityOpen(false)}><X size={18} /></button></div>
          <p>مدرک فقط برای بررسی ادمین ذخیره می‌شود و در بخش عمومی نمایش داده نمی‌شود. تصویر یا PDF حداکثر ۵ مگابایت.</p>
          {identityRequest?.status === "pending" ? <div className="support-history"><strong>درخواست شما در انتظار بررسی است.</strong><span>پس از بررسی، وضعیت همین‌جا به‌روزرسانی می‌شود.</span></div> : <>
            {identityRequest?.status === "rejected" ? <div className="support-history"><strong>درخواست قبلی رد شده است.</strong><span>{identityRequest.rejection_reason || "لطفاً مدرک واضح‌تری ارسال کن."}</span></div> : null}
            <label>نوع مدرک<select value={identityDocumentType} onChange={(event) => setIdentityDocumentType(event.target.value)}><option value="national_card">کارت ملی</option><option value="birth_certificate">شناسنامه</option><option value="passport">گذرنامه</option></select></label>
            <label>تصویر یا PDF مدرک<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => { const file = event.target.files?.[0]; setIdentityError(""); if (!file) return; if (file.size > 5_000_000) { setIdentityDocument(""); setIdentityError("حجم مدرک باید حداکثر ۵ مگابایت باشد."); return; } const reader = new FileReader(); reader.onload = () => setIdentityDocument(typeof reader.result === "string" ? reader.result : ""); reader.readAsDataURL(file); }} /></label>
            {identityError ? <p className="form-error" role="alert">{identityError}</p> : null}
            <button type="button" className="submit-button" disabled={identityBusy || !identityDocument} onClick={async () => { setIdentityBusy(true); setIdentityError(""); try { const response = await fetch(`${props.apiBaseUrl ?? ""}/api/v1/me/identity-verification`, { method: "POST", headers: props.getAuthHeaders?.(authToken), body: JSON.stringify({ document_type: identityDocumentType, document_data_url: identityDocument }) }); const result = await response.json().catch(() => null); if (!response.ok) throw new Error(result?.error?.message || "ارسال درخواست احراز هویت انجام نشد."); setIdentityRequest(result.data); setIdentityDocument(""); setIdentityOpen(false); props.onRefresh?.(); } catch (error) { setIdentityError(error instanceof Error ? error.message : "ارسال درخواست احراز هویت انجام نشد."); } finally { setIdentityBusy(false); } }}><Send size={17} /> {identityBusy ? "در حال ارسال" : "ارسال برای بررسی"}</button>
          </>}
        </section></div> : null}
        {supportOpen ? <div className="support-scrim" onClick={() => setSupportOpen(false)}><section className="support-card support-popover" role="dialog" aria-modal="true" aria-labelledby="support-title" aria-describedby="support-description" onClick={(event) => event.stopPropagation()}>
          <div className="support-popover-head"><div className="support-popover-title"><span className="support-icon"><Headphones size={18} aria-hidden="true" /></span><div><span className="eyebrow">مرکز پشتیبانی</span><h2 id="support-title">چطور کمکت کنیم؟</h2></div></div><button type="button" className="icon-button" aria-label="بستن پشتیبانی" title="بستن" onClick={() => setSupportOpen(false)}><X size={18} aria-hidden="true" /></button></div><div><p id="support-description">پیامت را بفرست؛ پاسخ داخل همین حساب نمایش داده می‌شود.</p>
          {mySupport.length ? <div className="support-history">{mySupport.slice(0, 3).map((ticket: any) => <div key={ticket.id}><strong>{ticket.subject}</strong><span>{ticket.status} {ticket.admin_reply ? `· ${ticket.admin_reply}` : ""}</span></div>)}</div> : null}
          <label className="sr-only" htmlFor="support-subject">موضوع پشتیبانی</label><input id="support-subject" value={supportSubject} onChange={(event) => setSupportSubject(event.target.value)} placeholder="موضوع" />
          <label className="sr-only" htmlFor="support-message">متن پیام پشتیبانی</label><textarea id="support-message" value={supportMessage} onChange={(event) => setSupportMessage(event.target.value)} placeholder="متن پیام پشتیبانی" />
          <button type="button" className="submit-button" disabled={supportBusy || !supportSubject.trim() || !supportMessage.trim()} onClick={async () => { setSupportBusy(true); try { const response = await fetch(`${props.apiBaseUrl ?? ""}/api/v1/me/support`, { method: "POST", headers: props.getAuthHeaders?.(authToken), body: JSON.stringify({ subject: supportSubject, message: supportMessage }) }); if (!response.ok) throw new Error(); setSupportSubject(""); setSupportMessage(""); props.onSupportCreated?.(); } finally { setSupportBusy(false); } }}><Send size={17} /> ارسال به پشتیبانی</button>
          </div>
        </section></div> : null}
        </>, document.body) : null}
        <div className="profile-card">
          <ClipboardList size={30} />
          <div>
            <span className="eyebrow">آگهی‌های من</span>
            <h2>{myItems.length.toLocaleString("fa-IR")} آگهی ثبت‌شده</h2>
            <p>آگهی جدید بعد از ثبت، اول اینجا و در صف بررسی دیده می‌شود.</p>
            {myItems.length ? (
              <div className="workspace-list">
                {myItems.slice(0, 5).map((item) => (
                  <div className="workspace-listing-row" key={item.id}>
                    <button type="button" onClick={() => openItem(item)}>
                      <span><ClipboardList size={15} />{item.title}</span>
                      <small>{getStatusLabel(item.status)} · {formatPrice(item.price_amount, item.price_type)}</small>
                    </button>
                    <div className="workspace-listing-actions">
                      <button type="button" className="ghost-button compact-action" onClick={() => editMyListing(item)}>ویرایش</button>
                      <button type="button" className="ghost-danger compact-action" disabled={deletingListingId === item.id} onClick={() => void deleteMyListing(item.id)}>{deletingListingId === item.id ? "در حال حذف..." : "حذف"}</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="workspace-empty">هنوز آگهی ثبت نکردی. بعد از تکمیل حساب، اولین آگهی را از بازار بساز.</span>
            )}
          </div>
        </div>
        <div className="profile-card">
          <MessageCircle size={30} />
          <div>
            <span className="eyebrow">گفتگوهای من</span>
            <h2>{conversations.length.toLocaleString("fa-IR")} چت فعال</h2>
            <p>تماس‌ها داخل برنامه به گفتگو تبدیل می‌شوند و شماره عمومی نمایش داده نمی‌شود.</p>
            {unreadConversationCount ? (
              <span className="unread-pill">
                <Bell size={14} />
                {unreadConversationCount.toLocaleString("fa-IR")}
              </span>
            ) : null}
            {authToken && notificationPermission !== "granted" ? (
              <button type="button" className="notification-toggle" onClick={() => void enableBrowserNotifications()}>
                <Bell size={14} />
                {notificationPermission === "unsupported" ? "اعلان سیستم پشتیبانی نمی‌شود" : "فعال‌سازی اعلان پیام"}
              </button>
            ) : null}
            {authToken ? (
              <button type="button" className="notification-toggle push-ready" onClick={() => void syncPushSubscription()} disabled={pushBusy}>
                <Wifi size={14} />
                {pushBusy
                  ? "در حال آماده‌سازی"
                  : pushSubscriptionCount
                    ? `${pushSubscriptionCount.toLocaleString("fa-IR")} دستگاه آماده Push`
                    : "آماده‌سازی Push واقعی"}
              </button>
            ) : null}
            {authToken && pushSubscriptionCount ? (
              <button type="button" className="notification-toggle push-test" onClick={() => void sendPushTest()} disabled={pushTestBusy}>
                <Bell size={14} />
                {pushTestBusy ? "در حال ارسال تست" : "ارسال تست Push"}
              </button>
            ) : null}
            {conversations.length ? (
              <div className="workspace-list conversation-list">
                {conversations.slice(0, 4).map((conversation) => (
                  <button
                    type="button"
                    className={conversation.unread_count && !conversation.is_muted ? "unread" : undefined}
                    key={conversation.id}
                    onClick={() => void openConversation(conversation.id)}
                  >
                    <span>
                      <MessageCircle size={15} />
                      {conversation.content_title}
                      {conversation.unread_count && !conversation.is_muted ? (
                        <span className="message-count">{conversation.unread_count.toLocaleString("fa-IR")}</span>
                      ) : null}
                      {conversation.is_muted ? (
                        <span className="muted-chip">
                          <BellOff size={12} />
                          بی‌صدا
                        </span>
                      ) : null}
                      {conversation.is_blocked ? (
                        <span className="blocked-chip">
                          <Ban size={12} />
                          مسدود
                        </span>
                      ) : null}
                    </span>
                    <small>
                      {getConversationPreview(conversation, currentUser?.id)} · {formatCompactDate(conversation.last_message_at ?? conversation.updated_at)}
                    </small>
                  </button>
                ))}
              </div>
            ) : (
              <span className="workspace-empty">هنوز گفتگویی نداری. از جزئیات یک آگهی، چت امن را شروع کن.</span>
            )}
          </div>
        </div>
        <div className="profile-actions">
          <button type="button" className="submit-button" disabled={!profileComplete} onClick={() => { navigateWorkspace("market"); window.setTimeout(() => document.getElementById("create")?.scrollIntoView({ behavior: "smooth" }), 80); }}>
            <Plus size={18} />
            {profileComplete ? "ثبت آگهی جدید" : "اول تکمیل حساب"}
          </button>
          <button type="button" className="ghost-button" onClick={() => navigateWorkspace("market")}>
            <Store size={18} />
            دیدن بازار
          </button>
        </div>
      </div>
    )}
  </section>
  );
}
