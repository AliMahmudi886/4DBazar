# وضعیت پروژه 4D

## آخرین increment — Development Sprint 123

تمدید خودکار نشست در وب و موبایل فعال شد: پاسخ 401 با refresh token چرخشی، یک‌بار retry می‌شود و refreshهای هم‌زمان coalesce می‌شوند تا loop ایجاد نشود. در صورت شکست، نشست منقضی باقی می‌ماند و ورود مجدد لازم است. check، ۵۶ تست API، typecheck موبایل، web build و APK release سبز هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_123_AUTO_REFRESH_FA.md`.

## آخرین increment — Development Sprint 122

پایه Refresh Token چرخشی اضافه شد: migration `0027_session_refresh_tokens.sql`، صدور refresh token هنگام ورود و endpoint امن `POST /api/v1/auth/refresh` با revoke token قبلی. check و ۵۶ تست API و typecheck موبایل سبز هستند. اتصال retry خودکار کلاینت‌ها و اجرای migration روی cPanel هنوز باز است. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_122_REFRESH_TOKEN_FOUNDATION_FA.md`.

## آخرین increment — Development Sprint 121

نشست موبایل سخت‌سازی شد: token در SecureStore ذخیره می‌شود، token قدیمی AsyncStorage به‌صورت خودکار migrate می‌شود و خروج هم revoke سمت API و هم پاک‌سازی storage را انجام می‌دهد. APK محلی نسخه `0.1.13` با `versionCode=17` با موفقیت ساخته شد. refresh token و تست گوشی واقعی هنوز باز هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_121_MOBILE_SESSION_SECURITY_FA.md`.

## آخرین increment — Development Sprint 120

قرارداد خطاهای Auth بین API، وب و موبایل یکسان شد: خطای شماره، OTP و رمز عبور اکنون کد و پیام مستقل دارند و خطاهای credential دیگر به‌عنوان خطای اتصال نمایش داده نمی‌شوند. پاسخ `/api/v1/me` شماره حساب صاحب نشست را نیز برمی‌گرداند. check، ۵۵ تست API، build وب و typecheck موبایل سبز هستند. refresh token، secure storage native و smoke ورود روی مقصد در incrementهای بعدی باقی مانده‌اند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_120_AUTH_CONTRACT_SESSION_FA.md`.

## Current Phase

Development Sprint 116 - Hosted API Origin and Cache Hardening

## Load Test 300 Users

طرح تست و harness محلی آماده است؛ اجرای ramp-up واقعی به‌دلیل در دسترس نبودن Docker/PostgreSQL تستی متوقف شده و روی production اجرا نمی‌شود. گزارش: `docs/testing/LOAD_TEST_300_USERS_FA.md`.

## Sprint 92 Increment

پایه‌ی قابلیت‌های درخواستی بازار خدمات و اعتماد در کد اضافه شد: migration روستاها و پشتیبانی، مدل رسانه‌ی چندگانه (۶ عکس و ۱ ویدیو)، endpointهای پشتیبانی، فهرست کاربران و احراز ادمین، حذف ادمینی آگهی و مسیر ثبت آگهی موبایل/وب. این increment هنوز برای انتشار نهایی نیست؛ UI کامل پنل ادمین، اتصال native چندرسانه‌ای و تأیید رسمی فهرست روستاها باید در ادامه‌ی Sprint 92 تکمیل و روی دیتابیس/هاست smoke شود.

## Current Sprint

در Sprint 101 مسیر نوشتن آگهی با migration ترمیمی و fallback schema پایه اصلاح شد و طبق smoke مقصد، release `v0.1.24-2026-08-23` آگهی‌های قبلی و جدید را دوباره نمایش می‌دهد. Sprint 102 طراحی یکپارچه، Sprint 103 هسته API حمل‌ونقل و Sprint 105 تجربه وب حمل‌ونقل را تکمیل کردند. در Sprint 106 launcherها هم‌تراز شدند، جست‌وجوی پیشرفته‌ی بسته‌شونده اضافه شد و dataset توسعه‌ای ۳۰۰ کاربر/۹۰۰ محتوا/۲۴ غرفه ساخته شد. Sprint 108 مسیر فرم و پنل را اصلاح کرد؛ Sprint 109 اندازه رسانه، گالری رسانه ادمین، حذف مقاوم و محدودیت ویرایش ۲۴ساعته را تکمیل کرد. Sprint 110 قاب رسانه و صفحه جزئیات را بازطراحی کرد. Sprintهای 111 تا 113 حذف نرم، runtime محلی و درخواست‌های بدون body را مقاوم کردند. Sprint 114 policy مشترک دسته‌آگاه را به Web/API افزود، فیلدهای نامرتبط را حذف و صفحه جزئیات آگهی را با گالری، metadata و CTAهای responsive بازطراحی کرد. Sprint 115 feed production را از داده‌ی نمایشی جدا و cleanup بازار را اضافه کرد. Sprint 116 fallback آدرس API در build production، cache-busting Service Worker و release جفت `v0.1.34-2026-08-25` را تکمیل کرد؛ smoke مقصد cPanel پس از upload و پاک‌سازی cache مرورگر باز است.

## Sprint 91 Progress

- سیستم طراحی مشترک Web/Mobile در `docs/DESIGN_SYSTEM_FA.md` ثبت و روی بازار اصلی اعمال شد: canvas خنثی، Navy/Teal برند، accent محدود Gold/Coral، radius هشت و motion قابل کاهش.
- فرم ذخیره پروفایل در Web/Mobile در برابر شهرهای stale مقاوم شد؛ API اکنون شهر نامعتبر را قبل از خطای دیتابیس با پیام قابل‌فهم رد می‌کند.
- taxonomy بازار از پنج دسته پایه به مجموعه کاربردی‌تر کالا، املاک، خودرو، خدمات، استخدام، آموزش، زیبایی، کشاورزی و کسب‌وکار گسترش یافت.
- hero banner برندمحور برای بازار وب تولید و در `apps/web/public/brand/4d-market-banner.png` اضافه شد؛ متن فارسی به‌صورت HTML روی تصویر قرار می‌گیرد.
- همان banner در بازار موبایل نیز به‌صورت تصویر کم‌کنتراست و بدون مزاحمت برای feed اضافه شد.
- Web بازار بازطراحی شد: hero فشرده، feed تصویری برجسته، فیلتر responsive و قابل جمع‌شدن، پاک‌سازی فیلتر و navigation پایین موبایل اضافه شد.
- Mobile بازار اکنون جستجو، دسته‌بندی افقی، کارت‌های تصویری دو ستونه و bottom navigation برجسته دارد؛ جهت حباب چت و drag پازل RTL نیز اصلاح شد.
- پس از بازطراحی، Chromium و WebKit در مجموع ۱۸ سناریوی responsive/Axe پاس شدند؛ rerun موتور Firefox به‌دلیل خرابی binary محلی Playwright در tracker باز است.
- OTP موبایل اکنون از hint رسمی Autofill سیستم‌عامل استفاده می‌کند و پس از تکمیل ۶ رقم، verify را یک‌بار به‌صورت خودکار اجرا می‌کند؛ مجوز کامل خواندن پیامک اضافه نشده است.
- preview APK نسخه `0.1.0` با `versionCode=2` و API production توسط EAS ساخته شد.
- فایل `release/mobile/4d-bazar-preview-v0.1.0-build2.apk` روی emulator نصب و بدون Metro اجرا شد.
- launcher icon رسمی، صفحه ورود و پازل mobile از نظر بصری تایید شدند.
- ممیزی جامع وب/API/موبایل در `docs/RELEASE_READINESS_AUDIT_FA.md` ثبت شد؛ build، typecheck، ۵۰ تست و release preflight موفق‌اند.
- quality gate جدید ۲۷ سناریو را در Chromium، Firefox و WebKit روی موبایل، تبلت و دسکتاپ با Axe و overflow detection پاس کرد.
- SEO/PWA، accessibility، headerهای امنیتی، اعتبارسنجی واقعی فایل تصویر، redaction لاگ و stateهای responsive ارتقا یافتند.
- `npx expo-doctor` هر ۱۸ بررسی را پاس می‌کند و مجوز میکروفون غیرضروری از image picker حذف شد.
- تست روی چند گوشی واقعی، smoke ورود/آگهی/چت و جمع‌آوری بازخورد همچنان باقی است.
- در hardening فرم ثبت آگهی، حالت قیمت ثابت/توافقی و اعتبارسنجی مبلغ یکسان در UI و API شد؛ مبلغ ثابت با جداکننده هزارگان نمایش داده می‌شود.
- URLهای نسبی تصویر در Web به origin API تبدیل می‌شوند تا تصویر آپلودشده بعد از refresh نیز در کارت و جزئیات آگهی دیده شود؛ فرم باریک نیز تک‌ستونه و responsive شد.
- اسکریپت release اکنون بسته‌های cPanel را با نسخه و تاریخ تولید می‌کند؛ آخرین خروجی محلی `v0.1.2` است و پس از smoke runner باید با نسخه بعدی بازسازی شود.
- برای local media یک ابزار رایگان backup/verify با manifest و SHA-256 اضافه شد؛ انتقال به Object Storage فعلاً انجام نمی‌شود.
- runner مستقل `npm run smoke:hosted` برای بررسی endpointهای عمومی و CORS روی API واقعی اضافه شد؛ سناریوهای وابسته به OTP و حساب کاربر هنوز نیازمند اجرای دستی هستند.
- runner امن `npm run smoke:hosted:auth` برای بررسی read-only حساب، پروفایل، آگهی‌های من و گفتگوها اضافه شد؛ token از محیط خوانده می‌شود و چاپ نمی‌شود.
- دستور `npm run media:restore` برای restore کنترل‌شده تصاویر محلی با checksum اضافه شد؛ Object Storage همچنان deferred است.
- preflight موبایل با بررسی EAS، asset لوگو و API production اضافه شد؛ ساخت APK نهایی هنوز به اجرای EAS و تست دستگاه واقعی نیاز دارد.
- preview APK جدید با `versionCode=3` روی EAS ساخته و روی emulator `Pixel_2_API_36` نصب و اجرا شد؛ لوگوی رسمی، صفحه ورود و پازل در نسخه مستقل بررسی شدند و لاگ fatal ثبت نشد.
- backup و restore واقعی local media روی cPanel انجام شد؛ ۷ فایل با حجم ۲۳۶۶۳۳ بایت ساخته، verify و restore شدند و checksumها پاس شدند.

