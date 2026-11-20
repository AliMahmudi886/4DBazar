# نقشه راه پروژه 4D

## اصل اجرای مرحله‌ای

پروژه phase-by-phase پیش می‌رود. هر فاز باید خروجی قابل بررسی، exit criteria و phase completion report داشته باشد. پرش به فاز بعدی بدون تکمیل فاز فعلی مجاز نیست.

## Phase 0 - Repository Assessment & Project Foundation

هدف: شناخت وضعیت فعلی repository و ایجاد foundation مستنداتی.

خروجی‌ها:

- scan repository
- README
- AGENTS
- documentation architecture
- roadmap
- tracker
- risk register
- decision log
- tech debt register
- unknowns
- project status

Exit criteria:

- فایل‌های foundation وجود داشته باشند.
- وضعیت فعلی پروژه روشن باشد.
- فاز بعدی مشخص باشد.

وضعیت: تکمیل‌شده

## Phase 1 - Product Discovery

هدف: روشن کردن مسئله، کاربر، ارزش پیشنهادی و مدل محصول قبل از PRD.

خروجی‌ها:

- Vision نقد و اصلاح‌شده
- Problem Statement
- Personas
- JTBD
- Value Proposition
- Product Pillars
- Marketplace Model
- Core Metrics
- Hypotheses
- Risks

Exit criteria:

- پاسخ اولیه به دلیل استفاده از 4D نسبت به جایگزین‌ها ثبت شده باشد.
- حداقل personaهای اصلی buyer، seller، service provider و local business مشخص باشند.
- metricهای اولیه و فرضیات marketplace ثبت شده باشند.

وضعیت: تکمیل‌شده

## Phase 2 - Market Research & Competitor Analysis

هدف: تحلیل بازار محلی 4D و رقبا با تمرکز بر فرصت واقعی.

خروجی‌ها:

- local market research
- competitor analysis برای Divar، Sheypoor و جایگزین‌های محلی
- gap analysis
- opportunity map
- category recommendation
- source list

Exit criteria:

- فرصت‌های local-first روشن باشند.
- فرضیات cold start و دسته‌بندی اولیه بازبینی شده باشند.
- منابع research ثبت شده باشند.

وضعیت: تکمیل‌شده

## Phase 3 - Product Strategy

هدف: تبدیل discovery و research به strategy قابل اجرا.

خروجی‌ها:

- positioning
- differentiation
- category strategy
- local strategy
- cold start strategy
- monetization hypothesis
- trust strategy
- growth strategy
- metrics strategy

وضعیت: تکمیل‌شده

## Phase 4 - PRD + MVP

هدف: تعریف دقیق نسخه MVP و جلوگیری از scope creep.

خروجی‌ها:

- PRD
- scope P0/P1/P2/P3
- acceptance criteria برای P0
- deferred list

وضعیت: تکمیل‌شده

## Phase 5 - UX

هدف: طراحی جریان‌های اصلی محصول.

خروجی‌ها:

- sitemap
- navigation
- screen list
- listing flow
- wanted flow
- service flow
- search flow
- chat flow
- report flow
- subscription flow

وضعیت: تکمیل‌شده

## Phase 6 - Domain Model

هدف: تعریف entityها، aggregateها، relationshipها و business ruleها.

وضعیت: تکمیل‌شده

## Phase 7 - Database & API

هدف: طراحی schema، indexها، constraintها و API contract.

وضعیت: تکمیل‌شده

## Phase 8 - System Architecture

هدف: تثبیت معماری سیستم، moduleها، dependency ruleها و runtime.

وضعیت: تکمیل‌شده

## Phase 9 - Security & Trust

هدف: طراحی threat model، moderation، abuse prevention و trust architecture.

وضعیت: تکمیل‌شده

## Phase 10 - Development Foundation

هدف: بعد از تکمیل foundationهای محصول و معماری، scaffold فنی، CI، testing infrastructure، configuration، logging و base security ایجاد شود.

وضعیت: تکمیل‌شده

## Development Sprint 1 - Backend Foundation

هدف: شروع توسعه featureها از پایه backend امن و قابل تست.

خروجی‌ها:

- انتخاب ORM/query builder
- migrationهای واقعی
- seed داده‌های 4D
- اتصال PostgreSQL
- auth/session واقعی
- content create/read پایه
- audit persistence

وضعیت: آماده شروع

## نقشه توسعه پس از Beta داخلی

محصول بعد از Sprint 52 هنوز «MVP توسعه‌یافته» است، نه نسخه نهایی marketplace. مسیر پیشنهادی توسعه به ترتیب ارزش محصول:

