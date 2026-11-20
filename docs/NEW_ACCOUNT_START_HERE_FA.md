# شروع کار اکانت جدید پروژه 4D

این سند را قبل از هر پیام دیگری به agent یا اکانت جدید بده. هدف آن این است که ادامه پروژه دقیقاً با همان روش phase-by-phase انجام شود.

## دستور اصلی برای agent جدید

«تو ادامه‌دهنده پروژه 4D هستی. قبل از هر تغییر، همه اسناد زیر را بخوان، وضعیت فعلی و آخرین phase report را استخراج کن، تغییرات موجود را برنگردان، و فقط بعد از تکمیل exit criteria فاز فعلی وارد فاز بعد شو. وقتی من می‌گویم `بریم فاز بعدی`، خودت فاز بعدی را بر اساس roadmap و backlog انتخاب و در همان turn پیاده‌سازی، تست، مستندسازی و گزارش کن. در پایان دقیق بگو چه تغییر کرده، چه تستی اجرا شده و فاز بعد چیست.»

برای تحویل فعلی، نسخه کامل و قابل کپی این دستور در `docs/NEXT_AGENT_PROMPT_FA.md` قرار دارد و نسبت به متن کوتاه بالا اولویت دارد.

## ترتیب اجباری مطالعه

1. `README.md`
2. `AGENTS.md`
3. `PROJECT_STATUS_FA.md`
4. `docs/ROADMAP_FA.md`
5. `docs/TRACKER_FA.md`
6. `docs/DECISION_LOG_FA.md`
7. `docs/RISK_REGISTER_FA.md`
8. `docs/UNKNOWNS_FA.md`
9. `docs/HANDOFF_FA.md`
10. `docs/BRAND_GUIDELINES_FA.md`
11. `docs/DESIGN_SYSTEM_FA.md`
12. همین فایل
13. تمام فایل‌های `docs/phase-reports`

گزارش‌های phase منبع تاریخچه و acceptance criteria هستند. اگر بین یک سند قدیمی و `PROJECT_STATUS_FA.md` اختلافی بود، وضعیت جدیدتر را از آخرین phase report و tracker تطبیق بده و تصمیم را در decision log ثبت کن.

## وضعیت قطعی فعلی

- Phase 0 تا Phase 10 تکمیل شده‌اند.
- Development Sprint 1 تا Sprint 111 تکمیل محلی شده‌اند.
- آخرین فاز: Sprint 111، Listing Delete and Media Runtime Repair.
- migrationهای repository تا `0026_market_contents_soft_delete_repair.sql` هستند؛ migration `0026` باید همراه release جدید روی PostgreSQL هاست اجرا شود.
- لوگوی افقی و لوگومارک رسمی در `apps/web/public/brand` قرار دارند؛ استفاده از asset deprecated ممنوع است.
- API: Fastify + TypeScript + Kysely/PostgreSQL.
- Web: React + Vite + TypeScript.
- معماری: Modular Monolith.
- محدوده اولیه محصول: گرمه، جاجرم، ایور و درق.
- Web production: `https://4dbazar.ir`
- API production: `https://api.4dbazar.ir`
- Mobile: Expo/React Native Android-first با EAS projectId ثبت‌شده؛ credentialهای FCM/Android داخل repository نیستند.
- Development Sprint 97 تکمیل محلی شده است؛ گالری چندعکسی، لینک غرفه، شمارنده بازدید و Support Portal تکمیل شده‌اند. smoke واقعی cPanel و QA تعاملی گسترده هنوز در فازهای بعدی باقی است.

- Development Sprint 98 تکمیل محلی و smoke عمومی شده است؛ آخرین release `v0.1.18-2026-08-22` است و صف غرفه ادمین با اطلاعات مالک و disclosure جمع‌شونده آماده شده است. Sprint 99 برای performance، security و load test سیصد کاربر است.
- OTP موبایل Autofill استاندارد و verify خودکار کد شش‌رقمی دارد؛ مجوز کامل خواندن SMS نباید اضافه شود.
- Sprint 92 فقط بعد از Sprint 91 اجرا می‌شود و طراحی آن در `docs/SERVICE_MARKETPLACE_TARIFFS_FA.md` است.