## Storefront Foundation

Gap Analysis و مرزبندی MVP غرفه در `docs/STOREFRONT_GAP_ANALYSIS_FA.md` ثبت شده و migration `0022_storefronts.sql` به‌همراه مدل و API هسته در حال تکمیل است. این قابلیت public storefront را از پروفایل کسب‌وکار جدا نگه می‌دارد و فعال‌شدن آن را به moderation وابسته می‌کند.

## Next Approved Product Sprint

Development Sprint 98 برای smoke واقعی cPanel، گالری چندرسانه‌ای، صفحه عمومی غرفه، moderation و auth اجرا می‌شود. پس از آن Sprint 99 برای performance/security و سناریوهای نوشتنی ۳۰۰ کاربر است. تعرفه و پرداخت واقعی، object storage و FCM همچنان تا تصمیم/اعتبار لازم deferred هستند.

## Overall Status

Phase 0 تا Phase 10 تکمیل شده‌اند. Development Sprint 1 تا 9 پایه‌های اجرایی، دیتابیس، auth، moderation، تایید آگهی و logout را ساختند. Development Sprint 10 برای کاهش خشکی UI انجام شد، Development Sprint 11 visual QA خودکار را اضافه کرد، Development Sprint 12 guardهای production auth را سخت‌تر کرد، Development Sprint 13 مسیر مستقیم ادمین را از بازار عمومی جدا کرد، Development Sprint 14 adapter واقعی SMS OTP را آماده کرد، Development Sprint 15 اتصال اختصاصی Kavenegar را اضافه کرد، Development Sprint 16 ابزار smoke واقعی SMS را ساخت، Development Sprint 17 ارسال واقعی SMS با Kavenegar را smoke کرد، Development Sprint 18 خواندن `.env` ریشه را برای smoke script اصلاح کرد، Development Sprint 19 UI ادمین را به نقش واقعی moderator وصل کرد، Development Sprint 20 ذخیره OTP challenge در PostgreSQL را اضافه کرد، Development Sprint 21 cleanup/rate-limit مسیر OTP را ساخت، Development Sprint 22 polish بتای UI را جلو برد، Development Sprint 23 deploy readiness/CI را آماده کرد، Development Sprint 24 ورود واقعی کاربر و تفکیک تجربه ادمین/کاربر را نهایی کرد، Development Sprint 25 تجربه عمومی، ثبت‌نام/ورود، عکس آگهی و کپچای پازلی را اصلاح کرد، Development Sprint 26 فضای کاربر، آگهی‌های من و گفتگوهای داخل برنامه را واضح‌تر کرد، Development Sprint 27 پایه نصب‌پذیری موبایل/PWA و استراتژی اپ موبایل را اضافه کرد، Development Sprint 28 ذخیره base64 عکس در رکورد آگهی را با upload و media URL محلی جایگزین کرد، Development Sprint 29 ارسال OTP را به captcha proof امضاشده و یک‌بارمصرف سمت سرور وابسته کرد، Development Sprint 30 تلاش‌های ناموفق ورود با رمز را rate limit کرد و Development Sprint 31 کپچای پازلی ورود را از نظر microinteraction و polish بصری ارتقا داد.

## Last Completed

- Development Sprint 101: اصلاح 500 هنگام ثبت آگهی در دیتابیس‌های cPanel با migration ترمیمی `0024_listing_runtime_repair.sql`، fallback درج روی schema پایه، و تبدیل خطاهای رسانه به validation قابل فهم؛ check/build/test سبز.

- Development Sprint 97: گالری چندعکسی کارت/جزئیات/غرفه، لینک مشاهده غرفه، شمارنده بازدید آگهی، حذف کارت حریم خصوصی تحلیل‌ها و Portal مستقل پشتیبانی؛ check/build/test سبز و releaseهای cPanel `v0.1.17-2026-08-22` ساخته شد.

- Development Sprint 98: smoke عمومی مقصد شامل health، readiness، دسته‌ها، شهرها، feed، کپچا و CORS سبز شد؛ اطلاعات مالک به صف غرفه ادمین اضافه و صف جمع‌شونده شد؛ release جفت `v0.1.18-2026-08-22` ساخته و preflight شد.