### Sprint 53 - Favorite واقعی و AI Listing Assistant

- migration و API برای favorite
- وضعیت ذخیره‌شده روی کارت
- local AI review برای کیفیت عنوان، توضیح و قیمت
- قرارداد provider برای اتصال بعدی به مدل واقعی

### مسیر توسعه هوش مصنوعی

- Sprint 54: پیشنهاد category/attribute و تکمیل خودکار فرم آگهی
- Sprint 55: تشخیص کیفیت عکس و هشدار محتوای پرریسک قبل از moderation
- Sprint 56: جست‌وجوی معنایی و پیشنهاد آگهی‌های مشابه
- Sprint 57: دستیار ادمین برای خلاصه reportها و اولویت‌بندی moderation
- Sprint 58: تحلیل هوشمند pilot و پیشنهاد بهبود supply/demand

قاعده AI محصول: هیچ پیشنهاد AI نباید بدون تایید کاربر آگهی را منتشر، حذف یا تصمیم moderation را نهایی کند.

### Sprint 54 - Wanted و Service Request واقعی

- فرم ثبت «دنبال چه چیزی هستم؟»
- ثبت درخواست خدمت و پاسخ provider
- feed و filter جدا برای عرضه، تقاضا و خدمت
- moderation و chat زمینه‌دار برای هر نوع محتوا

### Sprint 55 - Business Profile و Trust Layer

- پروفایل کسب‌وکار محلی
- ساعات کاری، محدوده خدمت و راه تماس امن
- trust signals قابل توضیح
- گزارش عملکرد ساده برای provider

### Sprint 56 - Search Backend و Analytics

- انتقال filter/sort از local UI به query واقعی PostgreSQL
- pagination cursor-based و indexهای search
- analytics events برای view، search، favorite و chat
- داشبورد ساده funnel برای ادمین

### Sprint 57 - Production Media و Operations

- object storage یا volume پایدار
- resize و lifecycle cleanup رسانه
- backup/restore و alerting
- HTTPS، domain، CORS محدود و observability

### Sprint 58 - Pilot محدود و Feedback Loop

- pilot در گرمه، جاجرم، ایور و درق
- ثبت feedback درون‌برنامه‌ای
- تحلیل search success، contact rate و listing quality
- اولویت‌بندی اصلاحات بر اساس داده واقعی

قابلیت‌های عمدی deferred: پرداخت، wallet، escrow، logistics، auction، recommendation پیچیده و native mobile تا زمانی که liquidity و رفتار واقعی کاربر اثبات شوند.
## Development Sprint 59 - Business Profile and Public Trust Layer

- business profile persistence با migration `0014`
- API احراز‌شده برای خواندن و ویرایش
- endpoint عمومی با guard روی `is_public`
- نمایش context فروشنده در جزئیات آگهی
- گام بعد: evidence-backed trust signals و analytics پایه
## Development Sprint 60 - Brand Asset Cleanup and Handoff

- انتخاب لوگوی افقی رسمی برای header
- انتخاب لوگومارک برای PWA/app icon
- اضافه‌شدن brand guidelines و handoff document
- validation کامل build، bundle، visual و release
## Development Sprint 61 - Evidence-backed Trust and Analytics

- analytics event persistence برای view/favorite/contact
- trust summary عمومی با سیگنال‌های واقعی
- نمایش context اعتماد در جزئیات آگهی
- سند انتقال کامل برای اکانت جدید
- گام بعد: analytics dashboard محدود، privacy/retention و evidence معتبر
## Development Sprint 62 - Owner Analytics and Privacy Controls

- aggregate analytics dashboard برای صاحب آگهی
- opt-out برای eventهای شخصی
- حذف eventهای actor کاربر
- کنترل‌های privacy داخل Profile Workspace
- گام بعد: retention job، privacy policy و evidence-backed trust signals پیشرفته
## Development Sprint 63 - Retention, Privacy and Response Trust

- analytics retention cleanup job با `ANALYTICS_RETENTION_DAYS`
- privacy policy endpoint و توضیح کنترل داده
- response rate مبتنی بر پیام‌های واقعی seller
- گام بعد: production media pipeline و قرارداد نهایی اپ موبایل
## Development Sprint 64 - Production Media and Mobile API Contract

- ثبت پایدار media asset metadata و checksum
- storage key مستقل از provider
- قرارداد API موبایل برای auth، listing، media، chat و error code
- گام بعد: انتخاب object storage production و شروع native mobile shell
## Development Sprint 88 - EAS Android Build Readiness

هدف: آماده‌سازی build native اندروید برای تست واقعی اعلان.

خروجی:

