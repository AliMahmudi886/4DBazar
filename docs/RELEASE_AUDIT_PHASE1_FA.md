# گزارش فاز اول: ممیزی عمیق و آمادگی انتشار

تاریخ ممیزی: 2026-08-18  
دامنه: Web، API، Mobile، انتشار cPanel، امنیت، UX، responsive، accessibility، performance و SEO  
وضعیت: **Release Candidate آماده انتشار کنترل‌شده؛ انتشار عمومی نهایی هنوز تأیید نمی‌شود.**

## 1. شناخت پروژه

4D یک monorepo با معماری Modular Monolith است:

| بخش | فناوری و مسئولیت |
|---|---|
| Web | React 19، Vite، TypeScript، Lucide؛ بازار، auth، پروفایل، ثبت آگهی، admin و chat |
| API | Fastify 5، TypeScript، Kysely، PostgreSQL؛ auth/OTP، محتوا، media، moderation، chat، push و AI |
| Mobile | Expo SDK 53، React Native 0.79، Android-first؛ client متصل به API production |
| Shared | package مشترک TypeScript برای قراردادها و اعتبارسنجی‌های پایه |
| Storage | local media برای staging/cPanel؛ S3-compatible adapter آماده ولی production فعال نشده |
| Database | migrationهای 0001 تا 0020، seed پایه و PostgreSQL |

جریان‌های اصلی موجود: بازار و فیلتر، ورود OTP/رمز، کپچای پازلی، ثبت کالا/خدمت، آپلود تصویر، پروفایل، علاقه‌مندی، تماس/گفتگو، گزارش، moderation، notification و Push best-effort.

## 2. شواهد اجرایی

- `npm run check`: موفق.
- `npm run build`: موفق؛ build وب/API و shared بدون خطا.
- تست API: ۵۰ تست موفق.
- `npm run bundle:check`: موفق؛ مجموع JavaScript برابر ۵۲۱KB و chunk اصلی حدود ۴۲۲KB raw.
- `npm run release:check`: موفق؛ artifact و secret-hygiene preflight پاس شد.
- `npm run qa:quality`: موفق؛ ۲۷ حالت، شامل Chromium/Firefox/WebKit در 390x844، 768x1024 و 1440x1000، بدون runtime error، overflow یا violation جدی/بحرانی Axe.
- Android export و mobile typecheck: موفق.
- artifactهای تصویری QA در `qa/quality` و `qa/screenshots` تولید شدند.
- `npm audit --omit=dev --json`: در این محیط به‌علت پاسخ‌ندادن registry تکمیل نشد؛ نتیجه امنیتی مثبت یا منفی از آن استخراج نشده است.

## 3. یافته‌های Critical

### C-01: مورد Critical فعلی مشاهده نشد

در ممیزی کد و quality gate محلی، خطای Critical کشف نشد. این نتیجه جایگزین تست production، penetration test یا تست دستگاه واقعی نیست.

## 4. یافته‌های High

### H-01: storage محلی برای انتشار عمومی مناسب نیست

- محل: `apps/api/src/config.ts`، `apps/api/src/modules/media/local-storage.ts`، manifest انتشار cPanel.
- اثر: حذف/خرابی فایل‌ها، نبود CDN/thumbnail/lifecycle، وابستگی مستقیم به دیسک هاست و دشواری backup.
- وضعیت: API عمداً در production واقعی local را رد می‌کند؛ deployment فعلی برای کم‌هزینه بودن staging است.
- راهکار: Object Storage سازگار با S3، public URL پایدار، thumbnail/resize، backup و restore drill.
- ریسک تغییر: متوسط؛ نیازمند مهاجرت URLهای موجود و تست فایل‌های قبلی.
- اولویت: P0 پیش از public launch.

### H-02: rate limit در حافظه فرآیند است