## کار انجام‌شده در Sprint 90

- detail، profile، inbox و chat موبایل با API واقعی و stateهای loading/error/empty تکمیل شدند.
- پازل وب و موبایل جهت فیزیکی صحیح دارد و tap ساده پذیرفته نمی‌شود.
- production web دیگر داده demo و موفقیت ساختگی ثبت آگهی نمایش نمی‌دهد.
- Service Worker شبکه‌محور و CORS API محدود به originهای تنظیم‌شده است.
- `npm run release:cpanel` بسته مستقل و pin شده وب/API تولید می‌کند.
- ZIPهای آماده تحویل در `release/cpanel` هستند و manifest همان پوشه مرجع انتشار است.
- validation شامل ۴۸ تست، Android export، visual QA، bundle budget و standalone API import موفق است.

## گام بعدی

Sprint 99: performance/security hardening و سناریوهای نوشتنی ۳۰۰ کاربر. object storage production و credentialهای FCM/APNs را جدا پیگیری کن و هیچ secretی را داخل اسناد یا git قرار نده.

بعد از ثبت evidence و تکمیل Sprint 91، Sprint 92 بازار خدمات و تعرفه انتشار است. قبل از فعال‌کردن پلن پولی، قیمت ریالی، درگاه، callback، ظرفیت featured و refund باید توسط مالک محصول تایید شوند؛ success ساختگی یا hardcode مبلغ در کلاینت ممنوع است.

## تعریف فاز در این پروژه

هر فاز باید همه این خروجی‌ها را داشته باشد:

- feature یا سند اصلی فاز
- migration/repository/API/UI در صورت نیاز
- تست متمرکز برای رفتار جدید
- به‌روزرسانی `PROJECT_STATUS_FA.md`
- به‌روزرسانی `docs/TRACKER_FA.md`
- تصمیم مهم در `docs/DECISION_LOG_FA.md`
- ریسک یا deferred item در `docs/RISK_REGISTER_FA.md`
- گزارش در `docs/phase-reports/DEVELOPMENT_SPRINT_<N>_COMPLETION_REPORT_FA.md`

## دستورهای اعتبارسنجی

```powershell
cd D:\Projects\4D
npm run check
npm run build
npm run db:migrate
npm test
npm run bundle:check
npm run qa:visual
npm run release:check
```

برای اجرای محلی:

```powershell
docker compose up -d postgres
npm run db:migrate
npm run db:seed
npm run dev:api
npm run dev:web
```

## قواعد غیرقابل مذاکره

- secret، API key، OTP و token را در سند یا خروجی نهایی چاپ نکن.
- تغییر کاربر قبلی را revert نکن؛ با آن کار کن.
- feature جدید را بدون ثبت در tracker/backlog شروع نکن.
- mobile verification را business verification معرفی نکن.
- قبل از feature جدید قرارداد DB و API موجود را بخوان.
- برای تغییرات UI visual QA را اجرا کن.
- برای هر migration اجرای `npm run db:migrate` را بررسی کن.
- در صورت نبود داده واقعی، fallback را به‌عنوان preview صادقانه نگه دار.

## مسیر پیشنهادی ادامه

1. تکمیل analytics dashboard محدود به صاحب آگهی با queryهای aggregate واقعی.
2. افزودن retention/privacy policy برای analytics events.
3. evidence-backed trust signals مثل سابقه پاسخ‌گویی و تعاملات معتبر، بدون امتیاز جعلی.
4. production media storage و thumbnail pipeline.
5. تثبیت API contract و شروع فاز اپ موبایل.

## قالب پاسخ پایان هر فاز

