# سند تحویل پروژه 4D

این فایل برای ادامه پروژه با اکانت یا agent دیگر نوشته شده است.

## نقطه شروع

1. `README.md`
2. `AGENTS.md`
3. `PROJECT_STATUS_FA.md`
4. `docs/ROADMAP_FA.md`
5. `docs/TRACKER_FA.md`
6. `docs/DECISION_LOG_FA.md`
7. `docs/RISK_REGISTER_FA.md`
8. `docs/UNKNOWNS_FA.md`
9. آخرین گزارش داخل `docs/phase-reports`

## وضعیت فعلی

- آخرین increment محلی: Development Sprint 116؛ fallback آدرس API production، invalidation کش Service Worker و release جفت `v0.1.34-2026-08-25` تکمیل شده‌اند.
- خروجی release: `release/cpanel/4d-web-v0.1.34-2026-08-25.zip` و `release/cpanel/4d-api-v0.1.34-2026-08-25.zip`.
- بعد از پاک‌سازی بازار، نمایش سه آگهی نمونه در production نباید رخ دهد؛ باقی‌ماندن آن‌ها نشانه سرو شدن build/cache قدیمی است.

- آخرین increment محلی: Development Sprint 114؛ فرم دسته‌آگاه و صفحه جزئیات جدید با `check`، `build`، `test` و QA تصویری responsive سبز هستند.
- این increment migration ترمیمی `0026_market_contents_soft_delete_repair.sql` دارد؛ پس از آپلود API اجرای `npm run db:migrate` و Restart App اجباری است.
- مواردی که باید روی مقصد smoke شوند: مخفی بودن وضعیت برای املاک/خدمات، ذخیره قیمت و وضعیت کالای فیزیکی، جزئیات responsive و گالری چندعکس.

- Phase 0 تا Phase 10 تکمیل شده‌اند.
- Development Sprint 114 تکمیل محلی شده و انتشار/Smoke مقصد گام بعدی مصوب است.
- آخرین موضوع: گالری چندرسانه‌ای، کشف غرفه عمومی، شمارنده بازدید و مستقل‌سازی Portal پشتیبانی.
- migrationهای repository تا `0026_market_contents_soft_delete_repair.sql` وجود دارند؛ `0026` هنوز باید روی هاست اجرا شود.
- پروژه یک modular monolith با Fastify/TypeScript در API، React/Vite در Web و PostgreSQL/Kysely در persistence است.
- برند رسمی در `docs/BRAND_GUIDELINES_FA.md` ثبت شده است.
- Web production روی `https://4dbazar.ir` و API روی `https://api.4dbazar.ir` قرار دارند.
- موبایل Expo/React Native است و در نبود env محلی به API production متصل می‌شود.
- OTP موبایل hint رسمی Autofill سیستم‌عامل دارد و پس از تکمیل ۶ رقم verify را یک‌بار خودکار اجرا می‌کند؛ مجوز کامل SMS در manifest اضافه نشده است.
- طراحی فاز بعد محصول برای جداسازی آگهی خدماتی و تعرفه انتشار در `docs/SERVICE_MARKETPLACE_TARIFFS_FA.md` آماده است.
- مرجع اجباری طراحی مشترک Web/Mobile در `docs/DESIGN_SYSTEM_FA.md` است؛ feature تازه نباید token یا الگوی بصری مستقل بسازد.

## اجرای محلی

```powershell
cd D:\Projects\4D
npm install
docker compose up -d postgres
npm run db:migrate
npm run db:seed
npm run dev:api
npm run dev:web
```

API روی `http://127.0.0.1:4000` و Web روی آدرس Vite که در terminal اعلام می‌شود اجرا می‌شوند.

## اعتبارسنجی قبل از تحویل

```powershell
npm run check
npm run build
npm run bundle:check
npm test
npm run qa:visual
npm run qa:quality
npm run release:check
```

## قرارداد ادامه فاز