- محل: `apps/api/src/security/rate-limit.ts`.
- اثر: با restart پاک می‌شود، در چند process مشترک نیست و برای abuse واقعی/چند IP کافی نیست.
- راهکار: rate limit توزیع‌شده روی Redis یا provider لبه، به‌علاوه limitهای اختصاصی OTP، login، upload و chat.
- ریسک تغییر: متوسط.
- اولویت: P0 برای public launch، P1 برای RC محدود.

### H-03: مسیرهای hosted smoke هنوز evidence ندارند

- محل: `docs/RELEASE_READINESS_AUDIT_FA.md` و handoff Sprint 91.
- اثر: build محلی سالم بودن اتصال واقعی DNS، CORS، PostgreSQL، SMS، media و restart cPanel را ثابت نمی‌کند.
- راهکار: smoke واقعی روی `4dbazar.ir` و `api.4dbazar.ir` برای live/ready، auth، OTP، listing با/بدون تصویر، profile، chat و admin.
- ریسک تغییر: پایین؛ ریسک عملیاتی تست روی داده واقعی دارد.
- اولویت: P0 قبل از اعلام انتشار.

### H-04: type safety موبایل ناقص است

- محل: `apps/mobile/App.tsx:1` دارای `@ts-nocheck` و فایل بسیار بزرگ.
- اثر: خطاهای قرارداد API و regression در تغییرات آینده ممکن است در compile دیده نشوند.
- راهکار: استخراج screen/componentهای مستقل، حذف تدریجی `@ts-nocheck`، type مشترک responseها و تست مسیرهای auth/listing/media.
- ریسک تغییر: متوسط تا زیاد به‌دلیل blast radius فایل فعلی.
- اولویت: P1.

## 5. یافته‌های Medium

### M-01: وابستگی‌های Expo/Metro نیازمند migration کنترل‌شده‌اند

- مستند موجود: `docs/RELEASE_READINESS_AUDIT_FA.md` و `docs/TECH_DEBT_FA.md`.
- اثر: هشدارهای transitive و ریسک ارتقای breaking پیش از انتشار عمومی.
- راهکار: migration جداگانه Expo، rebuild و device QA؛ `npm audit fix --force` اجرا نشود.
- اولویت: P1.

### M-02: Push و notification هنوز best-effort هستند

- محل: `apps/api/src/modules/notifications` و تنظیمات mobile.
- اثر: بدون FCM/credential واقعی و worker پایدار، تحویل اعلان تضمین نمی‌شود.
- راهکار: تصمیم صریح deferred یا تکمیل FCM، queue/worker durable، retry/backoff و observability.
- اولویت: P1؛ برای RC باید صادقانه به‌صورت deferred نمایش داده شود.

### M-03: بازیابی رمز عبور هنوز مسیر کامل مستقل ندارد

- محل: ثبت بدهی `TD-026` و flowهای auth.
- اثر: وابستگی recovery به OTP و نبود policy کامل تغییر/بازیابی رمز.
- راهکار: flow مستقل reset password با token یک‌بارمصرف، expiry، audit و پیام‌های قابل‌فهم.
- اولویت: P1.

### M-04: قابلیت‌های عمومی SEO پایه‌اند، نه SEO محتوایی کامل

- وضعیت: title، description، canonical، OG، robots و sitemap موجود است.
- اثر: صفحات detail آگهی و structured data پویا هنوز عمق کامل marketplace SEO را ندارند.
- راهکار: metadata و JSON-LD برای آگهی‌های عمومی، canonical دقیق و کنترل indexability صفحات خصوصی.
- اولویت: P2.

### M-05: تست end-to-end کامل به سرویس‌های واقعی وابسته است

- وضعیت: quality QA route-level و API integration محلی موجود است؛ تست واقعی OTP/SMS، عکس، chat و session expiration روی hosted انجام نشده.
- راهکار: suite smoke جدا با داده تست، cleanup و گزارش قابل بازتولید.
- اولویت: P1.

## 6. یافته‌های Low و پیشنهادهای اختیاری