در پایان فاز، پاسخ فارسی باید کوتاه اما کامل باشد:

- نام و هدف فاز
- تغییرات واقعی فایل/DB/API/UI
- تست‌ها و نتیجه
- لینک فایل گزارش phase
- فاز بعدی و دلیل انتخاب آن

با پیام `بریم فاز بعدی`، مرحله بعد را اجرا کن و فقط برای تصمیم‌های واقعاً مسدودکننده سؤال بپرس.
## آخرین وضعیت Sprint 62

Sprint 62 پیاده‌سازی شده است: داشبورد aggregate آگهی‌های مالک، preference برای opt-out و endpoint حذف eventهای شخصی اضافه شده‌اند. migration جدید `0016_analytics_preferences.sql` است. در محیطی که Docker Desktop فعال باشد، ابتدا `npm run db:migrate` و سپس `npm test` را اجرا کن؛ در این turn Docker در دسترس نبود.
## آخرین وضعیت Sprint 63

Sprint 63 تکمیل شده است: `npm run db:cleanup:analytics` برای پاک‌سازی eventهای قدیمی، `GET /api/v1/privacy-policy` و seller response rate اضافه شده‌اند. قبل از production، retention days، privacy copy و job scheduling باید در deployment واقعی تنظیم شوند.
## آخرین وضعیت Sprint 64

`media_assets` و migration `0017_media_assets.sql` اضافه شده‌اند. upload تصویر اکنون metadata شامل `asset_id`، `storage_key` و checksum برمی‌گرداند. قرارداد موبایل در `docs/API_CONTRACT_MOBILE_FA.md` است. قبل از native app، Docker را روشن کن، `npm run db:migrate` و `npm test` را اجرا کن و سپس production object storage را انتخاب کن.
## آخرین handoff - Sprint 88

Sprint 88 تکمیل شده است. ریشه پروژه `eas.json` با profileهای development، preview و production دارد. دستور ساخت development APK برابر `npm run mobile:build:android:development` است. `apps/mobile/app.json` plugin اعلان و placeholder `extra.eas.projectId` دارد؛ قبل از build واقعی باید `eas init` اجرا شود و مقدار `REPLACE_WITH_EAS_PROJECT_ID` با شناسه واقعی جایگزین شود. cloud build در این turn اجرا نشد چون login و credentials EAS در محیط موجود نیست. `npx expo export --platform android` موفق است.

Hotfix 88.1: خطای Metro برای `expo-notifications/build/NotificationsEmitter` با نصب فعلی بررسی شد؛ فایل emitter در `node_modules` موجود است و `npx expo export --platform android` پس از cache reset موفق شد. placeholder projectId از `app.json` حذف شده است تا EAS آن را به‌عنوان UUID نامعتبر نخواند.

Hotfix 88.2: `notifications.ts` خطای Firebase/FCM را به پیام قابل‌فهم تبدیل می‌کند و بدون projectId معتبر token نمی‌گیرد. کپچای mobile auth اکنون input پاسخ دارد و مقدار واردشده را برای `captcha-proof` ارسال می‌کند.

گام بعدی: ساخت EAS Development APK روی حساب واقعی، نصب روی Pixel emulator/device، تست permission/token، ارسال پیام از کاربر دیگر و بررسی deep-link اعلان.

## آخرین handoff - Sprint 87

Sprint 87 تکمیل شده است. `EXPO_PUSH_API_URL` در config API اضافه شده و default آن endpoint رسمی Expo است؛ در تست می‌توان آن را به mock provider تغییر داد. `parseExpoPushTickets` پاسخ malformed را به آرایه امن تبدیل می‌کند و delivery از URL config برای send و getReceipts استفاده می‌کند.

گام بعدی: EAS Development Build اندروید، تست واقعی permission/token/deep-link و سپس worker دائمی production.

## آخرین handoff - Sprint 86