- قبل از feature جدید، tracker و roadmap را به‌روزرسانی کن.
- هر تغییر معماری در decision log ثبت شود.
- هر phase باید گزارش تکمیل، status، tracker و risk/deferred update داشته باشد.
- secretها هرگز در سند handoff یا خروجی terminal نوشته نشوند.
- شماره موبایل verified به‌تنهایی business verification نیست.

## گام بعدی مصوب

گام بعدی: deploy جفت ZIPهای release `v0.1.28-2026-08-24` روی cPanel، اجرای health/ready و smoke نوشتنی حذف/ویرایش/رسانه و کنترل بصری بازار/جزئیات. پس از آن hardening فرم‌های دسته‌ای و performance/security ادامه پیدا می‌کند.

ممیزی و artifact تازه در `docs/RELEASE_READINESS_AUDIT_FA.md` و `release/cpanel` قرار دارند. build و gateهای محلی پاس شده‌اند، اما انتشار واقعی، backup و device QA هنوز باید انجام شوند.

پس از بسته‌شدن Sprint 91، Sprint 92 با عنوان `Service Marketplace & Publication Tariffs` اجرا می‌شود. prompt آماده تحویل به Agent بعدی در `docs/NEXT_AGENT_PROMPT_FA.md` قرار دارد. مبلغ نهایی دو پلن خدماتی، provider پرداخت، مدت featured و سیاست refund هنوز تصمیم مالک محصول هستند.

## پیشرفت Sprint 91 - Android Preview

- `apps/mobile/app.json` آیکن رسمی، adaptive icon با زمینه سفید و `versionCode=2` دارد.
- `apps/mobile/eas.json` برای profile `preview` خروجی APK مستقل و API production را تنظیم می‌کند.
- دستور `npm run mobile:build:android:preview` لینک APK قابل ارسال می‌سازد.
- EAS build شماره `620e9fd1-fa89-4d1c-95a2-b4ee1a0eecf6` موفق است و APK مرجع در `release/mobile/4d-bazar-preview-v0.1.0-build2.apk` نگهداری می‌شود.
- APK روی emulator نصب و بدون Metro اجرا شد؛ launcher icon رسمی، ورود و پازل از نظر بصری تایید شدند. تست گوشی واقعی و سناریوهای end-to-end هنوز باقی است.
- آیکن launcher فقط با native rebuild تغییر می‌کند؛ Reload مترو کافی نیست و Development Build قدیمی باید پیش از نصب APK جدید حذف شود.
- راهنمای کامل در `docs/MOBILE_ANDROID_RELEASE_FA.md` است.

## آخرین handoff - Sprint 90

- `npm run release:cpanel` خروجی مستقل را داخل `release/cpanel` می‌سازد.
- `release/cpanel/web-upload.zip` باید در `public_html` هاست وب extract شود؛ `.htaccess` داخل ZIP وجود دارد.
- `release/cpanel/api-upload.zip` باید در `/home/a4dbazarir/4d-api` هاست Node extract شود؛ `data/media` موجود نباید حذف شود.
- API package دیگر workspace نیست و روی هاست فقط `npm install --omit=dev` نیاز دارد.
- متغیر جدید `CORS_ORIGINS=https://4dbazar.ir` باید در cPanel اضافه و App restart شود.
- production web دیگر demo item یا success ساختگی ندارد و Service Worker آن network-first است.
- موبایل detail، profile، inbox و chat به API واقعی متصل و از نظر loading/error/empty state تکمیل شده‌اند.
- validation موفق: check، ۴۸ تست، bundle budget، release check، visual QA، Android export و standalone API import.

## آخرین handoff - Sprint 92 Increment 3