- `eas.json` با profileهای build.
- script ساخت development APK.
- platform-aware native token registration.
- validation config و Android export.

Exit criteria:

- Expo config معتبر باشد.
- bundle اندروید بدون خطا export شود.
- دستور cloud build مستند باشد.
- نبود projectId/credentials به‌عنوان blocker شفاف ثبت شود.

وضعیت: تکمیل‌شده با cloud build deferred

## Development Sprint 87 - Provider Testability

هدف: آماده‌کردن delivery برای mock provider و تست قابل تکرار قبل از دستگاه واقعی.

خروجی:

- config شدن `EXPO_PUSH_API_URL`.
- parser مستقل ticketهای Expo.
- تحمل پاسخ malformed بدون crash.
- تست provider response.

Exit criteria:

- provider URL بدون تغییر کد قابل جایگزینی باشد.
- parser خروجی نامعتبر را امن normalize کند.
- test و build موفق باشند.

وضعیت: تکمیل‌شده

## Development Sprint 86 - Notification Diagnostics

هدف: قابل مشاهده‌کردن وضعیت و خطاهای outbox برای تیم مدیریت.

خروجی:

- endpoint `GET /api/v1/admin/notifications/outbox-summary`.
- شمارش jobها بر اساس status.
- نمایش ۱۰ خطای اخیر.
- محدودسازی endpoint به moderator.

Exit criteria:

- کاربر عادی به diagnostic دسترسی نداشته باشد.
- پاسخ برای debugging عملیاتی کافی باشد.
- تست authorization و build موفق باشند.

وضعیت: تکمیل‌شده

## Development Sprint 85 - Worker Recovery and Retry Backoff

هدف: مقاوم‌کردن outbox worker در برابر crash و خطاهای موقت provider.

خروجی:

- recovery jobهای stuck در `processing` بعد از ۵ دقیقه.
- retry با backoff نمایی و سقف ۱۵ دقیقه.
- گزارش تعداد jobهای recovered.

Exit criteria:

- crash worker باعث stuck دائمی job نشود.
- provider failure با فاصله افزایشی retry شود.
- migration جدید لازم نباشد و validation کامل پاس شود.

وضعیت: تکمیل‌شده

## Development Sprint 84 - Notification Outbox Foundation

هدف: پایدارکردن ثبت و پردازش اعلان با outbox دیتابیسی.

خروجی:

- جدول `notification_outbox` و migration.
- ثبت job بعد از پیام جدید.
- worker یک‌باره با claim و retry delay.
- command اجرای worker برای cron یا process manager.

Exit criteria:

- restart API باعث حذف job اعلان نشود.
- delivery خارج از پاسخ اصلی پیام اجرا شود.
- job خطادار برای تلاش بعدی باقی بماند.
- build و test موفق باشند.

وضعیت: تکمیل‌شده

## مسیر فازهای بعدی

- Sprint 85: worker دائمی، recovery jobهای stuck و retry با backoff.
- Sprint 86: metrics و پنل diagnostic اعلان، provider mock integration test و batch limit.
- Sprint 87: EAS Development Build اندروید، تست واقعی permission/token و deep-link روی دستگاه.
- Sprint 88: تکمیل onboarding و profile completeness در موبایل، شامل validation و وضعیت‌های خطا.
- Sprint 89: بهبود UX وب و موبایل، loading/empty/error states و accessibility audit.
- Sprint 90: release candidate، preflight production، امنیت، backup، observability و checklist انتشار.

پس از Sprint 90، توسعه featureهای محصول مثل جست‌وجوی پیشرفته، AI قابل‌کنترل و trust signals توسعه‌یافته ادامه پیدا می‌کند؛ اما انتشار موبایل production باید بعد از عبور از Sprint 87 و release gate Sprint 90 انجام شود.

## Development Sprint 83 - Native Push Receipt Reliability

هدف: افزایش مشاهده‌پذیری و پاک‌سازی tokenهای نامعتبر بعد از delivery native.

خروجی:

- polling receiptهای Expo.
- شمارش خطاهای native در `native_failed`.
- revoke token با خطای `DeviceNotRegistered` از receipt.
- best-effort بودن receipt polling.

Exit criteria:

- receipt failure از مسیر ارسال پیام جدا بماند.
- token نامعتبر بعد از receipt پاک شود.
- build و test موفق باشند.

وضعیت: تکمیل‌شده

## Development Sprint 82 - Native Push Delivery

هدف: ارسال اعلان native برای پیام‌های جدید و اتصال payload به گفتگو.

خروجی:

- اتصال API به Expo Push Service.
- ارسال payload شامل `conversationId`.
- مستقل‌کردن Web Push و native push.
- revoke خودکار tokenهای DeviceNotRegistered.

Exit criteria:

- delivery بدون VAPID نیز native را بررسی کند.
- خطای provider باعث شکست ارسال پیام نشود.
- آمار delivery قابل log و بررسی باشد.

وضعیت: تکمیل‌شده

## Development Sprint 81 - Native Push Token Persistence

هدف: اتصال token اعلان native موبایل به persistence و API واقعی.

خروجی:

- migration و جدول `native_push_tokens`.
- endpoint ثبت و revoke token برای کاربر verified.
- جلوگیری از ارسال Expo token به Web Push endpoint.
- ثبت best-effort token از اپ موبایل.

Exit criteria:

- token با user ownership و unique constraint ذخیره شود.
- ورودی نامعتبر قبل از دسترسی DB رد شود.
- قطع بودن API جریان فعال‌سازی اعلان موبایل را خراب نکند.
- تست validation و build موفق باشند.

وضعیت: تکمیل‌شده

## Development Sprint 80 - Native Mobile Notifications Foundation

هدف: آماده‌سازی foundation اعلان native موبایل و اتصال اعلان به مسیر گفتگو.

خروجی:

- نصب و پیکربندی `expo-notifications`.
- ساخت کانال اعلان Android و permission flow.
- دریافت و نگهداری local Expo push token.
- پشتیبانی از notification response با `conversationId`.
- آماده‌سازی plugin در Expo config.

Exit criteria:

- موبایل بدون خطای typecheck و bundle ساخته شود.
- اعلان foreground handler داشته باشد.
- notification tap بتواند گفتگو را باز کند.
- محدودیت Expo Go و نیازمندی push production مستند شود.

وضعیت: تکمیل‌شده

## Development Sprint 79 - Deep Link and Media Hardening

- deep link `four-d://conversation/{id}`
- پشتیبانی cold start و foreground
- کنترل اندازه تصویر چت پیش از upload
- گام بعد: push واقعی موبایل، thumbnail و cleanup attachment

## Development Sprint 78 - Chat Image Attachments

- انتخاب تصویر از گالری در thread
- upload تصویر با media API
- ارسال URL تصویر به‌عنوان پیام
- نمایش image message در حباب گفتگو
- گام بعد: deep link گفتگو، push polish و محدودیت/فشرده‌سازی اختصاصی چت

## Development Sprint 77 - Read Receipts

- محاسبه read receipt با persistence واقعی
- نمایش وضعیت خوانده‌شدن پیام‌های کاربر
- حفظ polling و safety controls گفتگو
- گام بعد: attachment تصویر در چت و notification polish

## Development Sprint 76 - Chat Safety Controls

- polling سبک برای پیام‌های جدید
- mute/unmute گفتگو
- block/unblock گفتگو
- گزارش پیام از داخل thread
- گام بعد: read receipts، attachment و notification polish

## Development Sprint 75 - Mobile Chat Thread

- thread واقعی گفتگو در موبایل
- نمایش history و تفکیک پیام خود کاربر
- ارسال پیام به API و نمایش فوری نتیجه
- refresh دستی برای پیام‌های جدید
- گام بعد: polling سبک، mute/block و گزارش پیام در موبایل

## Development Sprint 74 - Mobile Listing Edit

- فرم ویرایش آگهی در موبایل
- ارسال تغییرات به API مالکیت‌محور
- برگشت status به بررسی و نمایش feedback
- گام بعد: message thread کامل با ارسال پیام

## Development Sprint 73 - Cross-client UX/UI Pass

- جداکردن اطلاعات حساب از آگهی‌های من در موبایل
- هم‌راستاسازی visual language وب با برند 4D
- motion سبک، hover feedback و سطح‌بندی surfaceها
- پشتیبانی reduced-motion
- گام بعد: فرم ویرایش آگهی موبایل و message thread کامل

## Development Sprint 72 - Listing Management

- endpoint امن ویرایش آگهی برای مالک
- endpoint soft-delete آگهی برای مالک
- بازگشت آگهی ویرایش‌شده به صف moderation
- اتصال حذف و refresh به mobile workspace
- گام بعد: فرم ویرایش موبایل و message thread کامل

## Development Sprint 71 - My Listings Workspace

- نمایش آگهی‌های کاربر از دیتابیس در موبایل
- نمایش تعداد و status هر آگهی
- گام بعد: ویرایش/حذف آگهی و message thread کامل

## Development Sprint 70 - Real Mobile Profile