Sprint 86 تکمیل شده است. endpoint مدیریتی `GET /api/v1/admin/notifications/outbox-summary` در `apps/api/src/server.ts` اضافه شده و فقط `moderator` می‌تواند آن را ببیند. پاسخ شامل `counts` بر اساس status و `last_failures` با ۱۰ خطای اخیر است.

گام بعدی: اتصال این diagnostic به پنل ادمین، provider mock integration test و سپس build واقعی EAS برای تست اعلان روی Android.

## آخرین handoff - Sprint 85

Sprint 85 تکمیل شده است. `outbox-worker.ts` قبل از پردازش، jobهای `processing` قدیمی‌تر از ۵ دقیقه را recover می‌کند. خطاهای delivery با backoff نمایی از ۳۰ ثانیه تا سقف ۱۵ دقیقه دوباره pending می‌شوند. command worker تعداد jobهای processed و recovered را چاپ می‌کند.

گام بعدی: worker دائمی با loop کنترل‌شده، metrics، lock strategy بهتر و integration test provider.

## آخرین handoff - Sprint 84

Sprint 84 تکمیل شده است. جدول `notification_outbox` در migration `0019_notification_outbox.sql` ساخته شده است. هنگام پیام جدید، API فقط job را ثبت می‌کند. `apps/api/src/modules/notifications/outbox-worker.ts` jobهای pending را claim می‌کند، delivery را اجرا می‌کند، به sent می‌برد یا با delay دوباره pending می‌سازد. اجرای دستی/cron با `npm run notifications:worker` است.

گام بعدی: worker دائمی یا process manager، recovery برای jobهای stuck در processing، retry با backoff واقعی، metrics و integration test با provider mock.

## آخرین handoff - Sprint 83

Sprint 83 تکمیل شده است. `push-delivery.ts` بعد از دریافت ticket از Expo، receiptها را با endpoint `getReceipts` بررسی می‌کند. خطاها در `native_failed` گزارش می‌شوند و receipt با `DeviceNotRegistered` باعث revoke token می‌شود. این polling best-effort است و به مسیر اصلی ارسال پیام خطا منتقل نمی‌کند.

گام بعدی: انتقال delivery به queue/worker durable، retry محدود با backoff، batch کردن tokenها و integration test با provider قابل mock.

## آخرین handoff - Sprint 82

Sprint 82 تکمیل شده است. در `apps/api/src/modules/notifications/push-delivery.ts` ارسال native tokenهای Expo به `https://exp.host/--/api/v2/push/send` اضافه شده است. payload شامل `conversationId` و `url` است تا tap اعلان در موبایل گفتگو را باز کند. Web Push با VAPID و native push مستقل هستند. tokenهای `DeviceNotRegistered` با repository revoke می‌شوند و failure provider پیام چت را fail نمی‌کند.

گام بعدی: receipt polling یا queue/worker برای delivery قابل اعتماد، retry محدود، EAS development build و تست واقعی روی دستگاه Android با token معتبر.

## آخرین handoff - Sprint 81

Sprint 81 تکمیل شده است. migration `db/migrations/0018_native_push_tokens.sql` جدول توکن‌های native را ایجاد می‌کند. API در `apps/api/src/server.ts` endpointهای `POST` و `DELETE` روی `/api/v1/me/native-push-tokens` دارد و فقط کاربر authenticated و mobile-verified می‌تواند token Expo را ثبت یا revoke کند. repository و Kysely types نیز به‌روز شده‌اند. موبایل بعد از گرفتن token، ثبت آن را best-effort انجام می‌دهد و failure سرور مانع فعال‌شدن local notification نمی‌شود.

گام بعدی: adapter ارسال Expo Push یا FCM/APNs، worker یا queue برای delivery، ثبت `conversationId` در payload، revoke خودکار tokenهای expired و تست integration با EAS development build.

## آخرین handoff - Sprint 80