- پروفایل وب وضعیت حساب و اطلاعات حساب را جدا و خلاصه نمایش می‌دهد؛ ویرایش اطلاعات با دکمه مستقل انجام می‌شود.
- پشتیبانی از دکمه آیکونی باز می‌شود و popup سابقه تیک و ارسال پیام را دارد.
- feed و آگهی‌های کاربر رسانه را از API/DB می‌خوانند؛ برای production اجرای migration رسانه و حفظ `data/media` الزامی است.
- پنل ادمین فهرست جست‌وجوپذیر کاربران، verification، جزئیات آگهی‌دهنده/رسانه و حذف آگهی دارد.
- release جدید: `release/cpanel/4d-web-v0.1.6-2026-08-21.zip` و `release/cpanel/4d-api-v0.1.6-2026-08-21.zip`.
- ZIPهای `v0.1.5-2026-08-20` عمداً حفظ شده‌اند؛ manifest نسخه 0.1.6 هش SHA-256 و دستور deploy دارد.
- validation این increment: API ۵۰ تست سبز، shared یک تست سبز، build وب/API موفق.
- گام بعدی: smoke cPanel چندرسانه‌ای و support/admin، سپس تکمیل روستاها و composer مستقل ثبت آگهی.

## آخرین handoff - Sprint 92 Increment 4

- فایل‌های آماده deploy: `release/cpanel/4d-web-v0.1.7-2026-08-21.zip` و `release/cpanel/4d-api-v0.1.7-2026-08-21.zip`.
- برای رفع 404های support و admin detail باید هر دو ZIP با هم deploy شوند؛ آپلود وب به‌تنهایی کافی نیست.
- FAB پشتیبانی در پایین صفحه و popup از گوشه پایین باز می‌شود. پروفایل کسب‌وکار summary مستقل دارد.
- انتخاب رسانه در فرم با `multiple` فعال است؛ حداکثر ۶ عکس و ۱ ویدیو. بعد از deploy، migration رسانه و حفظ `data/media` الزامی است.

## آخرین handoff - Sprint 92 Increment 5

- فایل‌های نهایی: `release/cpanel/4d-web-v0.1.8-2026-08-21.zip` و `release/cpanel/4d-api-v0.1.8-2026-08-21.zip`.
- handler رسانه اکنون انتخاب‌های بعدی را به رسانه‌های قبلی اضافه می‌کند؛ برای تست، دو بار انتخاب فایل انجام بده و شمارنده فرم را بررسی کن.
- اطلاعات ضروری و کسب‌وکار در حالت تکمیل‌شده بسته هستند و با کلیک روی header باز می‌شوند.

## آخرین handoff - Sprint 92 Increment 6

- فایل‌های نهایی: `release/cpanel/4d-web-v0.1.9-2026-08-21.zip` و `release/cpanel/4d-api-v0.1.9-2026-08-21.zip`.
- فرم‌های ثبت آگهی و خدمات اکنون فقط از دکمه‌های انتشار، داخل مودال باز می‌شوند.
- برای مشاهده کاربران، نقش پاسخ `/api/v1/me` باید شامل `admin` باشد؛ moderator عمداً به فهرست کاربران دسترسی ندارد.
- پشتیبانی FAB در پایین راست است؛ پس از deploy هر دو بسته، cache/service worker وب را update کن.

## آخرین handoff - Sprint 92 Increment 7

- نسخه نهایی این increment: `release/cpanel/4d-web-v0.1.10-2026-08-21.zip` و `release/cpanel/4d-api-v0.1.10-2026-08-21.zip`.
- بعد از deploy API و restart، برای گرفتن نقش admin باید logout/login انجام شود؛ توکن قبلی نقش جدید نمی‌گیرد.

## آخرین handoff - Sprint 92 Increment 8

- نسخه‌ی انتشار: `release/cpanel/4d-web-v0.1.11-2026-08-21.zip` و `release/cpanel/4d-api-v0.1.11-2026-08-21.zip`.
- فرم خدمت اکنون مستقل از فرم آگهی است؛ زمان ارائه و سابقه‌ی فعالیت فیلدهای جدا هستند.
- پشتیبانی با FAB ثابت و popup responsive در لایه‌ی مستقل نمایش داده می‌شود.
- برای دیدن همه‌ی کاربران، API باید با `ADMIN_PHONE_NUMBERS=[REDACTED_PHONE]` اجرا شود و کاربر پس از restart، logout/login کند.
- ابزار مستقل Multi-Agent در این محیط callable نیست؛ ادامه‌ی کار با role gateهای Product/Architecture/Backend/Web/Mobile/Security/QA/Review انجام شود.