- `apps/web/src/main.tsx` هنوز بزرگ است؛ استخراج فرم compose و market card نگهداشت‌پذیری را بهتر می‌کند.
- demo fallback در development مفید است اما باید در production همیشه خالی/واقعی بماند؛ این مرز فعلاً رعایت شده است.
- baseline تصویری و Lighthouse عددی به quality gate اضافه نشده؛ برای release عمومی اضافه شود.
- گزارش dependency باید در CI با registry در دسترس اجرا و artifact آن ذخیره شود.
- سیاست privacy/retention، appeal moderation و حذف حساب باید قبل از public launch نهایی شوند.

## 7. ماتریس قابلیت‌ها

| قابلیت | عملکرد | ظاهر/responsive | Accessibility | Performance | SEO | Error/empty/loading | Production |
|---|---|---|---|---|---|---|---|
| بازار و فیلتر | Pass محلی | Pass در ۳ viewport | Pass پایه | Pass budget | Pass پایه | Pass | نیازمند hosted smoke |
| ورود OTP/رمز/کپچا | Pass تستی | Pass | Pass پایه | Pass | خصوصی، no-index لازم | Pass | SMS واقعی و rate limit توزیع‌شده باز |
| ثبت کالا/خدمت | Pass API/UI محلی | Pass؛ فرم responsive | Pass پایه | Pass | خصوصی | Pass | تست واقعی DB/media باز |
| آپلود تصویر | Pass validation محلی | نمایش URL API اصلاح شده | Alt موجود | نیازمند thumbnail | N/A | Pass | storage/backup باز |
| پروفایل | Pass محلی | Pass | Pass پایه | Pass | خصوصی | Pass | hosted PUT/CORS smoke باز |
| chat/contact/report | Pass API/UI محلی | Pass پایه | نیازمند بررسی کامل keyboard | polling سبک | خصوصی | Pass | worker/push و smoke باز |
| moderation/admin | نقش و boundary پاس | Pass route-level | Pass پایه | lazy chunk | no-index لازم | Pass | تست نقش واقعی روی hosted باز |
| Mobile | typecheck/export Pass | QA emulator/محلی | بررسی محدود | نیازمند device metrics | N/A | Pass پایه | دستگاه واقعی و FCM باز |

## 8. برنامه پیشنهادی مرحله‌ای

### Gate 1 - Hosted Release Verification

Acceptance criteria: API live/ready، DNS/CORS، migration/seed، OTP، login، profile، listing، image، chat و admin روی cPanel با داده تست موفق؛ backup media ثبت شود.

### Gate 2 - Production Media and Abuse Controls

Acceptance criteria: S3-compatible storage، restore drill، thumbnail، rate limit توزیع‌شده، limit اختصاصی endpointها و alert خطا فعال باشد.

### Gate 3 - Web UX/SEO Final Pass

Acceptance criteria: Lighthouse baseline، detail metadata/JSON-LD، keyboard/focus audit، صفحات 404 و private route indexing کنترل‌شده.

### Gate 4 - Mobile Stabilization

Acceptance criteria: حذف مرحله‌ای `@ts-nocheck`، preview APK، تست گوشی واقعی با شبکه ضعیف، auth/listing/upload/chat و تصمیم FCM.

### Gate 5 - Public Launch Decision

Acceptance criteria: هیچ P0/P1 باز بدون owner و deadline نباشد، privacy/retention/appeal آماده باشد، rollback و monitoring مستند و تست‌شده باشد.

## 9. محدودیت‌های این ممیزی

- دسترسی مستقیم به هاست cPanel، حساب SMS، دیتابیس production و گوشی واقعی در این اجرا وجود نداشت.
- Lighthouse و WebPageTest عددی اجرا نشدند؛ bundle budget و quality QA جایگزین کامل آن‌ها نیستند.
- `npm audit` به‌علت در دسترس نبودن registry کامل نشد.
- penetration test مستقل و تست بار اجرا نشد.

## تصمیم پیشنهادی

فاز اول تکمیل شد. برای فاز دوم، پیشنهاد می‌شود ابتدا Gate 1 یعنی hosted smoke و media backup اجرا شود؛ سپس وارد تغییرات گسترده UI یا feature جدید شویم.