Sprint 80 تکمیل شده است. در `apps/mobile/notifications.ts` foundation اعلان native با `expo-notifications` قرار دارد: permission، کانال Android، دریافت و ذخیره local Expo token و handler اعلان foreground. در `apps/mobile/App.tsx` پاسخ به tap اعلان، `conversationId` را به deep-link state موجود وصل می‌کند و گفتگو را در inbox باز می‌کند. `apps/mobile/app.json` نیز plugin اعلان را دارد.

برای ادامه، ابتدا باید native push واقعی را کامل کرد: ساخت EAS development build، تنظیم FCM/APNs، ایجاد endpoint و migration برای نگهداری Expo/native token، سپس ارسال push از API هنگام پیام جدید و تغییر وضعیت آگهی. در Expo Go ممکن است دریافت token واقعی یا push remote محدود باشد؛ خطا باید به‌صورت graceful در UI نمایش داده شود.

آخرین validation موفق: `npm run check`، `npm run build`، `npm run typecheck -w @four-d/mobile`، `npx expo config --json` و `npx expo export --platform android`.

## آخرین handoff - Sprint 79

Sprint 79 تکمیل شده است. موبایل deep link با scheme `four-d` را می‌خواند و لینک `four-d://conversation/{id}` را به inbox و thread همان گفتگو هدایت می‌کند. این رفتار هم در cold start و هم foreground فعال است. تصویر چت پیش از upload باید کمتر از ۲MB باشد.

## آخرین handoff - Sprint 78

Sprint 78 تکمیل شده است. چت موبایل تصویر را از گالری انتخاب می‌کند، به `/api/v1/media/listing-images` upload می‌کند و URL را به‌عنوان پیام ارسال می‌کند؛ thread پیام تصویری را با `Image` نمایش می‌دهد. گام بعد: deep link گفتگو و push polish.

## آخرین handoff - Sprint 77

Sprint 77 تکمیل شده است. endpoint history اکنون برای هر پیام `read_by_recipient` را با مقایسه `conversation_reads` برمی‌گرداند و موبایل وضعیت «ارسال شد/خوانده شد» را نشان می‌دهد. polling و کنترل‌های mute/block/report فعال هستند. گام بعد: attachment تصویر و notification polish.

## آخرین handoff - Sprint 76

Sprint 76 تکمیل شده است. thread موبایل هر ۱۵ ثانیه پیام‌ها را refresh می‌کند و کنترل‌های mute، block و report message دارد. endpointهای مورد استفاده: preferences، block و reports. گام بعد: read receipts، attachment و notification polish.

## آخرین handoff - Sprint 75

Sprint 75 تکمیل شده است. Inbox موبایل اکنون به thread واقعی متصل است: `GET /api/v1/conversations/:conversationId/messages` برای history و `POST /api/v1/conversations/:conversationId/messages` برای ارسال پیام استفاده می‌شود. پیام‌های کاربر و طرف مقابل جدا نمایش داده می‌شوند. گام بعد: polling سبک، mute/block و گزارش پیام.

## آخرین handoff - Sprint 74

Sprint 74 تکمیل شده است. فرم ویرایش آگهی موبایل به `PUT /api/v1/me/contents/:contentId` متصل است و بعد از تغییر عنوان/توضیحات، آگهی برای بررسی مجدد ارسال می‌شود. حذف soft-delete نیز فعال است. گام بعد: message thread کامل.

## آخرین handoff - Sprint 73

Sprint 73 تکمیل شده است. profile موبایل اکنون دو تب دارد: اطلاعات حساب و آگهی‌های من؛ به همین دلیل صفحه دیگر فقط آگهی‌ها را نشان نمی‌دهد. وب در `apps/web/src/phase73.css` یک visual pass برندمحور با motion کنترل‌شده و reduced-motion دارد. گام بعد: فرم ویرایش آگهی موبایل و message thread کامل.

## آخرین handoff - Sprint 72