## آخرین handoff - Sprint 92 Increment 9

- نسخه‌ی انتشار: `release/cpanel/4d-web-v0.1.12-2026-08-21.zip` و `release/cpanel/4d-api-v0.1.12-2026-08-21.zip`.
- مودال انتشار از navbar فاصله‌ی امن دارد و خروج با دکمه‌ی واضح و backdrop انجام می‌شود.
- FAB پشتیبانی در اسکرول شناور می‌ماند و popup آن بالاتر از سایر overlayها قرار دارد.
- کاربران ادمین داخل فهرست بازشونده هستند؛ جستجو، تازه‌سازی و تایید کاربر حفظ شده است.

## آخرین handoff - Sprint 92 Increment 10: Load Test

- طرح تست ۳۰۰ کاربر مجازی در `docs/testing/LOAD_TEST_PLAN_300_USERS_FA.md` ثبت شد.
- harness بدون وابستگی خارجی در `scripts/load-test-300.mjs` و فرمان `npm run load:test:300` آماده است.
- ابزار فقط local/test را می‌پذیرد و مقصد production را رد می‌کند.
- read-heavy ramp-up تا ۳۰۰ اجرا شد: ۵۴۱۹ درخواست، ۰ خطای 5xx/network، اما ۴۶۹۹ پاسخ 429.
- حالت local-only با `LOAD_TEST_MODE=true` نیز اجرا شد: ۵۴۱۹ درخواست، ۰ خطا، P95 برابر ۵۰۷ms.
- تست write/auth/upload/chat/admin هنوز انجام نشده و DB تستی/fixture token لازم دارد.
- `npm test` و `npm run build` سبز؛ `bundle:check` و `qa:quality` هنوز fail هستند و باید رفع شوند.
- گزارش با وضعیت `NOT READY / PASS WITH WARNINGS برای اجرای تست بار` در `docs/testing/LOAD_TEST_300_USERS_FA.md` ثبت شده است.
- بعد از راه‌اندازی Docker، ابتدا `npm run docker:up`، سپس migration/seed و API محلی اجرا شود؛ بعد ramp-up پیش‌فرض با ۳۰۰ کاربر اجرا گردد.

## آخرین handoff - Sprint 93 Storefront Foundation

- سند تصمیم و شکاف قابلیت غرفه در `docs/STOREFRONT_GAP_ANALYSIS_FA.md` است.
- migration جدید `db/migrations/0022_storefronts.sql` باید روی DB مقصد اجرا شود.
- API هسته در `apps/api/src/modules/storefront/repository.ts` و routeهای آن در `apps/api/src/server.ts` قرار دارد.
- مسیرهای جدید: `GET /api/v1/me/storefront`، `POST /api/v1/storefronts`، `PATCH /api/v1/me/storefront`، public slug/id، و admin moderation.
- `storefront_id` در ثبت آگهی اختیاری است؛ public storefront فقط آگهی‌های approved را نشان می‌دهد.
- UI مالک/public، تست integration روی PostgreSQL، smoke moderation و ZIP release هنوز در increment بعدی باقی است.

## آخرین handoff - Sprint 89

- پازل وب با `left` فیزیکی رسم می‌شود و در RTL برعکس نیست.
- `apps/mobile/components/PuzzleCaptcha.tsx` پازل drag واقعی را پیاده می‌کند و tap ساده پذیرفته نمی‌شود.
- `apps/mobile/App.tsx` برای production از API عمومی استفاده می‌کند و media URL نسبی را resolve می‌کند.
- auth، market، bottom navigation و فرم ثبت آگهی موبایل بازطراحی شده‌اند.
- فرم ثبت آگهی، شهر و دسته‌بندی را از API می‌گیرد و قیمت ثابت/توافقی دارد.
- assetهای native در `apps/mobile/assets` و تنظیمات icon/splash در `apps/mobile/app.json` هستند.
- validation موفق: mobile typecheck، Expo Android export، emulator puzzle QA، web build، bundle budget و Playwright visual QA.
## آخرین handoff - Sprint 93 Increment 2