- Development Sprint 90: تکمیل detail، profile و inbox/chat موبایل، بهبود dialog و تصویر چت وب، حذف fixture و success ساختگی از production، network-first کردن Service Worker، محدودسازی CORS و ساخت بسته مستقل و ZIPهای دقیق cPanel برای وب و API.
- Development Sprint 89: اصلاح جهت پازل وب و موبایل، جایگزینی ورودی عددی با drag puzzle واقعی، اتصال پیش‌فرض build موبایل به API زنده، آیکن و splash رسمی، بازطراحی auth/market/navigation و تبدیل فرم ثبت آگهی موبایل به فرم متصل به شهرها و دسته‌بندی‌های دیتابیس.
- Development Sprint 32: اضافه شدن `conversation_reads`، unread count، preview آخرین پیام، read-on-open و polling سبک ۳۰ ثانیه‌ای برای inbox گفتگوها.
- Development Sprint 33: گزارش مستقیم پیام داخل چت، اعتبارسنجی دسترسی participant برای report پیام و نمایش preview پیام گزارش‌شده در پنل moderation.
- Development Sprint 34: اضافه شدن `conversation_preferences`، mute/unmute گفتگو، حذف گفتگوهای mute شده از badge پیام جدید و تست validation تنظیمات گفتگو.
- Development Sprint 35: اضافه شدن `conversation_blocks`، block/unblock گفتگو، جلوگیری API از ارسال پیام در گفتگوی blocked و ثبت error code مشترک `conversation_blocked`.
- Development Sprint 36: اضافه شدن notification tray داخل برنامه، درخواست اجازه اعلان مرورگر و تشخیص پیام جدید unmuted/unblocked در polling گفتگوها.
- Development Sprint 37: اضافه شدن جدول `push_subscriptions`، API ثبت/لیست/revoke subscription دستگاه، دکمه آماده‌سازی Push واقعی در وب و handlerهای `push`/`notificationclick` در service worker.
- Development Sprint 38: اضافه شدن ارسال best-effort Web Push هنگام پیام جدید چت، پشتیبانی از VAPID در API، skip امن در نبود کلیدها و revoke خودکار subscriptionهای invalid.
- Development Sprint 39: اضافه شدن دستور `npm run push:vapid` برای ساخت کلیدهای VAPID بدون وابستگی به سایت خارجی و تکمیل راهنمای فعال‌سازی Push واقعی در `.env`.
- Development Sprint 40: اضافه شدن endpoint تست Push برای حساب واردشده، دکمه «ارسال تست Push» در پروفایل و پیام‌های diagnostic برای skipped/sent/expired subscription.
- Development Sprint 41: اصلاح Vite web برای خواندن `.env` ریشه پروژه با `envDir`، تزریق شدن `VITE_VAPID_PUBLIC_KEY` در web bundle و تایید نشدن leak کلید private سمت وب.
- Development Sprint 42: جدا کردن vendor chunkهای React و iconها در build وب، حذف warning اندازه chunk و کاهش بزرگ‌ترین JS bundle از حدود 501KB به حدود 457KB.
- Development Sprint 43: اضافه شدن `npm run bundle:check` برای کنترل خودکار بودجه JavaScript bundle وب، آستانه 480KB برای بزرگ‌ترین chunk، آستانه 560KB برای مجموع JS و اتصال آن به `ci:local`.
- Development Sprint 44: جدا شدن پنل ادمین به `AdminWorkspace` با dynamic import، اضافه شدن fallback سبک با `React.Suspense` و کاهش chunk اصلی وب به حدود 450KB.
- Development Sprint 45: تثبیت برش lazy ادمین با حذف import اضافه `Inbox` از `main.tsx`، حفظ chunk جداگانه `AdminWorkspace` و تایید دوباره check/build/bundle/test/visual QA.
- Development Sprint 46: حذف کامل JSX قدیمی ادمین از `main.tsx` که بعد از lazy split پشت شرط `false` مانده بود، کاهش اندازه فایل اصلی و تایید build/budget/visual QA؛ دو تست rate-limit برای اجرای مجدد پس از روشن شدن PostgreSQL باقی مانده‌اند.
- Development Sprint 47: انتقال profile workspace به `ProfileWorkspace` و chat drawer به `ChatWorkspace`، حفظ callbackها و stateهای موجود، کاهش `main.tsx` به حدود ۱۸۹۵ خط و تایید check/build/bundle/visual QA.
- Development Sprint 48: تبدیل profile و chat به `React.lazy`، افزودن fallbackهای سبک برای حساب و چت، تولید chunk مستقل برای هر workspace و تایید check/build/bundle/visual QA.
- Development Sprint 49: افزودن پیام‌های قابل‌بستن، بازخورد مرحله‌ای فرم ثبت آگهی، header خواناتر چت، وضعیت loading چت و بهبود کنترل‌های responsive؛ تایید check/build/bundle/visual QA.
- Development Sprint 50: اجرای responsive QA در viewportهای ۳۹۰×۸۴۴ و ۱۴۴۰×۹۰۰ بدون horizontal overflow، اصلاح labelهای خراب فرم ثبت آگهی، تایید PWA shell و اجرای check/build/bundle/visual QA برای beta gate.
- Development Sprint 51: حذف secret واقعی از `.env.example`، افزودن `npm run release:check` با حالت strict production، مستندسازی storage/deploy و تکمیل release checklist.
- Development Sprint 52: افزودن فیلتر حداقل/حداکثر قیمت و مرتب‌سازی جدیدترین/ارزان‌ترین/گران‌ترین در بازار، تایید build/bundle/visual QA و ثبت roadmap توسعه محصولی بعدی.
- Development Sprint 53: افزودن favorite persisted با migration/API/UI و دستیار هوشمند بررسی کیفیت آگهی با local fallback، به‌همراه تست unit مستقل AI.
- scan اولیه repository
- تشخیص نبود فایل‌های پروژه و نبود `.git`
- ایجاد ساختار مستندات
- ایجاد README و AGENTS
- ایجاد roadmap، tracker، risk register، decision log، tech debt و unknowns
- ایجاد گزارش تکمیل Phase 0
- ایجاد Product Discovery
- نقد و اصلاح Vision
- تعریف Problem Statement، Personas، JTBD، Value Proposition، Product Pillars، Marketplace Model، Core Metrics و Hypotheses
- ایجاد گزارش تکمیل Phase 1
- ایجاد Market Research و Competitor Analysis نسخه desk research
- تحلیل Divar، Sheypoor، Facebook Marketplace، Craigslist، OfferUp و جایگزین‌های محلی
- ایجاد gap analysis، opportunity map، category recommendation و cold start recommendation
- ایجاد گزارش تکمیل Phase 2
- ایجاد Product Strategy
- تعریف positioning، differentiation، category strategy، local strategy، cold start، trust، monetization، growth و metrics strategy
- ایجاد گزارش تکمیل Phase 3
- ایجاد PRD MVP
- تقسیم featureها به P0/P1/P2/P3
- نوشتن user story و acceptance criteria برای P0ها
- تعریف success metrics و non-goals MVP
- ایجاد گزارش تکمیل Phase 4
- ایجاد UX Design
- طراحی sitemap، navigation، screen list و جریان‌های اصلی
- طراحی flowهای listing، wanted، service، search، chat/contact، report و moderation
- ایجاد گزارش تکمیل Phase 5
- ایجاد Domain Model
- تعریف entityها، aggregateها، relationshipها، domain boundaries، business rules و domain events
- ایجاد گزارش تکمیل Phase 6
- ایجاد Database & API Design
- طراحی schema، indexها، constraintها، API contract، error contract، pagination/filtering/sorting و security سطح API
- ایجاد گزارش تکمیل Phase 7
- ایجاد System Architecture
- تثبیت معماری Modular Monolith، runtime components، moduleها، dependency rules، storage/media، search، chat/contact، caching، deployment و observability
- ایجاد گزارش تکمیل Phase 8
- ایجاد Security & Trust
- طراحی threat model، moderation policy، abuse prevention، trust architecture، admin security و security requirements
- ایجاد گزارش تکمیل Phase 9
- ایجاد Development Foundation
- انتخاب TypeScript monorepo، Fastify برای API و Vite + React برای web/admin shell
- ایجاد scaffold، CI، testing infrastructure، config validation، logging/error handling و base security skeleton
- اجرای موفق build، typecheck و test
- ایجاد گزارش تکمیل Phase 10
- پیاده‌سازی endpoint `GET /api/v1/me/contents`
- ارتقای web shell از صفحه ساده به تجربه marketplace با جستجو، فیلتر شهر/دسته، وضعیت API/DB، کارت‌های آگهی، فرم ثبت، fallback نمایشی و micro-interactionهای نرم
- اجرای موفق build، typecheck و test پس از ارتقای UI
- اتصال endpoint فید عمومی `GET /api/v1/feed` به repository محتوای persisted با fallback امن در نبود DB
- افزودن پنل جزئیات آگهی، شروع تماس امن MVP و report flow نمایشی در UI
- افزودن migration برای `contact_events`، `reports` و `moderation_cases`
- پیاده‌سازی APIهای `POST /api/v1/contact-intents` و `POST /api/v1/reports`
- اتصال moderation queue پایه به `moderation_cases`
- اتصال UI تماس/گزارش به API واقعی همراه با fallback نمایشی
- افزایش تست‌های API/security به ۱۰ تست و اجرای موفق check/build/test
- رفع تداخل پورت PostgreSQL با تغییر host port پروژه به `55432`
- اجرای موفق Docker PostgreSQL، migration و seed واقعی
- seed کردن آگهی‌های نمونه marketplace با IDهای ثابت، از جمله «کولر آبی سالم»
- smoke test واقعی `contact-intents`، `reports`، `moderation_cases` و `audit_logs` روی PostgreSQL
- اتصال audit logger به `audit_logs` به صورت best-effort در کنار console logging
- افزایش تست‌های API/security به ۱۱ تست و اجرای موفق check/build/test
- افزودن OTP stub endpoints برای request/verify
- ساخت session token و ذخیره hash نشست در جدول `sessions`
- پشتیبانی API از `Authorization: Bearer`
- افزودن endpoint `GET /api/v1/me`
- اتصال web به ورود سریع توسعه‌ای و استفاده از Bearer token برای آگهی، تماس و گزارش
- smoke test live برای OTP، session، `/me` و contact با Bearer token
- افزایش تست‌های API/security به ۱۳ تست و اجرای موفق check/build/test
- افزودن migration `moderation_decisions`
- افزودن API ثبت تصمیم moderation برای caseها
- ساخت پنل admin در web برای مشاهده report queue
- افزودن actionهای بستن گزارش، ارجاع و رد محتوا در UI
- smoke test live ثبت report، خواندن queue و ثبت decision
- افزایش تست‌های API/security به ۱۴ تست و اجرای موفق check/build/test
- افزودن migration `user_roles`
- seed کردن نقش‌های `user` و `moderator` برای کاربران توسعه
- خواندن roles از DB هنگام authentication با Bearer token
- اتصال admin queue web به Bearer token به جای header role در حالت نشست واقعی
- smoke test live `/me` و admin queue با role دیتابیسی
- افزایش تست‌های API/security به ۱۵ تست و اجرای موفق check/build/test
- محدود کردن feed عمومی به محتوای `approved`
- افزودن API صف آگهی‌های `submitted`
- افزودن API تصمیم approve/reject برای محتوای pending
- ثبت تغییر وضعیت در `content_status_history`
- افزودن بخش «آگهی‌های در انتظار» به پنل admin
- smoke test live ساخت آگهی، مشاهده در queue، تایید و ورود به feed
- افزایش تست‌های API/security به ۱۶ تست و اجرای موفق check/build/test
- افزودن `POST /api/v1/auth/logout`
- افزودن revoke نشست با مقداردهی `sessions.revoked_at`
- افزودن دکمه خروج در UI و پاک‌سازی token از localStorage
- audit کردن logout با action `auth.logout`
- smoke test live: قبل از logout `/me=200`، logout `204`، بعد از logout همان token `401`
- افزایش تست‌های API/security به ۱۸ تست و اجرای موفق check/build/test
- جداسازی فضای UI به دو تب «بازار» و «ادمین»
- افزودن hero کاربردی بازار با آمار زنده آگهی‌های منتشرشده، pending و گزارش‌های باز
- نرم‌تر کردن رنگ‌بندی، پس‌زمینه، کارت‌ها، media tileها و hoverها
- بهبود responsive behavior در موبایل برای وضعیت‌ها، تب‌ها و hero
- اجرای موفق check/build/test و smoke check وب/API پس از polish
- افزودن Playwright به web workspace
- افزودن `npm run qa:visual`
- ساخت screenshot automation برای desktop/mobile بازار و ادمین
- fallback به Chrome نصب‌شده سیستم در صورت نبود browser bundled
- کشف و رفع horizontal overflow موبایل
- خروج داده smoke test خراب از feed عمومی
- اجرای موفق visual QA، check، build و test
- ممنوع شدن `SESSION_SECRET=development-secret` در production
- ممنوع شدن `OTP_PROVIDER=stub` در production
- غیرفعال شدن header fallback در production
- برگشت 503 برای verify OTP با provider `sms` تا وقتی integration واقعی SMS پیاده نشده است
- افزودن تست‌های production guard و افزایش تست‌های API/security به ۲۱ تست
- smoke test dev live برای health، session و web پس از hardening
- افزودن route مستقیم `/admin` برای پنل ادمین
- اتصال تب‌های بازار/ادمین به history مرورگر و پشتیبانی از back/forward
- جدا شدن command band ادمین از search بازار
- به‌روزرسانی visual QA برای باز کردن مستقیم `/admin`
- اجرای موفق check، build، test و visual QA پس از تفکیک مسیر ادمین
- افزودن `OtpService` با challenge پنج دقیقه‌ای و حداکثر پنج تلاش
- اضافه شدن SMS OTP adapter با ارسال HTTP قابل تنظیم
- حذف 503 قبلی برای `OTP_PROVIDER=sms` و جایگزینی آن با مسیر request/verify واقعی
- الزام `SMS_API_URL` و `SMS_API_KEY` در production وقتی `OTP_PROVIDER=sms` است
- جلوگیری از نمایش `dev_code` در حالت SMS
- به‌روزرسانی `.env.example` برای تنظیمات SMS
- اجرای موفق check، build، test و smoke زنده auth پس از SMS adapter
- افزودن `SMS_VENDOR=kavenegar`
- اتصال REST به endpoint ارسال SMS کاوه‌نگار بدون افزودن dependency جدید
- تبدیل شماره `+98...` به `09...` برای receptor کاوه‌نگار
- الزام `SMS_SENDER` در production برای Kavenegar
- افزودن تست adapter کاوه‌نگار و افزایش تست‌های API/security به ۲۲ تست
- به‌روزرسانی راهنمای اتصال SMS برای Kavenegar
- افزودن `npm run sms:smoke`
- ساخت smoke flow تعاملی برای ارسال OTP، دریافت کد از ترمینال و verify نشست
- مستندسازی تست واقعی Kavenegar با `TEST_PHONE_NUMBER`
- اجرای موفق check، build و test پس از افزودن smoke tooling
- پاک‌سازی secret واقعی از `.env.example`
- اجرای delivery smoke واقعی Kavenegar برای شماره تست با پاسخ `202`
- تایید اینکه response حالت SMS فقط `delivery=sms` و `expires_in_seconds=300` می‌دهد و `dev_code` ندارد
- ثبت اینکه verify کد نیازمند اجرای `npm run sms:smoke` در همان process است
- اصلاح `sms:smoke` برای خواندن `D:\Projects\4D\.env` حتی وقتی npm workspace cwd را به `apps/api` تغییر می‌دهد
- افزودن پشتیبانی از `OTP_CODE` برای verify یک‌مرحله‌ای بدون prompt
- بهبود پیام خطا وقتی stdin تعاملی در دسترس نیست
- پاک‌سازی دوباره secret از `.env.example`
- اجرای موفق check، build API و test پس از اصلاح env loading
- اجرای موفق full E2E واقعی SMS OTP با Kavenegar در PowerShell کاربر
- خواندن `GET /api/v1/me` در web و ذخیره roles واقعی کاربر
- نمایش وضعیت Auth به صورت `moderator` وقتی نشست نقش moderator دارد
- افزودن حالت access boundary برای `/admin` وقتی کاربر moderator نیست
- هماهنگ کردن visual QA با حالت access boundary
- اجرای موفق check، build، test و visual QA پس از admin boundary
- افزودن migration `0005_otp_challenges.sql`
- ذخیره hash کد OTP در جدول `otp_challenges` به جای نگهداری صرفاً in-memory
- مصرف challenge با `consumed_at` پس از verify موفق
- ثبت attempts و max_attempts برای محدودیت تلاش
- production guard برای جلوگیری از fallback حافظه‌ای در صورت شکست persisted store
- اجرای migration روی PostgreSQL واقعی و smoke request/verify با challenge مصرف‌شده
- افزایش تست‌های API/security به ۲۴ تست
- افزودن phone-based rate limit برای درخواست OTP: حداکثر ۵ درخواست در ۱۰ دقیقه برای هر شماره
- cleanup خودکار OTPهای منقضی یا مصرف‌شده قبل از request جدید
- افزودن script `npm run db:cleanup:otp`
- اجرای cleanup script روی PostgreSQL واقعی
- افزودن تست rate limit شماره و افزایش تست‌های API/security به ۲۵ تست
- افزودن refresh/loading state واقعی در web
- نمایش spinner روی دکمه تازه‌سازی هنگام refresh
- افزودن skeleton card برای اولین load بازار
- نرم‌تر شدن متن‌های empty state و خطای API
- افزودن helper copy زیر عنوان فرم ثبت آگهی
- پایدار کردن تست rate limit با شماره منحصربه‌فرد
- اجرای موفق check، build، visual QA و test پس از polish
- افزودن `npm run ci:local`
- افزودن GitHub Actions workflow برای check، build، test و visual QA
- self-host شدن visual QA با preview داخلی در نبود `VISUAL_QA_URL`
- افزودن `docs/PRODUCTION_READINESS_FA.md`
- به‌روزرسانی README با وضعیت و دستورات جدید
- اجرای موفق `npm run ci:local`
- حذف auto-login توسعه‌ای از boot وب
- جایگزینی «ورود سریع» با ورود واقعی OTP شامل شماره و کد پیامکی
- افزودن workspace «حساب من» برای پروفایل، نقش‌ها و مسیر ثبت آگهی
- مخفی شدن تب ادمین برای کاربر غیر moderator
- محدود شدن fetch صف‌های ادمین به نشست دارای نقش moderator
- هدایت کاربر واردنشده به صفحه ورود برای ثبت آگهی، تماس و گزارش
- polish بصری صفحه ورود/پروفایل با انیمیشن و layout responsive
- اجرای موفق check، build، visual QA و test پس از final UX pass
- پنهان شدن pillهای فنی `API/DB/Auth` از بازار عمومی و کاربر واردنشده حتی روی مسیر مستقیم `/admin`
- تبدیل تجربه ورود به «ثبت‌نام و ورود» با ساخت خودکار حساب بعد از OTP موفق
- normalize شماره ایرانی در web و API برای حالت‌های `093...`، `938...`، `989...` و `+989...`
- اعطای نقش `moderator` به شماره ادمین از طریق `ADMIN_PHONE_NUMBERS`
- افزودن کپچای پازلی/اسلایدری client-side قبل از ارسال OTP
- افزودن عکس آگهی با preview در فرم، نمایش روی کارت و جزئیات، و ذخیره MVP در ستون `listings.image_data_url`
- تبدیل timeline فنی کنار فرم به مسیر انتشار کاربرپسند
- اجرای موفق `npm run check`، `npm run build`، `npm test`، `npm run db:migrate` و `npm run qa:visual`
- اصلاح startup API برای load کردن `.env` ریشه در dev/start تا SMS واقعی با `OTP_PROVIDER=sms` فعال شود
- ارتقای visual کپچای پازلی با قطعه jigsaw، قاب هدف، progress fill و reset puzzle
- افزودن ورود با رمز برای کاربران دارای حساب، در کنار SMS برای ثبت‌نام/فراموشی رمز
- افزودن پروفایل اجباری شامل نام، نام خانوادگی، شهر اصلی و رمز عبور
- قفل شدن ثبت آگهی تا تکمیل احراز هویت سبک پروفایل
- جایگزینی رد کردن عکس‌های معمولی با فشرده‌سازی خودکار client-side و سقف 2MB بعد از فشرده‌سازی
- بهبود مسیر شماره بدون رمز: شکست ورود با رمز کاربر را مستقیم به مسیر SMS/فراموشی رمز هدایت می‌کند
- افزایش سقف تست/ارسال OTP به ۱۰ درخواست در ۱۰ دقیقه برای جلوگیری از گیر کردن هنگام setup اولیه
- جایگزینی کپچای خطی قبلی با کپچای تصویری draggable الهام‌گرفته از `caijf/rc-slider-captcha`
- افزودن چت داخل برنامه با جدول‌های `conversations` و `conversation_messages`
- تبدیل شروع تماس واقعی به ساخت مکالمه و باز شدن chat drawer داخل UI
- اصلاح شمارنده «آگهی‌های من» برای خواندن از `GET /api/v1/me/contents` به جای feed عمومی
- نمایش لیست آخرین آگهی‌های خود کاربر در workspace پروفایل، همراه با وضعیت و قیمت
- باز شدن جزئیات آگهی‌های submitted/local خود کاربر از پروفایل، حتی وقتی در feed عمومی نیستند
- نمایش نقش خریدار/فروشنده و زمان آخرین فعالیت در لیست گفتگوهای پروفایل
- تبدیل دکمه جزئیات آگهی به «باز کردن چت» وقتی مکالمه قبلا ساخته شده است
- جلوگیری از شروع گفتگو برای آگهی منتشرنشده و نمایش پیام واضح به کاربر
- افزودن manifest، آیکن، theme color و meta tagهای موبایل برای installable web app
- افزودن service worker پایه برای cache کردن shell وب در production build
- ثبت سند `docs/MOBILE_APP_STRATEGY_FA.md` برای زمان‌بندی و stack پیشنهادی اپ موبایل
- افزودن local media store برای ذخیره فایل‌های عکس آگهی خارج از PostgreSQL
- افزودن endpoint `POST /api/v1/media/listing-images` برای آپلود عکس فشرده‌شده
- افزودن serving عمومی `/media/...` با cache header برای نمایش عکس‌ها
- تغییر frontend برای آپلود عکس قبل از submit آگهی و ذخیره URL به جای base64
- افزودن تست API برای upload/read media و افزایش تست‌های API به 27
- افزودن endpoint `GET /api/v1/auth/captcha-challenge` برای ساخت challenge ضد bot
- افزودن endpoint `POST /api/v1/auth/captcha-proof` برای proof امضاشده و کوتاه‌عمر
- الزام `captcha_proof` برای `POST /api/v1/auth/request-otp`
- اتصال پازل frontend به challenge/proof سمت سرور
- هماهنگ‌سازی smoke واقعی SMS با captcha proof
- افزودن تست الزام captcha proof و افزایش تست‌های API به 28
- افزودن rate limit اختصاصی برای تلاش‌های ناموفق `POST /api/v1/auth/password-login`
- پاک شدن bucket شکست‌های رمز بعد از ورود موفق
- اصلاح UI برای نمایش پیام 429 ورود با رمز بدون تغییر اجباری به مسیر SMS
- افزودن تست rate limit ورود با رمز و افزایش تست‌های API به 29
- ارتقای کپچای پازلی به scene چندلایه با target ring، scan line، aurora و grid ظریف
- افزودن state نزدیک‌شدن به هدف، پیام microcopy دقیق‌تر و feedback بصری برای حالت close
- افزودن حالت موفقیت با burst animation و lock animation برای قطعه پازل
- انتقال موقعیت قطعه/هدف به CSS custom properties برای هماهنگی track و board