Sprint 72 تکمیل شده است. APIهای مالکیت‌محور ویرایش و حذف آگهی اضافه شده‌اند: `PUT /api/v1/me/contents/:contentId` و `DELETE /api/v1/me/contents/:contentId`. حذف soft-delete است و ویرایش status را دوباره `submitted` می‌کند. موبایل حذف با تایید کاربر و refresh لیست را دارد. گام بعد: فرم ویرایش موبایل و message thread.

## آخرین handoff - Sprint 71

Sprint 71 تکمیل شده است. پروفایل موبایل علاوه بر hydrate اطلاعات کاربر، اکنون آگهی‌های من را از `GET /api/v1/me/contents` می‌خواند و وضعیت هر آگهی را نمایش می‌دهد. گام بعدی مصوب: عملیات ویرایش/حذف آگهی، سپس message thread کامل.

## آخرین handoff - Sprint 70

Sprint 70 تکمیل شده است. صفحه پروفایل موبایل از `/api/v1/me` داده واقعی می‌گیرد، فرم را با اطلاعات دیتابیس پر می‌کند، وضعیت موبایل/رمز/کامل‌بودن حساب را نشان می‌دهد و متن‌های آن فارسی است. لوگوی رسمی در profile استفاده می‌شود. گام بعدی: آگهی‌های من و message thread کامل.

## آخرین handoff - Sprint 69

Sprint 69 تکمیل شده است. موبایل اکنون profile onboarding و تنظیم رمز واقعی دارد و asset لوگوی افقی رسمی در `apps/mobile/assets/4d-logo-horizontal.png` قرار گرفته است. برای تست password login ابتدا با SMS وارد شو، پروفایل را با نام، نام خانوادگی و رمز حداقل ۸ کاراکتری ذخیره کن، سپس logout و password login را تست کن.

## آخرین handoff - Sprint 67

Sprint 67 تکمیل شده است. `apps/mobile` برای feed، detail، OTP، image upload، listing create، contact intent، conversations و logout آماده است. اجرای development با `npm run dev:mobile` و smoke export با `npx expo export --platform android` انجام می‌شود. router محدود داخلی به‌دلیل خطای Fabric در `react-native-screens` عمدی است. پیش از release، تست دستگاه واقعی و بررسی 17 مورد npm audit لازم است.

Hotfix runtime: React در root و workspaceها روی `19.0.0` قفل شده و override قدیمی `newArchEnabled: false` حذف شده است؛ این دو تغییر خطای invalid hook و هشدار Expo Go را برطرف می‌کنند.

فاز بعدی: profile onboarding، message thread کامل، device QA و build قابل نصب Android.

## آخرین وضعیت Sprint 65

Object Storage واقعی با `@aws-sdk/client-s3` اضافه شده است. برای local مقدار `MEDIA_STORAGE_PROVIDER=local` و برای production مقدار `s3` به‌همراه `MEDIA_S3_BUCKET`، `MEDIA_S3_REGION`، credentials و `MEDIA_S3_PUBLIC_BASE_URL` تنظیم شود. production با local provider fail-fast می‌کند. قرارداد موبایل در `docs/API_CONTRACT_MOBILE_FA.md` است و گام بعدی native mobile shell است.
## آخرین وضعیت Sprint 66

native shell در `apps/mobile` ساخته شده است. اجرای آن:

```powershell
npm run dev:mobile
```

متغیر `EXPO_PUBLIC_API_BASE_URL` برای دستگاه واقعی باید به آدرس قابل دسترس API تنظیم شود؛ `127.0.0.1` فقط برای emulator/device setup مناسب است. scope فعلی: feed، detail، OTP auth و profile. admin همچنان روی Web است.

برای Android Emulator استاندارد، مقدار توسعه `http://10.0.2.2:4000` است و API باید با `API_HOST=0.0.0.0` اجرا شود. بعد از تغییر `.env`، Metro را با `npm run dev:mobile -- --clear` دوباره اجرا کن.