- UI مالک غرفه در `apps/web/src/components/ProfileWorkspace.tsx` و صفحه عمومی در `apps/web/src/components/StorefrontPublicPage.tsx` قرار دارد.
- آدرس عمومی: `/storefront/{slug}`؛ فقط storefront با وضعیت `active` و listings با وضعیت `approved` نمایش داده می‌شوند.
- در فرم ثبت آگهی، انتخاب «انتشار در غرفه» اختیاری است و مقدار `storefront_id` به API ارسال می‌شود.
- `npm run check` و `npm run build` موفق هستند.
- گام بعدی: تست integration با PostgreSQL، smoke moderation، بررسی responsive با مرورگر و ساخت ZIP نسخه‌دار cPanel.

## آخرین handoff - Sprint 94 Listing Experience Foundation

- Gap Analysis پیوست تجربه آگهی/چت در `docs/LISTING_EXPERIENCE_GAP_ANALYSIS_FA.md` است.
- کارت‌های Web با click روی محتوای کارت و keyboard به detail drawer می‌روند؛ Favorite و تماس propagation مستقل دارند.
- trust widget عمومی حذف و CTA تماس به «تماس» اصلاح شده است.
- releaseهای نسخه‌دار در `release/cpanel/` با برچسب `v0.1.14-2026-08-22` قرار دارند.
- کیفیت محلی سبز است؛ Docker/PostgreSQL در محیط توسعه در دسترس نبود، پس migration و smoke واقعی هنوز باید روی مقصد اجرا شود.
- گام بعدی: طراحی و اجرای category metadata/schema مشترک، سپس فرم‌های dynamic و فیلترهای category-specific؛ بعد از آن push/chat device E2E.

## آخرین handoff - Sprint 95 Support/Profile/Moderation Hardening

- Support FAB در `apps/web/src/styles.css` نسبت به viewport شناور است و در موبایل فاصله bottom navigation و safe-area را لحاظ می‌کند.
- popup پشتیبانی در `apps/web/src/components/ProfileWorkspace.tsx` با Escape، backdrop، close و labelهای دسترس‌پذیر کار می‌کند.
- وقتی `myStorefront` وجود دارد، فرم تکراری `business-form` render نمی‌شود؛ غرفه همان هویت عمومی کسب‌وکار است و اطلاعات ضروری حساب جداست.
- خطای صف moderation اگر relation/column migration وجود نداشته باشد، اجرای migrationهای `0021` و `0022` را پیشنهاد می‌کند.
- پس از ساخت release جدید، روی cPanel در ریشه API اجرا شود: `source ~/nodevenv/4d-api/20/bin/activate && cd ~/4d-api && npm run db:migrate`، سپس Restart App. نسخه‌های قبلی ZIP حذف نشوند.

## آخرین handoff - Sprint 96 Storefront Queue and Searchable Selectors

- صف غرفه‌های `pending_review` اکنون در پنل ادمین از `/api/v1/admin/storefronts` خوانده می‌شود و دکمه تأیید/توقف دارد.
- شهر و دسته در فیلتر بازار و فرم ثبت آگهی انتخاب‌گر جست‌وجوپذیر دارند و فهرست بلند صفحه را اشغال نمی‌کند.
- نسخه انتشار این sprint با برچسب `v0.1.16-2026-08-22` در `release/cpanel/` ساخته می‌شود.
- بعد از deploy، migrationها، Restart App و smoke مسیر `/admin` و `/storefront/{slug}` باید روی cPanel اجرا شوند.

## آخرین handoff - Sprint 98 Hosted Release and Admin Discovery Hardening