## Current Work

Beta-ready stabilization، تست کاربری موبایل/PWA، UX polish و آماده‌سازی deploy.

## Blockers

Blocker قطعی وجود ندارد. با این حال، research میدانی هنوز انجام نشده و تصمیم‌های launch باید بعداً با داده محلی اعتبارسنجی شوند.

## Next

1. تست PWA روی موبایل واقعی و بررسی install behavior
2. تست کاربری beta با چند شماره واقعی، چند آگهی عکس‌دار و چند گفتگو
3. انتخاب deploy target، secret manager و provider object storage
4. مهاجرت local media storage به object storage production
5. افزودن provider ضد bot production-grade، notification/push برای چت، block/report پیام و reset flow مستقل رمز

## آخرین به‌روزرسانی

2026-08-12
## Development Sprint 54 - AvalAI AI Provider

وضعیت: تکمیل‌شده

آداپتر AvalAI با قرارداد OpenAI-compatible برای endpoint بررسی کیفیت آگهی اضافه شده است. مدل پیش‌فرض `gpt-5.6-luna` و کلید backend-only با نام `AVALAI_API_KEY` است. در نبود کلید یا خطای سرویس، fallback محلی فعال می‌ماند.
## Development Sprint 55 - AI Listing Copilot

وضعیت: تکمیل‌شده