- hydrate پروفایل از دیتابیس با `/api/v1/me`
- نمایش وضعیت حساب و رمز
- فارسی‌سازی کامل profile
- گام بعد: آگهی‌های من، ویرایش/حذف آگهی و message thread

## Development Sprint 69 - Mobile Profile Onboarding

- تکمیل پروفایل و تنظیم رمز از موبایل
- اتصال password setup به API واقعی
- اضافه شدن لوگوی رسمی افقی به asset موبایل
- گام بعد: پیام‌رسانی کامل، آگهی‌های من و device QA

## Development Sprint 68 - Mobile Auth Runtime

- ورود با رمز عبور در موبایل
- پازل امنیتی native متصل به challenge/proof API
- اصلاح قرارداد verify OTP و نمایش خطای دقیق
- گام بعد: profile onboarding و message thread native

## Development Sprint 67 - Mobile Core Flows

- router موبایل برای بازار، جزئیات، ثبت آگهی، گفتگو و پروفایل
- انتخاب و upload تصویر native و اتصال به listing create
- اتصال contact intent به inbox
- export موفق Android
- گام بعد: device QA، profile onboarding، message thread و release build

## Development Sprint 65 - S3-compatible Object Storage

- adapter واقعی AWS S3/MinIO-compatible با Put/Get object
- production guard برای جلوگیری از local filesystem
- metadata و checksum قبلی حفظ شد
- گام بعد: native mobile shell و اتصال به API contract
## Development Sprint 66 - Native Mobile Shell

- scaffold `apps/mobile` با Expo/React Native/TypeScript
- اتصال واقعی feed، listing detail، OTP auth و profile
- token persistence با AsyncStorage
- command `npm run dev:mobile`
- گام بعد: navigation production، upload تصویر native و Android build smoke

## Development Sprint 89 - Cross-client UX and Mobile Brand Readiness

- اصلاح قطعی جهت پازل در RTL برای وب و موبایل
- پازل drag واقعی و مقاوم در برابر کلیک ساده
- اتصال production-first اپ موبایل به API عمومی
- app icon، adaptive icon، splash و asset شفاف رسمی برند
- بازطراحی auth، market، bottom navigation و stateهای شبکه
- فرم کامل‌تر ثبت آگهی با شهر، دسته‌بندی و قیمت واقعی
- QA روی emulator و validation کامل web/mobile

## Development Sprint 90 - Cross-client Workspace Completion

- تکمیل جزئیات آگهی، inbox/chat و profile در موبایل با داده واقعی API
- بهبود dialog، تصویر و کنترل report در چت وب
- حذف fixture و success ساختگی از build production
- Service Worker شبکه‌محور و CORS محدود برای دامنه production
- بسته مستقل cPanel و ZIP دقیق وب/API با dependencyهای pin شده
- validation کامل web/API و export موفق Android

## Development Sprint 91 - Release Candidate Hardening

- انتشار `web-upload.zip` و `api-upload.zip` روی دو هاست cPanel
- smoke واقعی ورود با رمز و OTP، ثبت آگهی با تصویر، پروفایل و گفتگو
- تعریف backup روزانه برای `data/media` تا زمان مهاجرت به object storage
- ساخت EAS preview APK و تست روی حداقل یک گوشی Android واقعی
- تکمیل FCM credential یا ثبت صریح Push به‌عنوان deferred نسخه RC
- ثبت runbook rollback و مشاهده خطاهای API/worker پس از انتشار

پیشرفت ثبت‌شده در 2026-08-17: ممیزی جامع release readiness، hardening وب/API، quality gate چندمرورگری و Expo Doctor تکمیل شدند. انتشار artifact جدید روی cPanel، smoke واقعی محیط production، backup media و تست گوشی واقعی هنوز exit criteria باز هستند.

## Development Sprint 92 - Service Marketplace and Publication Tariffs

شروع این Sprint فقط بعد از بسته‌شدن exit criteria اسپرینت ۹۱ مجاز است.

- جداسازی واقعی `listing` و `service_listing` در persistence و قرارداد API
- جزئیات اختصاصی خدمت: محدوده، مدل قیمت و زمان پاسخ‌گویی
- کاتالوگ پلن انتشار کالا و خدمات با مبلغ و مدت قابل‌تغییر
- snapshot تعرفه و وضعیت پرداخت روی هر محتوا
- flow رایگان/معاف دوره آزمایشی و مرز fail-closed برای پلن پولی بدون provider
- فرم، فیلتر، card و detail مستقل در Web و Mobile
- تست validation، moderation، analytics، quality QA و Android device QA

مرجع کامل: `docs/SERVICE_MARKETPLACE_TARIFFS_FA.md`