- smoke عمومی `npm run smoke:hosted` روی `https://api.4dbazar.ir` موفق است؛ اجرای آن روی سیستم محلی به دسترسی شبکه نیاز دارد.
- release جدید: `release/cpanel/4d-web-v0.1.18-2026-08-22.zip` و `release/cpanel/4d-api-v0.1.18-2026-08-22.zip`.
- API صف غرفه‌ها اطلاعات مالک را برمی‌گرداند و UI ادمین آن را داخل disclosure جمع‌شونده نشان می‌دهد.
- بعد از deploy هر دو ZIP، Restart Node.js App و اجرای دوباره `npm run smoke:hosted` لازم است. برای تست خصوصی ادمین، `HOSTED_AUTH_TOKEN` را تنظیم و `npm run smoke:hosted:auth` را اجرا کن.
- فاز بعدی approved: Sprint 99 برای performance، security و load test سیصد کاربر.

## آخرین handoff - Sprint 97 Correction: Dynamic Category Metadata

- migration `0023_category_metadata_schema.sql`، seed schema دسته‌ها، validator API، فرم پویا و فیلتر اختصاصی در workspace کامل و تست شده‌اند.
- release آماده: `release/cpanel/4d-web-v0.1.19-2026-08-22.zip` و `release/cpanel/4d-api-v0.1.19-2026-08-22.zip`.
- پیش‌نیاز ادامه: API ZIP، migration و seed روی cPanel اجرا شود؛ سپس وب ZIP هم‌نسخه deploy و category form/filter smoke شود.

## آخرین handoff - Sprint 99 Public Listing Detail

- صفحه عمومی جزئیات در مسیر `/listing/{id}` اضافه شد و از endpoint فعلی جزئیات API استفاده می‌کند.
- تصویر/عنوان کارت بازار به صفحه مستقل لینک می‌شوند؛ Drawer فعلی برای مرور سریع حفظ شده است.
- گالری چندرسانه‌ای، thumbnail، پشتیبانی ویدیو، metadata، بازدید، غرفه و اشتراک‌گذاری در صفحه مستقل قرار گرفت.
- خروجی‌های آماده انتشار:
  - `release/cpanel/4d-web-v0.1.20-2026-08-22.zip`
  - `release/cpanel/4d-api-v0.1.20-2026-08-22.zip`
  - `release/cpanel/4d-release-manifest-v0.1.20-2026-08-22.txt`
- روی cPanel هر دو ZIP را deploy کن و API را restart کن؛ migration جدیدی برای این increment لازم نیست.
- تست مقصد: از یک کارت منتشرشده روی عنوان/تصویر کلیک کن، URL را refresh کن، چند thumbnail و ویدیو را بررسی کن و همین URL را در موبایل باز کن.
- موارد increment بعد: اتصال واقعی favorite/chat در صفحه مستقل، view deduplication و SEO/Open Graph اختصاصی.

## آخرین handoff - Sprint 99 Seed Hotfix 0.1.21

- خطای seed ناشی از نبودن `metadata_schema` در ۷ ردیف دسته‌بندی بود و اصلاح شده است.
- خروجی‌های جدید:
  - `release/cpanel/4d-web-v0.1.21-2026-08-22.zip`
  - `release/cpanel/4d-api-v0.1.21-2026-08-22.zip`
  - `release/cpanel/4d-release-manifest-v0.1.21-2026-08-22.txt`
- پس از جایگزینی ZIPها روی cPanel اجرا کن: `source ~/nodevenv/4d-api/20/bin/activate`، سپس `cd ~/4d-api`، `npm install --omit=dev` و `npm run db:seed`؛ در پایان Node.js App را Restart کن.
- برای این hotfix migration جدیدی لازم نیست؛ migration قبلی موفق بوده است. خروجی مورد انتظار: `Seeds applied.`
- هشدار نیاز Kysely به Node 22 فعلاً blocker نیست؛ ارتقای Node در صورت ارائه توسط هاست در backlog باقی می‌ماند.