دستیار AI داخل فرم ثبت آگهی اکنون نتیجه ساختاریافته، پیشنهاد عنوان و توضیحات قابل اعمال، پیشنهاد دسته‌بندی، راهنمای قیمت و امتیاز کیفیت دارد. برنامه native mobile پس از تکمیل readiness و pilot محصول شروع می‌شود.
## Development Sprint 56 - Image Quality and Listing Attributes

وضعیت: تکمیل‌شده

metadata تصویر، توصیه کیفیت عکس، ویژگی‌های پیشنهادی کالا و نمایش آن‌ها در AI Copilot اضافه شدند. هیچ تصویر خامی برای AI خارجی ارسال نمی‌شود.
## Development Sprint 57 - Smart Search and Similar Listings

وضعیت: تکمیل‌شده

جست‌وجوی فارسی normalize و relevance-based شد و آگهی‌های مشابه در جزئیات آگهی اضافه شدند. semantic search مبتنی بر embedding به بعد از pilot و جمع‌شدن داده واقعی موکول شد.
## Development Sprint 58 - Brand and Trust Layer

وضعیت: تکمیل‌شده

لوگوی رسمی ارسالی در هدر وب استفاده شد و کارت اعتماد حساب با نشانه‌های واقعی موبایل تأییدشده، پروفایل کامل، آگهی و گفتگو اضافه شد.
## به‌روزرسانی Sprint 59

Development Sprint 59 با موضوع Business Profile و Public Trust Layer تکمیل شد. migration `0014`، repository، API احراز‌شده، endpoint عمومی کنترل‌شده و نمایش seller context در جزئیات آگهی اضافه شدند. `check`، `build`، ۴۰ تست API و `db:migrate` موفق هستند.
## به‌روزرسانی Sprint 60

Development Sprint 60 با موضوع اصلاح استفاده از لوگو و handoff مستند تکمیل شد. لوگوی افقی رسمی در header، لوگومارک در PWA/app icon، راهنمای برند و سند تحویل پروژه اضافه شدند. validation کامل وب موفق است.
## به‌روزرسانی Sprint 61

Development Sprint 61 با موضوع Trust Signals مبتنی بر شواهد و Analytics پایه تکمیل شد. migration `0015_analytics_events.sql`، ثبت eventهای view/favorite/contact، endpoint trust summary و نمایش سیگنال‌های واقعی فروشنده اضافه شدند. validation کامل موفق است.
## به‌روزرسانی Sprint 62

Development Sprint 62 با موضوع Analytics Dashboard صاحب آگهی و کنترل‌های privacy/retention پیاده‌سازی شد. migration `0016_analytics_preferences.sql`، aggregate summary، opt-out و حذف داده‌های رفتاری کاربر، و UI داشبورد پروفایل اضافه شدند. check/build/bundle/visual/release موفق هستند؛ اجرای migration و تست کامل DB به‌دلیل خاموش بودن Docker Desktop در این محیط باقی مانده است.
## به‌روزرسانی Sprint 63

Retention واقعی، privacy policy قابل مشاهده و trust signal سابقه پاسخ‌گویی اضافه شدند. job مستقل `npm run db:cleanup:analytics` با retention قابل تنظیم آماده است و API privacy policy و response rate فروشنده تکمیل شده‌اند.
## به‌روزرسانی Sprint 64

Production Media Pipeline و API Contract موبایل پیاده‌سازی شد. migration `0017_media_assets.sql`، checksum/storage key/asset metadata برای upload و سند قرارداد API موبایل اضافه شدند. check/build/bundle/visual/release موفق هستند؛ migration و تست DB نیازمند Docker فعال‌اند.
## به‌روزرسانی Sprint 65

S3-compatible Object Storage adapter پیاده‌سازی شد. provider با `MEDIA_STORAGE_PROVIDER` انتخاب می‌شود؛ local برای development و S3 برای production است. production بدون تنظیم bucket/credentials/public URL fail-fast می‌شود. تمام validationها سبز هستند.
## آخرین وضعیت - Development Sprint 89

Sprint 89 تکمیل شد. پازل در هر دو کلاینت از مختصات فیزیکی چپ استفاده می‌کند و در RTL وارونه نمی‌شود. موبایل puzzle drag واقعی، برند رسمی بدون کادر سفید، آیکن/splash/adaptive icon، API production پیش‌فرض، navigation آیکن‌دار، حالت‌های loading/error و فرم ثبت آگهی با شهر/دسته‌بندی/قیمت واقعی دارد. auth در development/test از روشن بودن PostgreSQL مستقل و در production همچنان fail-closed است. check، build، ۴۷ تست، Android export، اجرای emulator، bundle budget و visual QA موفق بودند.

## آخرین وضعیت - Development Sprint 88

Sprint 88 تکمیل شد. `eas.json` با profileهای development، preview و production اضافه شد، script ساخت APK توسعه‌ای اضافه شد، plugin اعلان و extra پروژه EAS در app config ثبت شدند و mobile profile اکنون platform واقعی دستگاه را برای native token ثبت می‌کند. typecheck، Expo config و Android export موفق بودند. اجرای cloud build تا تنظیم projectId واقعی و login/credentials EAS deferred است.

Hotfix Sprint 88.1: خطای `UnableToResolveError` برای `NotificationsEmitter` با نصب کامل dependency و پاک‌سازی Metro بررسی و رفع شد. placeholder اشتباه EAS projectId از `app.json` حذف شد؛ `eas init` باید بعد از login شناسه واقعی بسازد.

Hotfix Sprint 88.2: خطای خام Firebase در پنل اعلان به پیام graceful تبدیل شد و فعال‌سازی token فقط با projectId معتبر EAS ادامه پیدا می‌کند. کپچای موبایل نیز از حالت auto-solve خارج شد و پاسخ واقعی کاربر را به API می‌فرستد.

## آخرین وضعیت - Development Sprint 87

Sprint 87 تکمیل شد. آدرس Expo Push با `EXPO_PUSH_API_URL` قابل تنظیم شد و parser مستقل برای پاسخ ticketهای provider اضافه شد تا integration test با mock provider ممکن باشد. پاسخ‌های malformed باعث crash delivery نمی‌شوند.

## آخرین وضعیت - Development Sprint 86

Sprint 86 تکمیل شد. endpoint مدیریتی `GET /api/v1/admin/notifications/outbox-summary` برای مشاهده تعداد jobها بر اساس status و ۱۰ خطای اخیر اضافه شد. endpoint فقط moderator است و برای diagnostic اعلان طراحی شده است.

## آخرین وضعیت - Development Sprint 85

Sprint 85 تکمیل شد. worker اعلان اکنون jobهای stuck در وضعیت `processing` را بعد از timeout به `pending` برمی‌گرداند و retryها با backoff نمایی محدود تا ۱۵ دقیقه انجام می‌شوند. خروجی worker تعداد jobهای recovered را نیز گزارش می‌کند.

## آخرین وضعیت - Development Sprint 84

Sprint 84 تکمیل شد. notification outbox پایدار در PostgreSQL اضافه شد. هنگام ارسال پیام، job اعلان در outbox ثبت می‌شود و مسیر API دیگر مستقیماً delivery را اجرا نمی‌کند. worker یک‌باره با `npm run notifications:worker` jobهای pending را claim و ارسال می‌کند و در خطا با delay دوباره pending می‌سازد.

## آخرین وضعیت - Development Sprint 83

Sprint 83 تکمیل شد. delivery native اکنون ticketهای Expo را پس از ارسال با receipt endpoint بررسی می‌کند، خطاهای delivery را در `native_failed` گزارش می‌دهد و `DeviceNotRegistered` را از receipt نیز revoke می‌کند. polling با تأخیر کوتاه و best-effort اجرا می‌شود.

## آخرین وضعیت - Development Sprint 82

Sprint 82 تکمیل شد. API اکنون delivery native را به Expo Push Service ارسال می‌کند، `conversationId` و مسیر گفتگو را در payload می‌گذارد، آمار native را جداگانه گزارش می‌دهد و tokenهای `DeviceNotRegistered` را revoke می‌کند. Web Push و native push مستقل عمل می‌کنند و نبود VAPID دیگر native delivery را متوقف نمی‌کند.

## آخرین وضعیت - Development Sprint 81

Sprint 81 تکمیل شد. قرارداد native push از موبایل به API اضافه شد: migration `0018_native_push_tokens.sql`، جدول persisted برای Expo token، endpoint ثبت و revoke با احراز هویت و mobile verification، و ثبت best-effort token از پنل اعلان موبایل. Web Push همچنان مسیر جداگانه خود را دارد.

## آخرین وضعیت - Development Sprint 80

Sprint 80 تکمیل شد. foundation اعلان native موبایل با `expo-notifications` اضافه شد: کانال اعلان اندروید، permission، دریافت و نگهداری Expo push token در دستگاه، handler اعلان foreground و بازکردن گفتگو از `conversationId` داخل payload اعلان. قابلیت push واقعی هنوز به EAS development build، credentialهای FCM/APNs و endpoint پایدار برای native token نیاز دارد؛ Expo Go فقط برای بررسی UI و permission مناسب است.

## آخرین وضعیت - Development Sprint 79

Sprint 79 تکمیل شد. deep link موبایل برای `four-d://conversation/{id}` در cold start و حالت باز اپ پشتیبانی شد و conversation مشخص را در inbox باز می‌کند. hardening اولیه تصویر چت نیز با محدودیت ۲MB قبل از upload اضافه شد.

## آخرین وضعیت - Development Sprint 78

Sprint 78 تکمیل شد. thread موبایل اکنون ارسال تصویر دارد: انتخاب از گالری، upload با media API، ارسال URL به‌عنوان پیام و نمایش تصویر داخل حباب گفتگو.

## آخرین وضعیت - Development Sprint 77

Sprint 77 تکمیل شد. read receipt به‌صورت persisted از `conversation_reads` محاسبه می‌شود و در thread روی پیام‌های ارسال‌شده نمایش داده می‌شود. polling، mute، block و report فاز قبل نیز حفظ شده‌اند.

## آخرین وضعیت - Development Sprint 76

Sprint 76 تکمیل شد. thread موبایل اکنون polling پانزده‌ثانیه‌ای، mute/unmute، block/unblock و گزارش پیام دارد و همه عملیات به endpointهای واقعی API متصل‌اند.

## آخرین وضعیت - Development Sprint 75

Sprint 75 تکمیل شد. گفتگو در موبایل از حالت لیست خارج شد و به thread واقعی تبدیل شد: ورود به مکالمه، دریافت پیام‌ها، نمایش حباب پیام، ارسال پیام و refresh انجام می‌شود.

## آخرین وضعیت - Development Sprint 74

Sprint 74 تکمیل شد. ویرایش آگهی در موبایل واقعی شد: کاربر از تب آگهی‌های من وارد فرم ویرایش می‌شود، عنوان و توضیحات را ذخیره می‌کند و آگهی برای بررسی مجدد به `submitted` برمی‌گردد.

## آخرین وضعیت - Development Sprint 73

## Hotfix و Service Foundation - 17 مرداد 1405

preflight CORS برای `PUT` و headerهای لازم کامل شد تا ذخیره پروفایل و تغییر شهر در مرورگر متوقف نشود. پایه ثبت خدمت نیز با نوع `service_listing`، جزئیات حوزه خدمت، مدل قیمت‌گذاری و زمان ارائه اضافه شد؛ migration `0020_service_listing_fields.sql` باید در دیتابیس مقصد اجرا شود. جست‌وجوی شهر و دسته در فرم ثبت وب و موبایل اضافه شده است. تعرفه و پرداخت هنوز عمدی deferred هستند.

Sprint 73 فاز کامل UX/UI بود. پروفایل موبایل به دو نمای «اطلاعات حساب» و «آگهی‌های من» تقسیم شد تا صفحه فقط لیست آگهی نباشد. وب نیز visual pass برند 4D شامل surfaceهای نرم، motion ورود، hover feedback، رنگ‌های برند و reduced-motion دریافت کرد.

## آخرین وضعیت - Development Sprint 72

## Development Sprint 95 - Support/Profile/Moderation Hardening

دکمه پشتیبانی اکنون یک FAB واقعی وابسته به viewport است: safe-area، فاصله bottom navigation موبایل، لایه‌بندی مستقل، popup اسکرول‌پذیر، Escape و accessibility دارد. در پروفایل، غرفه به‌عنوان همان هویت عمومی کسب‌وکار نمایش داده می‌شود و تکرار فرم کسب‌وکار هنگام وجود غرفه حذف شده است. پیام خطای صف moderation برای migrationهای ناقص دقیق‌تر شد. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_95_SUPPORT_PROFILE_HARDENING_FA.md`.

Sprint 72 تکمیل شد. مدیریت آگهی اکنون API واقعی و مالکیت‌محور دارد: ویرایش با reset به صف بررسی و حذف به‌صورت soft-delete انجام می‌شود. پروفایل موبایل عملیات حذف و refresh آگهی‌های کاربر را ارائه می‌دهد.

## آخرین وضعیت - Development Sprint 71

Sprint 71 تکمیل شد. بخش «آگهی‌های من» در پروفایل موبایل از `/api/v1/me/contents` داده واقعی می‌گیرد، تعداد آگهی‌ها و وضعیت هر آگهی را نمایش می‌دهد و با profile/database hydration موجود یک workspace واقعی‌تر برای کاربر می‌سازد.

## آخرین وضعیت - Development Sprint 70

Sprint 70 تکمیل شد. پروفایل موبایل اکنون اطلاعات موجود در دیتابیس را از `/api/v1/me` می‌خواند و فرم را با نام، نام خانوادگی، شهر و وضعیت رمز پر می‌کند. ذخیره رمز فقط در صورت تغییر انجام می‌شود، وضعیت تایید موبایل و کامل‌بودن حساب نمایش داده می‌شود و زبان صفحه پروفایل فارسی شد. لوگوی رسمی در profile نمایش داده می‌شود.

## آخرین وضعیت - Development Sprint 69

Sprint 69 تکمیل شد. password validation در موبایل به مسیر onboarding پروفایل وصل شد؛ کاربر بعد از ورود پیامکی می‌تواند نام، نام خانوادگی و رمز ۸ کاراکتری ذخیره کند و در ورودهای بعدی با رمز وارد شود. لوگوی افقی رسمی 4D نیز به asset موبایل اضافه و در profile shell استفاده شد.

## آخرین وضعیت - Development Sprint 68

Sprint 68 تکمیل شد. احراز هویت موبایل اکنون ورود با رمز عبور و ورود با پیامک را پشتیبانی می‌کند. پازل امنیتی از API challenge/proof استفاده می‌کند، payload تایید OTP اصلاح شده و خطای واقعی API در UI نمایش داده می‌شود.

## آخرین وضعیت - Development Sprint 67

Sprint 67 تکمیل شد. نسخه native موبایل با Expo/React Native به API واقعی برای بازار، جزئیات آگهی، OTP، upload تصویر، ثبت آگهی، گفتگو، تماس و پروفایل متصل است. برای عبور از ناسازگاری Fabric در export فعلی، router محدود داخلی استفاده شده است.

Hotfix runtime نیز انجام شد: React در root و همه workspaceها روی `19.0.0` قفل شد تا با `react-native-renderer` نسخه `19.0.0` mismatch نداشته باشد؛ `newArchEnabled: false` نیز از config حذف شد.

گام بعدی: تست دستگاه واقعی، تکمیل onboarding پروفایل، thread کامل پیام و build قابل نصب Android.

## به‌روزرسانی Sprint 66

Native Mobile Shell با Expo/React Native در `apps/mobile` اضافه شد. مسیرهای Feed، جزئیات آگهی، Auth OTP و Profile به API واقعی وصل هستند و token با AsyncStorage نگه‌داری می‌شود. typecheck موبایل و validation وب/API سبز هستند.

## Development Sprint 92 - Increment 2

اتصال UI واقعی پشتیبانی، کاربران و حذف آگهی به پنل ادمین انجام شد. پروفایل تکمیل‌شده اکنون خلاصه اطلاعات و دکمه ویرایش جدا دارد. جزئیات وضعیت تک‌تک درخواست‌های محصول در `docs/phase-reports/DEVELOPMENT_SPRINT_92_INCREMENT_2_FA.md` ثبت شده است.

## Development Sprint 92 - Increment 3

پروفایل به دو مفهوم روشن «وضعیت حساب» و «اطلاعات حساب» تفکیک شد، پشتیبانی به popup آیکونی منتقل شد، رسانه آگهی در feed و محتوای کاربر پایدار شد و پنل ادمین جست‌وجوی کاربر و مشاهده جزئیات آگهی‌دهنده/رسانه را دریافت کرد. release cPanel اکنون نسخه‌دار و rollback-safe است و ZIPهای قبلی حذف نمی‌شوند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_92_INCREMENT_3_FA.md`.

## Development Sprint 92 - Increment 4