## آخرین handoff - Sprint 112 Local Runtime/Delete Hardening

- `EADDRINUSE` به معنی فعال بودن یک API دیگر روی پورت ۴۰۰۰ است و خطای build نیست.
- حذف آگهی مالک idempotent و UI در برابر کلیک/درخواست تکراری محافظت شده است.
- Service Worker و cacheهای production در development خودکار حذف می‌شوند.
- نسخه قابل تشخیص API: `2026-08-25-delete-idempotency-sw-1`.
- دو آگهی تستی با شناسه‌های `fdedca5f-0a94-4e4e-840b-f19b3eee8ba3` و `e341b6ab-abec-43c6-88db-f36ec8ab6b3e` در smoke محلی soft-delete شدند.
- پس از deploy جفت ZIP، Node.js App باید restart و header نسخه و حذف واقعی مقصد بررسی شود.

## آخرین handoff - Sprint 113 Bodyless Request/Delete Reliability

- علت نهایی ۵۰۰ حذف، هدر JSON روی DELETE بدون body بود؛ helper وب اکنون JSON و auth header را جدا مدیریت می‌کند.
- API حذف را idempotent انجام می‌دهد و حذف تکراری یا هم‌زمان را با نتیجه موفق reconcile می‌کند.
- parser errorهای 4xx Fastify دیگر توسط error handler به ۵۰۰ تبدیل نمی‌شوند.
- نسخه قابل تشخیص API: `2026-08-25-delete-reconcile-2`.
- smoke واقعی روی PostgreSQL محلی: حذف آگهی آزمایشی، تکرار حذف و نبودن آن در `/api/v1/me/contents` همگی موفق بودند.
- انتشار مقصد باید وب و API نسخه `0.1.31-2026-08-25` را با هم جایگزین کند؛ seed یا پاک‌سازی دیتابیس لازم نیست.

## آخرین handoff - Sprint 114 Category-aware Listing Detail

- policy فیلدهای آگهی در `@four-d/shared` تعریف شده و Web/API هر دو از همان قرارداد استفاده می‌کنند.
- وضعیت کالا فقط برای دسته‌های کالای فیزیکی نمایش و ذخیره می‌شود؛ استخدام و حمل‌ونقل نیز قیمت عمومی ندارند.
- صفحه جزئیات با گالری ۴:۳، metadata دسته، اطلاعات غرفه و CTAهای responsive بازطراحی شده است.
- انتشار مقصد باید وب و API نسخه `0.1.32-2026-08-25` را با هم جایگزین کند؛ migration یا seed تازه‌ای برای این increment لازم نیست.

## آخرین handoff - Sprint 115 Feed Truthfulness/Cleanup

- سه کارت اولیه فقط demo توسعه بودند؛ وب دیگر آن‌ها را با feed واقعی ادغام نمی‌کند و production هنگام قطع API داده ساختگی نشان نمی‌دهد.
- مقصد در بررسی مستقیم `GET /health/ready` پاسخ 503 داشت؛ این خطا باید پیش از هر پاک‌سازی با Restart و بررسی log برنامه Node.js رفع شود.
- ابزار `db:cleanup:market` همه محتوای بازار و وابستگی‌های منطقی آن را transactionally حذف می‌کند، اما نیازمند `MARKET_CLEANUP_CONFIRM=DELETE_ALL_MARKET_CONTENT` است و فایل‌های رسانه را حفظ می‌کند.
- پیش از اجرای ابزار روی cPanel باید backup دیتابیس گرفته شود. پس از اجرا، ثبت و انتشار یک آگهی جدید smoke شود.
- انتشار مقصد باید ZIPهای جفت `4d-api-v0.1.33-2026-08-25.zip` و `4d-web-v0.1.33-2026-08-25.zip` را جایگزین کند؛ manifest و SHA-256ها در `release/cpanel/4d-release-manifest-v0.1.33-2026-08-25.txt` ثبت شده‌اند.