پشتیبانی به FAB و popup گوشه‌ای استاندارد تبدیل شد، پروفایل کسب‌وکار summary مستقل گرفت، خطای unhandled جزئیات ادمین کنترل شد و مسیر چندرسانه‌ای فرم واضح‌تر شد. release `v0.1.7-2026-08-21` آماده است. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_92_INCREMENT_4_FA.md`.

## Development Sprint 92 - Increment 5

جابه‌جایی عکس دوم اصلاح شد و رسانه‌ها دیگر overwrite نمی‌شوند. اطلاعات ضروری و پروفایل کسب‌وکار به بخش‌های بازشونده مستقل تبدیل شدند و ظاهر پنل ادمین و فرم چندرسانه‌ای بهبود یافت. release `v0.1.8-2026-08-21` آماده است.

## Development Sprint 92 - Increment 6

مودال انتشار آگهی/خدمت، پشتیبانی شناور و تجربه بخش کاربران admin تکمیل شد. آزمون‌ها و بسته انتشار `v0.1.9-2026-08-21` موفق هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_92_INCREMENT_6_FA.md`.

## Development Sprint 92 - Increment 7

تفکیک واقعی فرم آگهی/خدمت، اصلاح ظاهر popup پشتیبانی، فشرده‌سازی پنل ادمین و اصلاح اعطای نقش `admin` به شماره‌های تنظیم‌شده انجام شد. release `v0.1.10-2026-08-21` آماده است.
## وضعیت آخر - Sprint 92 Increment 8

- فرم خدمت از فرم آگهی مستقل شد و فیلدهای معنایی خود را دارد.
- پشتیبانی شناور و popup responsive اصلاح شد.
- پنل کاربران ادمین با جستجو و تازه‌سازی آماده است و محدودیت نقش حفظ شده است.
- Release `0.1.11` با موفقیت build و بسته‌بندی شد.

## وضعیت آخر - Sprint 92 Increment 9

- مودال‌ها، launcherهای انتشار، FAB پشتیبانی و بخش کاربران ادمین اصلاح شدند.
- Release `0.1.12` با build و تست موفق آماده‌ی cPanel است.
## Development Sprint 93 - Storefront UI Increment 2

هسته و UI اولیه غرفه 4D تکمیل شد. مالک می‌تواند از پروفایل غرفه را بسازد/ویرایش کند، آگهی را به‌صورت اختیاری به آن متصل کند و صفحه عمومی غرفه از مسیر `/storefront/:slug` قابل اشتراک است. public فقط غرفه active و آگهی approved را می‌بیند؛ پرداخت، اشتراک و staff همچنان خارج از MVP هستند. جزئیات در `docs/phase-reports/DEVELOPMENT_SPRINT_93_STOREFRONT_FOUNDATION_FA.md` ثبت شده است.

## Development Sprint 94 - Listing Experience Foundation

کارت آگهی وب اکنون با کلیک روی محتوای آگهی و keyboard به جزئیات باز می‌شود و Favorite/تماس رفتار مستقل دارند. متن CTA تماس به «تماس» اصلاح، پیام گزارش انسانی و trust widget عمومی حذف شد. Gap Analysis تجربه Listing/Chat/UX و release نسخه‌دار `0.1.14-2026-08-22` ثبت شده است. Docker/PostgreSQL و FCM واقعی در این محیط در دسترس نبودند؛ dynamic category schema، view count نمایشی و E2E دستگاهی در sliceهای بعدی هستند.
## Development Sprint 96 - Storefront Queue and Searchable Selectors

- صف غرفه‌های در انتظار بررسی به پنل ادمین متصل شد.
- انتخاب شهر و دسته در بازار و فرم ثبت آگهی جست‌وجوپذیر و کم‌ارتفاع شد.
- check و build موفق؛ smoke مقصد پس از آپلود باقی است.

## Development Sprint 104 - Transport Search and Load Test

جست‌وجوی قطعی حمل‌ونقل با endpoint `/api/v1/transport/search` تکمیل شد. جست‌وجو بر اساس عبارت، مبدأ، مقصد، تاریخ و نوع سفر انجام می‌شود و فقط داده‌های approved/active را نمایش می‌دهد. نرمال‌سازی حروف عربی و اعداد فارسی نیز در لایه repository انجام شده است.

علت خطاهای تست ۳۰۰ کاربر مشخص و کنترل شد: ۴۶۹۹ خطای قبلی پاسخ 429 ناشی از rate limit بودند و خطای سرور صفر بود. bypass فقط با `LOAD_TEST_MODE=true`، فقط روی localhost و فقط خارج از production فعال می‌شود. اجرای تأییدشده شامل ۵۴۱۹ درخواست و صفر خطا با P95 حدود ۵۴۳ms است. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_104_TRANSPORT_SEARCH_FA.md`.

## Development Sprint 105 - Transport Web UI

باکس مستقل حمل‌ونقل محلی به وب اضافه شد. کاربر می‌تواند از همان نقطه پیشنهاد مسیر یا درخواست مسیر را انتخاب کند، فرم تخصصی سفر را در modal تکمیل کند و مسیرهای فعال را با عبارت جست‌وجو کند. فرم با endpointهای transport موجود هماهنگ است و در موبایل به layout تک‌ستونه می‌رود. گزارش تکمیل: `docs/phase-reports/DEVELOPMENT_SPRINT_105_TRANSPORT_WEB_UI_FA.md`.

## Development Sprint 107 - Market Results and Admin Density

- نتایج جست‌وجوی حمل‌ونقل در feed اصلی بازار با لینک مستقیم جزئیات نمایش داده می‌شوند.
- آگهی‌های کاربر در پروفایل دکمه‌های مستقل ویرایش و حذف دارند.
- فهرست کاربران ادمین با جست‌وجو و انتخابگر تک‌کاربره فشرده شد.
- جزئیات آگهی ادمین dialog مستقل با اسکرول داخلی و Escape دارد.
- check و build محلی سبز هستند؛ smoke مقصد cPanel هنوز باز است.

## Development Sprint 112 - Local Runtime and Idempotent Delete Hardening

- علت `EADDRINUSE` وجود API فعال قبلی روی پورت ۴۰۰۰ بود؛ اجرای هم‌زمان نمونه دوم مجاز نیست.
- حذف آگهی مالک idempotent شد و درخواست تکراری برای آگهی حذف‌شده همان مالک نیز موفق است.
- UI درخواست حذف تکراری را قفل می‌کند و وضعیت عملیات را نشان می‌دهد.
- در development، Service Worker و cacheهای production پاک می‌شوند تا F5 کد قدیمی را اجرا نکند.
- build، ۵۵ تست workspace و smoke دو حذف متوالی موفق هستند؛ deploy جفت release و smoke مقصد باقی است.

## Development Sprint 113 - Bodyless Request and Delete Reliability

- علت نهایی خطای حذف، ارسال `Content-Type: application/json` روی درخواست DELETE بدون body بود؛ Fastify آن را پیش از route رد می‌کرد.
- helper هدر وب اکنون برای GET/DELETEهای بدون بدنه هدر JSON نمی‌فرستد.
- حذف repository idempotent و در برابر حذف هم‌زمان reconcile شد و UI نیز درخواست تکراری را قفل می‌کند.
- خطاهای 4xx خود Fastify به پاسخ validation کنترل‌شده تبدیل می‌شوند و دیگر ۵۰۰ عمومی نیستند.
- check، build، ۵۶ تست و smoke HTTP حذف، تکرار حذف و حذف‌شدن از فهرست موفق هستند؛ deploy جفت release و smoke مقصد باقی است.

## Development Sprint 115 - Feed Truthfulness and Controlled Cleanup

- داده‌های نمایشی دیگر با feed واقعی ادغام نمی‌شوند و در build production نمایش داده نخواهند شد.
- خطای query مربوط به feed با جزئیات در log سرور ثبت می‌شود.
- ابزار محافظت‌شده حذف همه محتوای بازار اضافه شد؛ اجرا نیازمند عبارت تأیید صریح است و فایل‌های رسانه را حفظ می‌کند.
- بررسی مستقیم مقصد نشان داد API فعلاً `503` است؛ ابتدا Restart/ترمیم API، سپس در صورت تصمیم قطعی backup و پاک‌سازی انجام می‌شود.
- check، build و ۵۸ تست workspace موفق هستند؛ deploy و smoke مقصد باز است.

## Development Sprint 117 - Comprehensive Test and Regression

تست جامع فعلی تکمیل شد: check، build، bundle budget، تست‌های workspace، Visual QA، typecheck و preflight موبایل، build APK، hosted smoke و regression روی Pixel Emulator همگی موفق هستند. گزارش کامل در `docs/phase-reports/DEVELOPMENT_SPRINT_117_COMPREHENSIVE_TEST_FA.md` ثبت شده است. تست دستگاه فیزیکی، نقش admin و deploy نهایی cPanel همچنان به دسترسی عملیاتی خارج از workspace نیاز دارند.

## Development Sprint 133 - Release Artifacts

release candidate نسخه `v0.1.35-2026-08-30` برای Web/API و APK موجود موبایل ساخته شد و checksumها در manifest ثبت شدند. فایل‌ها آماده آپلود هستند؛ تأیید نهایی production هنوز به deploy و smoke مقصد cPanel نیاز دارد. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_133_RELEASE_ARTIFACTS_FA.md`.

## Development Sprint 132 - Release Gate

گیت محلی release سبز شد: release preflight، mobile preflight، bundle budget، build وب و تست workspace موفق هستند. artifact موبایل موجود نسخه ۰.۱.۱۳ build ۱۷ است. تنها blocker release نهایی، smoke مقصد cPanel با نشست واقعی admin و API هم‌نسخه است. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_132_RELEASE_GATE_FA.md`.

## Development Sprint 131 - Admin Authorization Hardening

تست‌های قرارداد دسترسی برای `/api/v1/admin/users` و `/api/v1/admin/users/:userId/contents` اضافه شد؛ نقش moderator در هر دو مسیر 403 می‌گیرد. check، ۵۶ تست API و build وب سبز هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_131_ADMIN_AUTHZ_HARDENING_FA.md`.

## Development Sprint 130 - Admin Responsive / Browser QA

نسخه محلی وب در عرض ۳۹۰ پیکسل بدون overflow افقی بررسی شد و navigation، جست‌وجو و فیلتر در مرورگر قابل مشاهده بودند. E2E احراز‌شده پنل admin به نشست واقعی و مقصد cPanel نیاز دارد و هنوز pending است. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_130_ADMIN_RESPONSIVE_BROWSER_QA_FA.md`.

## Development Sprint 129 - Admin Copy / IA Polish

عنوان و برچسب‌های عملیاتی پنل ادمین فارسی و روشن شدند؛ وضعیت آگهی، غرفه و اولویت گزارش دیگر خام نمایش داده نمی‌شوند. check، ۵۶ تست API و build وب سبز هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_129_ADMIN_COPY_IA_FA.md`.

## Development Sprint 128 - Admin User Content Moderation

برای آگهی‌های `submitted` در User Detail دکمه تأیید و رد اضافه شد و به endpoint رسمی moderation متصل است؛ برای سایر وضعیت‌ها کنترل تصمیم نمایش داده نمی‌شود. check، ۵۶ تست API و build وب سبز هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_128_ADMIN_USER_CONTENT_MODERATION_FA.md`.

## Development Sprint 127 - Admin User Content Detail

آگهی‌های User Detail اکنون دکمه جزئیات دارند و از endpoint واقعی جزئیات ادمین، اطلاعات کامل، رسانه و آگهی‌دهنده را در dialog باز می‌کنند؛ وضعیت آگهی نیز فارسی شد. check، ۵۶ تست API و build وب سبز هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_127_ADMIN_USER_CONTENT_DETAIL_FA.md`.

## Development Sprint 126 - Admin User Contents

فهرست آگهی‌های واقعی کاربر انتخاب‌شده به User Detail پنل اضافه شد. endpoint جدید فقط برای نقش admin است و از repository موجود استفاده می‌کند؛ آگهی‌های حذف‌شده نمایش داده نمی‌شوند. check، ۵۶ تست API و build وب سبز هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_126_ADMIN_USER_CONTENTS_FA.md`. جزئیات کامل آگهی و E2E ادمین هنوز باز هستند.

## Development Sprint 125 - Admin User Detail

مرحله User Detail پنل ادمین تکمیل شد: برای کاربر انتخاب‌شده نام، شماره، وضعیت حساب، وضعیت احراز، تأیید شماره، تاریخ عضویت و شناسه نمایش داده می‌شود و عملیات موجود تأیید هویت/پروفایل کامل حفظ شده است. check، ۵۶ تست API و build وب سبز هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_125_ADMIN_USER_DETAIL_FA.md`. تفکیک کامل auth/verification، جزئیات آگهی‌های کاربر، IA نهایی و E2E هنوز باز هستند.

## Development Sprint 124 - Admin / Support Audit و خوانایی فهرست پشتیبانی

اولین increment مأموریت Admin/Support/User UX تکمیل شد: audit مکتوب ایجاد شد و فهرست Support پنل ادمین به‌جای UUID و وضعیت خام، کد قابل ارجاع، نام/شماره کاربر، وضعیت فارسی و زمان خوانا نمایش می‌دهد. قرارداد نقش moderator و منطق پاسخ حفظ شد. check، ۵۶ تست API و build وب سبز هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_124_ADMIN_SUPPORT_AUDIT_FA.md`. صفحه جزئیات کاربر، IA کامل پنل، copy audit و E2E هنوز باز هستند.

## Development Sprint 118 - Mobile Filter, Navigation and Secure Contact Fix

فیلتر بازار موبایل جمع‌شده و کم‌ارتفاع شد، Bottom Navigation از نظر جایگذاری متقارن شد و بازیابی fallback برای تماس امن اضافه شد. APK نسخه `0.1.9` build `13` ساخته، روی Pixel Emulator نصب و بدون خطای runtime اجرا شد. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_118_MOBILE_FILTER_NAV_CONTACT_FA.md`.

## Development Sprint 134 - Auth/Profile/Captcha Recovery

وابستگی نادرست تکمیل پروفایل به password و `verification_status` حذف شد؛ `can_create_listing` همچنان تأیید شماره و فیلدهای هویتی لازم را enforce می‌کند. خطاهای CAPTCHA بین API، وب و موبایل به required/invalid/expired تفکیک شدند. check، ۶۰ تست API، تست‌های shared، build وب، typecheck موبایل و preflightهای release سبز هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_134_AUTH_PROFILE_CAPTCHA_FA.md`. smoke cPanel و EAS واقعی هنوز باز هستند.

## Development Sprint 141 - Identity Status and Profile UX Fix

وضعیت تأیید ادمین دیگر با ذخیرهٔ پروفایل overwrite نمی‌شود و `/api/v1/me` مقدار واقعی آن را برمی‌گرداند. فرم اطلاعات ضروری فقط با اقدام کاربر باز می‌شود و مسیر درخواست بررسی دستی از بخش اعتماد و امنیت به پشتیبانی اضافه شد. check، ۶۰ تست API، build و Visual QA سبز هستند. release جفت `v0.1.40-2026-09-01` ساخته شد. فرم آپلود امن مدارک هنوز نیازمند Object Storage خصوصی است. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_141_IDENTITY_STATUS_PROFILE_FIX_FA.md`.

## Development Sprint 139 - Transport Card Overflow Fix

ارتفاع ثابت کارت حمل‌ونقل حذف شد و فیلترهای مسیر در موبایل تک‌ستونه و width کامل شدند؛ مشکل clipping تصویر اصلاح شد. check، build وب، visual QA و bundle budget موفق هستند. release استاندارد `v0.1.38-2026-09-01` ساخته شد. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_139_TRANSPORT_CARD_OVERFLOW_FIX_FA.md`.

## Development Sprint 138 - Transport, Profile and Trust Hardening

جستجوی پیشرفته حمل‌ونقل responsive و actionهای Hero واقعی شدند؛ intent ثبت آگهی پس از ورود حفظ می‌شود و badge مبهم «حساب فعال» از Navbar حذف شد. قرارداد `/me` اکنون account status، تاریخ عضویت و وضعیت احراز هویت را از backend می‌دهد و Profile آن‌ها را به‌صورت خوانا نمایش می‌دهد. Trust UI وضعیت‌های موبایل، پروفایل، هویت و غرفه را تفکیک می‌کند. check، ۶۰ تست API، build، bundle و visual QA موفق هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_138_TRANSPORT_PROFILE_TRUST_FA.md`.

## Development Sprint 137 - Standard Release Naming

پیش‌فرض release cPanel اصلاح شد تا نسخهٔ قدیمی `0.1.1` تولید نشود. release استاندارد این فاز آماده است: `4d-web-v0.1.36-2026-08-31.zip`، `4d-api-v0.1.36-2026-08-31.zip` و manifest هم‌نام. build، release preflight و bundle budget موفق هستند. نسخهٔ موبایل مستقل باقی ماند و APK جدید در این فاز ساخته نشد. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_137_STANDARD_RELEASE_NAMING_FA.md`.

## Development Sprint 136 - Hosted Storefront Smoke

smoke read-only مقصد production سبز شد: live/ready، categories، cities، feed، CAPTCHA و CORS همگی پاسخ صحیح دارند و database آماده است. feed مقصد فعلاً هیچ آگهی متصل به غرفه ندارد؛ بنابراین E2E غرفه و لینک Detail به fixture واقعی active/approved نیاز دارد و هنوز ادعای PASS نشده است. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_136_HOSTED_STOREFRONT_SMOKE_FA.md`.

## Development Sprint 135 - Storefront Feed Integration

شرط اشتباه `storefront_id IS NULL` از public feed حذف شد؛ آگهی approved و حذف‌نشدهٔ غرفه اکنون در بازار عمومی و صفحهٔ غرفه قابل دریافت است. projection غرفه، بازدید، تاریخ و لینک جزئیات در وب و موبایل بهبود یافت. check، buildهای Web/API، typecheck موبایل، ۶۰ تست API، shared tests و bundle budget سبز هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_135_STOREFRONT_FEED_INTEGRATION_FA.md`. smoke دادهٔ واقعی cPanel هنوز pending است.
## آخرین increment — احراز هویت دستی با بررسی مدارک

فرم مستقل احراز هویت و صف بررسی ادمین اضافه شد؛ وضعیت دیگر از تکمیل پروفایل حدس زده نمی‌شود و از درخواست واقعی احراز خوانده می‌شود. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_142_MANUAL_IDENTITY_VERIFICATION_FA.md`.
# آخرین increment — Identity Trust & Reputation

مدل مستقل وضعیت‌های اعتماد، محاسبه server-side، badge هویت در نقاط اصلی Web/Mobile و فیلدهای مدیریتی revocation تکمیل شد. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_144_IDENTITY_TRUST_REPUTATION_FA.md`.
# وضعیت اصلاحات ممیزی — ۲۰۲۶-۱۱-۲۰

اصلاحات امنیتی و تست‌های محلی در شاخه `audit/enterprise-marketplace-transformation` در حال تحویل است. وضعیت جاری و محدودیت‌ها در `docs/audit/REMEDIATION_TRACKER.md` ثبت شده‌اند؛ گزارش‌های قدیمی پایین این سند به معنی تأیید آمادگی نسخه فعلی نیستند. کاربر پوش سورس بررسی‌شده را مجاز کرده و دیپلوی سرور را صریحاً متوقف نگه داشته است.

