# Risk Register پروژه 4D

## R-123 - انتشار نامرتب API و کلاینت

| ID | ریسک | شدت | احتمال | نشانه هشدار | Mitigation | وضعیت |
|---|---|---|---|---|---|---|
| R-123 | کلاینت جدید قبل از migration/API جدید منتشر شود و refresh/login با 503 مواجه شود | High | Medium | خطای نشست بعد از انتشار | ترتیب انتشار: migration، API، وب/موبایل و سپس smoke ورود/refresh | Open |

## R-122 - Deploy ناقص migration refresh

| ID | ریسک | شدت | احتمال | نشانه هشدار | Mitigation | وضعیت |
|---|---|---|---|---|---|---|
| R-122 | اجرای نسخه API جدید بدون migration `0027` ورود را در زمان صدور جفت نشست با خطا مواجه می‌کند | High | Medium | خطای 503 هنگام login یا refresh | اجرای migration قبل از restart و smoke endpointهای login/refresh در release جفت | Open |

## R-121 - نبود تمدید نشست موبایل

| ID | ریسک | شدت | احتمال | نشانه هشدار | Mitigation | وضعیت |
|---|---|---|---|---|---|---|
| R-121 | نشست ۳۰روزه پس از انقضا بدون refresh token نیازمند ورود مجدد است | Medium | Medium | خطای unauthorized پس از استفاده طولانی | طراحی refresh token چرخشی، revoke و تست انقضا در sprint بعدی | Open |

## R-120 - ناهماهنگی نشست بین دستگاه‌ها

| ID | ریسک | شدت | احتمال | نشانه هشدار | Mitigation | وضعیت |
|---|---|---|---|---|---|---|
| R-120 | نبود refresh token و secure storage native می‌تواند نشست موبایل را در شرایط انقضا یا روی دستگاه ناامن شکننده کند | High | Medium | خروج ناگهانی، نیاز به ورود مجدد، یا نگهداری token در storage معمولی | smoke دستگاه واقعی، افزودن secure storage و قرارداد refresh/revoke همه دستگاه‌ها در sprint مستقل | Open |

## روش ارزیابی

شدت و احتمال با سطح Low، Medium و High ثبت می‌شوند. هر ریسک باید owner مفهومی، نشانه هشدار و mitigation داشته باشد.

| ID | ریسک | شدت | احتمال | نشانه هشدار | Mitigation | وضعیت |
|---|---|---|---|---|---|---|
| R-001 | Cold Start و نبود supply کافی در چهار منطقه | High | High | آگهی کم، جستجوهای بدون نتیجه، بازگشت پایین | تمرکز اولیه بر تامین 300 تا 500 آگهی واقعی و جذب فروشنده قبل از تبلیغ گسترده | Open |
| R-002 | نبود تمایز کافی نسبت به دیوار، شیپور، تلگرام و اینستاگرام | High | Medium | کاربران دلیل روشنی برای نصب یا برگشت ندارند | تعریف value proposition local-first و trust-first در Phase 1 و 3 | Open |
| R-003 | اعتماد پایین به فروشندگان یا آگهی‌ها | High | Medium | گزارش زیاد، چت‌های بی‌نتیجه، فروشندگان ناشناس | طراحی trust signals، moderation و report flow در Phase 9 | Open |
| R-004 | scope creep قبل از MVP | High | Medium | ورود پرداخت امن، لجستیک، auction یا social features قبل از اثبات liquidity | اجرای اولویت‌بندی P0/P1/P2/P3 و ثبت deferred | Open |
| R-005 | انتخاب تکنولوژی قبل از تحلیل | Medium | Medium | وابستگی زودهنگام به stack یا vendor | تصمیم stack فقط پس از Phase 8 و ثبت در decision log | Open |
| R-006 | داده محلی ناکافی برای market research | Medium | High | نبود source معتبر برای جمعیت، کسب‌وکارها و رفتار محلی | ترکیب منابع عمومی، مشاهده میدانی و مصاحبه‌های کوتاه در Phase 2 | Open |
| R-007 | کیفیت پایین مستندات و تکرار AI-generated | Medium | Medium | اسناد طولانی اما غیرقابل اجرا | نگه داشتن سندها decision-oriented و دارای acceptance criteria | Open |
| R-008 | moderation دستی پرهزینه | Medium | Medium | افزایش review queue و تاخیر تایید آگهی | automatic checks ساده، queue محدود و audit log | Open |
| R-009 | Wanted Listing و Service Request در cold start پاسخ نگیرند | Medium | Medium | درخواست‌های بی‌پاسخ، کاهش اعتماد به محصول | در Phase 2 و 4 threshold عرضه و UX fallback تعریف شود | Open |
| R-010 | North Star Metric زودتر از داده واقعی قطعی شود | Medium | Low | بهینه‌سازی تیم روی metric نادرست | تا Phase 3 و 4 فقط گزینه تحلیلی نگه داشته شود | Open |
| R-011 | اتکا بیش از حد به desk research برای تصمیم launch | Medium | Medium | mismatch بین سند و رفتار واقعی کاربران محلی | قبل از launch مصاحبه، audit گروه‌های محلی و شمارش supply واقعی انجام شود | Open |
| R-012 | سوءاستفاده از report برای حذف رقیب | Medium | Medium | reportهای تکراری از کاربران محدود | report حذف خودکار ایجاد نکند و moderation context بررسی شود | Open |
| R-013 | OTP abuse و هزینه پیامک | Medium | Medium | افزایش درخواست OTP یا تلاش ناموفق | rate limit، cooldown و انتخاب provider مناسب | Open |
| R-014 | دسترسی بیش از حد moderator/admin | High | Low | مشاهده یا تغییر داده حساس بدون نیاز | least privilege، audit log و role separation | Open |

## ریسک‌های deferred برای بررسی آینده

- پرداخت و escrow
- logistics
- verification رسمی کسب‌وکارها
- fraud detection پیشرفته
- expansion به شهرهای جدید
| R-021 | پاسخ نادرست یا نامطمئن AI در متن آگهی | متوسط | AI فقط پیشنهاد می‌دهد، اعمال جداگانه، fallback محلی و بازبینی انسانی قبل از انتشار | Open |
| R-022 | تاخیر یا هزینه provider خارجی | متوسط | timeout/fallback، پایش quota و محدودکردن prompt به داده آگهی | Open |
| R-023 | توصیه کیفیت عکس از metadata کامل نیست | متوسط | نمایش advisory، عدم ادعای تشخیص محتوای تصویر، vision واقعی در فاز بعد | Open |
| R-024 | relevance محلی برای queryهای پیچیده کافی نیست | متوسط | ثبت search analytics و انتقال به semantic backend بعد از pilot | Open |
| R-025 | لوگوی افقی در اندازه کوچک خوانایی کافی نداشته باشد | کم | استفاده از asset مربعی جدا برای favicon/PWA و نمایش لوگوی کامل در هدر | Open |
| R-026 | کاربر trust signal را با endorsement رسمی اشتباه بگیرد | متوسط | microcopy صریح «نشانه‌های واقعی فعالیت»، بدون امتیاز یا badge رسمی | Open |
| R-027 | اعلان native در Expo Go یا بدون credential واقعی کامل کار نکند | متوسط | نمایش وضعیت graceful، مستندسازی نیاز EAS/FCM/APNs و تکمیل provider در فاز بعد | Open |
| R-028 | outbox job در وضعیت processing باقی بماند | متوسط | locked_at، recovery worker و timeout در Sprint بعد | Open |
| R-029 | diagnostic اعلان برای عملیات واقعی کافی نباشد | کم | اتصال به پنل ادمین، metrics و provider mock در Sprintهای بعد | Open |
| R-030 | تفاوت پاسخ mock و Expo واقعی | کم | parser defensive و تست روی EAS device در Sprint بعد | Open |
| R-031 | نبود credentials EAS مانع cloud build شود | متوسط | projectId ثبت شده است؛ credential اندروید و ساخت preview APK در Sprint 90 انجام شود | Monitoring |
| R-032 | cache یا نصب ناقص Metro در dependency native | کم | `npm install` و `npx expo start --clear`؛ export موفق ثبت شد | Mitigated |
| R-033 | Firebase/FCM در development build تنظیم نشده باشد | متوسط | graceful fallback در UI؛ تکمیل EAS/FCM قبل از Push واقعی | Open |
| R-034 | captcha challenge حافظه‌ای در چند process ناسازگار شود | متوسط | در scale چند-worker، challenge/proof در store مشترک PostgreSQL یا Redis ذخیره و با تست هم‌زمانی بررسی شود | Monitoring |
## R-015 - ادعاهای تأییدنشده کسب‌وکار

شدت: Medium | احتمال: Medium | وضعیت: Monitoring

پروفایل کسب‌وکار فعلاً context اعلامی فروشنده است و نباید به‌عنوان تأیید رسمی نمایش داده شود. شماره موبایل verified از ادعاهای تجاری جدا نگه داشته شد؛ badge و review به فاز evidence واقعی موکول شدند.
## R-016 - استفاده نادرست از asset برند

شدت: Low | احتمال: Medium | وضعیت: Mitigated

استفاده از لوگوی نامتناسب در header باعث افت کیفیت ادراکی محصول می‌شد. با تفکیک assetها، راهنمای برند و validation visual، ریسک فعلی کنترل شد.
## R-017 - جمع‌آوری بیش از حد داده رفتاری

شدت: Medium | احتمال: Medium | وضعیت: Monitoring

در فاز فعلی فقط eventهای محصولی محدود و بدون payload حساس ثبت می‌شوند. retention، privacy policy و ابزار حذف/ناشناس‌سازی باید قبل از production analytics تکمیل شوند.
## R-018 - عدم اجرای migration در محیط توسعه

شدت: Medium | احتمال: Medium | وضعیت: Open

Docker Desktop در زمان validation قابل اتصال نبود؛ migration `0016` و تست‌های وابسته به PostgreSQL باید در اولین اجرای محیط با Docker فعال دوباره بررسی شوند.
## R-019 - تفسیر نادرست response rate

شدت: Medium | احتمال: Medium | وضعیت: Mitigated

response rate فقط یک signal تعاملی است و تأیید کیفیت، هویت یا کسب‌وکار نیست. متن UI و privacy policy این مرز را حفظ می‌کنند.
## R-020 - local media در production

شدت: High | احتمال: Medium | وضعیت: Monitoring

adapter محلی برای توسعه و beta مناسب است اما برای production واقعی باید object storage یا volume پایدار با backup و lifecycle policy انتخاب شود. هاست فعلی موقتاً با `NODE_ENV=development` و `MEDIA_STORAGE_PROVIDER=local` کار می‌کند؛ تا زمان مهاجرت، backup منظم `/home/a4dbazarir/4d-api/data/media` و عدم حذف این مسیر هنگام deploy الزامی است.
## R-021 - اشتباه در public URL یا credential object storage

شدت: High | احتمال: Medium | وضعیت: Monitoring

خطای endpoint، bucket یا credential می‌تواند upload یا نمایش تصویر را مختل کند. production guard، upload smoke و بررسی checksum باید بخشی از deploy gate باشند.
## R-024 - آسیب‌پذیری‌های dependency موبایل

شدت: Medium | احتمال: Medium | وضعیت: Monitoring

در ممیزی 2026-08-16 زنجیره Expo/Metro تعداد 22 هشدار شامل 15 مورد moderate و 7 مورد high گزارش شد. `npm audit fix --force` نسخه‌های breaking پیشنهاد می‌دهد و نباید بدون migration Expo اجرا شود. workspace تولیدی API با `npm audit --omit=dev --workspace=@four-d/api` صفر آسیب‌پذیری گزارش می‌کند؛ پیش از انتشار عمومی موبایل باید upgrade کنترل‌شده Expo و تست Android/iOS انجام شود.

## R-022 - dependency و compatibility زنجیره Expo

شدت: Medium | احتمال: Medium | وضعیت: Monitoring

نصب Expo زنجیره dependency بزرگی اضافه می‌کند. قبل از انتشار native باید `npm audit`، نسخه Android/iOS، permissionها و build profile بررسی و lock شوند.

## R-035 - drift نصب dependency روی shared hosting

شدت: High | احتمال: Medium | وضعیت: Mitigated

نصب دستی packageها یا اجرای workspace command روی cPanel قبلاً باعث نبودن dependency و نصب نسخه ناسازگار `zod` شد. مسیر رسمی اکنون فقط artifact مستقل `release/cpanel/api` با نسخه‌های دقیق و دستور `npm install --omit=dev` است؛ هر deploy باید import smoke و health check داشته باشد.

## R-036 - نبود device QA برای APK پیش‌نمایش

شدت: Medium | احتمال: Medium | وضعیت: Monitoring

Android export و emulator QA موفق‌اند اما EAS preview APK هنوز روی گوشی واقعی آزمایش نشده است. پیش از انتشار عمومی باید login، upload، deep link، chat و notification permission روی حداقل یک دستگاه واقعی تست و نتیجه ثبت شود.

## R-037 - پوشش خودکار جایگزین تست عملیاتی production تلقی شود

شدت: High | احتمال: Medium | وضعیت: Monitoring

ماتریس ۲۷ حالته مرورگر، Axe، تست API و preflight همگی موفق‌اند، اما قطعی provider پیامک، محدودیت shared hosting، backup media و credential اعلان فقط در محیط واقعی آشکار می‌شوند. انتشار عمومی تا smoke واقعی auth/OTP/listing/chat، بررسی `health/ready` و آزمون rollback نباید نهایی اعلام شود.

## R-038 - پیچیدگی و ضعف type coverage فایل اصلی موبایل

شدت: Medium | احتمال: Medium | وضعیت: Open

`apps/mobile/App.tsx` هنوز بزرگ است، چند نسل component در آن باقی مانده و با `@ts-nocheck` پوشش type کامل ندارد. typecheck اجزای جدا و کل dependency graph موفق است، اما پیش از توسعه feature بزرگ بعدی باید screenهای فعال به moduleهای مستقل منتقل، کدهای قدیمی حذف و `@ts-nocheck` برداشته شود.

## R-039 - تعرفه یا پرداخت غیرقابل حسابرسی

شدت: High | احتمال: Medium | وضعیت: Open

Hardcode مبلغ در Web/Mobile، اعتماد به مبلغ ارسالی کلاینت، callback بدون idempotency یا نمایش موفقیت پیش از تایید provider می‌تواند زیان مالی و اختلاف کاربر ایجاد کند. mitigation مصوب: کاتالوگ دیتابیس، snapshot تعرفه، state machine صریح پرداخت، audit log، callback امضاشده و fail-closed بودن پلن پولی تا تکمیل provider.

## R-040 - مجوز بیش از حد برای خواندن پیامک موبایل

شدت: High | احتمال: Low | وضعیت: Mitigated

درخواست `READ_SMS` یا `RECEIVE_SMS` برای OTP حریم خصوصی و پذیرش فروشگاه را تهدید می‌کند. اپ از hint رسمی `sms-otp/one-time-code` استفاده می‌کند. اگر one-tap consent لازم شود، فقط SMS Retriever یا SMS User Consent بدون دسترسی عمومی به inbox و همراه device QA مجاز است.

## R-041 - ناسازگاری artifact و داده رسانه در deploy cPanel

شدت: High | احتمال: Medium | وضعیت: Mitigated

اگر ZIP جدید روی کد قدیمی، بدون migration رسانه یا با حذف `data/media` deploy شود، آگهی‌ها بدون تصویر دیده می‌شوند یا upload با خطای 503 مواجه می‌شود. mitigation: releaseهای نسخه‌دار، حفظ ZIP قبلی، اجرای `db:migrate` و backup/restore رسانه پیش از تعویض نسخه.

## R-042 - نشست قدیمی بدون نقش admin

شدت: Medium | احتمال: Medium | وضعیت: Open

اگر کاربر بعد از تغییر `ADMIN_PHONE_NUMBERS` با توکن قبلی وارد باشد، فهرست کاربران محدود دیده می‌شود. راهکار: خروج کامل، ورود مجدد و بررسی `roles` در `/api/v1/me`.
- **R-034 - backup رایگان روی همان هاست کافی نیست:** تا زمان تهیه storage پولی، ابزار backup/verify محلی فعال است؛ اما نگهداری backup روی همان cPanel در برابر خرابی کامل هاست محافظت نمی‌کند. owner: deployment، اقدام: حداقل یک کپی خارج از هاست و restore drill دوره‌ای.
## R-043 - تفاوت capability محیط اجرا با Multi-Agent محصول

- احتمال: متوسط
- اثر: متوسط
- کنترل: ثبت شفاف محدودیت ابزار در handoff و اجرای بررسی‌ها با role gateهای داخلی.
- مالک: Product/Review

## R-044 - نبود محیط ایزوله برای تست بار ۳۰۰ کاربر

شدت: High | احتمال: Medium | وضعیت: Open

read-heavy ramp-up محلی اجرا شد، اما Docker daemon در اجرای ۱۴۰۵/۰۵/۳۰ به‌دلیل مجوز سیستم قابل بررسی کامل نبود و تست write/auth معتبر انجام نشد. ۴۶۹۹ پاسخ 429 ثبت شد و stress/soak هنوز انجام نشده است. اجرای تست روی production ممنوع است. اقدام: راه‌اندازی Docker/PostgreSQL تستی، API محلی با seed و tokenهای fixture، تفکیک rate limit تست از production و سپس اجرای سناریوهای کامل.

## R-045 - سوءبرداشت غرفه با پروفایل کسب‌وکار

شدت: Medium | احتمال: Medium | وضعیت: Mitigated

غرفه به‌عنوان صفحه عمومی جدید ممکن است با فرم پروفایل کسب‌وکار اشتباه شود. mitigation: مرزبندی رسمی در Gap Analysis، یک غرفه برای هر مالک در MVP و نمایش public فقط پس از moderation.

## R-046 - وابستگی public storefront به local media

شدت: High | احتمال: Medium | وضعیت: Open

لوگو و cover غرفه در MVP به `media_assets` محلی وصل می‌شوند. تا زمان object storage باید backup رسانه و rollback release حفظ شود.

## R-047 - صف moderation قبل از migration مقصد

شدت: High | احتمال: Medium | وضعیت: Open

صف بررسی آگهی از `listing_media` و `market_contents.storefront_id` استفاده می‌کند. اگر migrationهای `0021` و `0022` روی PostgreSQL cPanel اجرا نشده باشند، endpoint عمداً 503 می‌دهد. اقدام: بعد از deploy API اجرای `npm run db:migrate`، restart Node.js App و smoke مسیر moderation.
## R-048 - نبود صف غرفه در نسخه قدیمی وب

اگر API جدید روی هاست فعال باشد اما ZIP وب قدیمی deploy شده باشد، غرفه ثبت می‌شود ولی در پنل دیده نمی‌شود. اقدام: وب و API را از یک release مشترک نصب و service worker را refresh کن.

## R-049 - ناسازگاری گالری با release قدیمی یا media محلی

شدت: High | احتمال: Medium | وضعیت: Mitigated locally / Open on hosted

اگر فقط وب یا فقط API به‌روزرسانی شود، `media` و `view_count` با UI جدید هم‌نسخه نیستند؛ حذف `data/media` نیز تصاویر را از بین می‌برد. اقدام: ZIPهای `v0.1.17` را جفت deploy کن، `data/media` را حذف نکن و detail API را smoke کن.

## R-051 - deploy ناقص release 0.1.18

شدت: High | احتمال: Medium | وضعیت: Mitigated locally / Open on hosted

نسخه جدید پاسخ صف غرفه را با اطلاعات مالک کامل می‌کند و وب صف را جمع‌شونده نمایش می‌دهد. اگر فقط یکی از ZIPها deploy شود، رفتار UI/API هم‌نسخه نخواهد بود. اقدام: هر دو ZIP نسخه `v0.1.18-2026-08-22` را جفت deploy کن، Restart App و smoke عمومی را اجرا کن.

## R-050 - پشتیبانی و لایه‌های modal در مرورگر قدیمی

شدت: Medium | احتمال: Low | وضعیت: Open

Portal و `dvh` در مرورگرهای قدیمی ممکن است رفتار متفاوت داشته باشند. اقدام: تست Chrome/Edge موبایل و دسکتاپ و بررسی safe-area پس از انتشار.

## R-052 - migration metadata روی مقصد اجرا نشده باشد

شدت: High | احتمال: Medium | وضعیت: Open until deploy

اگر migration `0023` اجرا نشده باشد، API schema فیلدهای اختصاصی را برنمی‌گرداند و فرم جدید ناسازگار می‌شود. اقدام: API ZIP جدید، `npm run db:migrate`، سپس `npm run db:seed` و Restart App به‌صورت ترتیبی اجرا شود.

## R-053 - صفحه جزئیات مستقل قبل از deploy جفتی در دسترس نیست

شدت: Medium | احتمال: Medium | وضعیت: Open until deploy

لینک `/listing/{id}` در bundle جدید وب است و برای دریافت داده به endpoint فعلی API نیاز دارد. اقدام: ZIP وب و API را جفت deploy کن، Restart App وب/API را انجام بده و یک آگهی دارای چند رسانه را از کارت، refresh مستقیم و موبایل تست کن.

## R-054 - ناسازگاری طول ردیف‌های seed دسته‌بندی

## R-055 - provider هوش مصنوعی خارج از دسترس

**اثر:** جست‌وجوی محاوره‌ای ممکن است timeout یا پاسخ نامعتبر بگیرد.

**کاهش:** deterministic normalizer، timeout کوتاه، schema validation، عدم نمایش خطای فنی و fallback به جست‌وجوی معمولی.

## R-056 - اجرای ناامن intent توسط AI

**اثر:** در صورت سپردن query آزاد به مدل، ریسک افشای schema یا query injection ایجاد می‌شود.

**کاهش:** مدل فقط JSON محدود تولید کند؛ server فیلترها را با zod/قواعد دامنه اعتبارسنجی و خودش query را بسازد.

## R-057 - ناسازگاری transport با schema مقصد

**اثر:** migration روی cPanel ممکن است ناقص باشد و صف/جست‌وجو ۵۰۰ بدهد.

**کاهش:** migration idempotent، readiness check، smoke نوشتنی و release pair API/Web قبل از فعال‌سازی UI.

## R-058 - کیفیت پایین تشخیص نام روستا و تاریخ فارسی

**اثر:** نتیجه جست‌وجوی سفر برای عبارت‌های محاوره‌ای نادرست می‌شود.

**کاهش:** dictionary منطقه‌ای versioned، مجموعه داده تست فارسی، نمایش chip قابل ویرایش و metric unresolved filters.

شدت: High | احتمال: High | وضعیت: Resolved in `v0.1.21`

هفت ردیف seed دسته‌بندی مقدار `metadata_schema` نداشتند و اجرای `db:seed` با خطای `VALUES lists must all be the same length` متوقف می‌شد. مقدار خالی معتبر `'[]'` اضافه شد؛ پس از deploy اجرای seed و مشاهده‌ی `Seeds applied.` روی cPanel الزامی است.

## R-059 - migration حمل‌ونقل روی مقصد اجرا نشده است

**اثر:** endpointهای سفر روی cPanel با خطای ۵۰۰ یا نبود جدول مواجه می‌شوند.

**کاهش:** اجرای `db:migrate` بعد از upload، سپس readiness و smoke endpointهای transport قبل از فعال‌سازی UI.

## R-060 - قرارداد UI و API حمل‌ونقل ممکن است ناهماهنگ شود

**اثر:** فرم وب/mobile فیلدهایی بفرستد که API هنوز پشتیبانی نمی‌کند.

**کاهش:** UI فقط پس از تثبیت schema و تست contract در Sprint 105 متصل شود؛ فیلدهای اختصاصی versioned بمانند.

## R-061 - منطقه زمانی و انقضای سفر هنوز کامل نشده است

**اثر:** نمایش تاریخ/زمان در مرز روز یا سفرهای قدیمی نادرست می‌شود.

**کاهش:** در Sprint 104 نرمال‌سازی تاریخ و timezone منطقه ثبت شود؛ expiry خودکار و job پایدار deferred بماند.

## R-062 - تفاوت نوشتار فارسی در جست‌وجوی مسیر

**اثر:** عبارت‌هایی با حروف عربی/فارسی یا اعداد فارسی ممکن است نتیجه‌ی یکسان ندهند.

**کاهش:** نرمال‌سازی متمرکز در repository و محدودکردن طول/escape الگوی `ilike` در Sprint 104 انجام شد؛ dictionary روستاها و intent محاوره‌ای در Sprint 105 با fixture تست تکمیل می‌شود.

## R-063 - فرم وب حمل‌ونقل قبل از smoke مقصد فعال شود

**اثر:** اگر migration یا نسخه‌ی API مقصد همگام نباشد، ثبت مسیر یا جست‌وجو در UI خطای عمومی نشان می‌دهد.

**کاهش:** نسخه‌ی API و readiness قبل از فعال‌سازی در cPanel بررسی شود؛ سپس ثبت یک سفر آزمایشی، مشاهده در صف moderation و جست‌وجوی آن به‌صورت smoke انجام شود. اتصال موبایل تا بعد از این تأیید deferred است.

## R-064 - آلودگی دیتابیس توسعه با داده‌ی دمو

**اثر:** اجرای seed دمو روی محیط اشتباه می‌تواند تعداد زیادی کاربر و محتوا ایجاد کند و نتایج گزارش‌ها را مخدوش کند.

**کاهش:** اسکریپت فقط در محیط غیرproduction اجرا می‌شود، تعداد کاربران سقف ۳۰۰ دارد، شناسه‌ها deterministic هستند و راهنمای اجرا در phase report صریحاً local-only است. اجرای آن روی cPanel یا دیتابیس واقعی ممنوع است.

## R-075 - اشتباه گرفتن candidate با release نهایی

**اثر:** آپلود بسته بدون تأیید `.htaccess`، env، migration و restart می‌تواند دوباره 503 یا خطای API ایجاد کند.

**کاهش:** manifest صریحاً مراحل deploy و smoke را نگه می‌دارد و artifact فعلی فقط candidate نام‌گذاری شده است.

## R-074 - release نهایی بدون smoke مقصد

**اثر:** ممکن است نسخه cPanel قدیمی، migration ناقص یا env نادرست داشته باشد؛ در این حالت release محلی سالم ولی production خراب است.

**کاهش:** release نهایی تا deploy جفت و smoke health/feed/authenticated admin روی مقصد pending است.

## R-073 - تفاوت مجوزهای API مقصد با release محلی

**اثر:** تست‌های محلی مرز admin/moderator را تأیید می‌کنند، اما نسخه قدیمی API روی cPanel ممکن است endpoint جدید یا guard هم‌نسخه نداشته باشد.

**کاهش:** deploy جفت API/وب و E2E مقصد قبل از release نهایی الزامی باقی ماند.

## R-072 - نبود نشست admin برای E2E مقصد

**اثر:** عملیات User Detail و moderation در محیط مقصد به‌صورت end-to-end تأیید نشده است.

**کاهش:** تست محلی responsive انجام شد؛ E2E مقصد تا فراهم‌شدن نشست admin و API هم‌نسخه pending باقی می‌ماند.

## R-071 - تفاوت برچسب UI با status جدید API

**اثر:** اگر API در آینده status جدیدی اضافه کند، UI تا زمان افزودن نگاشت همان مقدار را نشان می‌دهد.

**کاهش:** fallback فعلی مقدار خام را پنهان نمی‌کند و status جدید در audit بعدی قابل شناسایی است.

## R-070 - تأیید نشدن moderation پنل در محیط مقصد

**اثر:** منطق محلی و build سبز است، اما نقش admin و endpoint مقصد cPanel هنوز smoke نشده‌اند.

**کاهش:** اجرای E2E مقصد به‌عنوان مورد Pending باقی ماند و قبل از release production باید با حساب admin انجام شود.

## R-069 - نبود moderation مستقیم در User Detail

**اثر:** جزئیات کامل آگهی قابل مشاهده است، اما تصمیم moderation هنوز از صف‌های فعلی انجام می‌شود.

**کاهش:** عملیات جدید اضافه نشد؛ مورد در tracker برای فاز بعدی ثبت شده است.

## R-068 - نبود کنترل عملیاتی آگهی در User Detail

**اثر:** ادمین آگهی‌های کاربر را می‌بیند، اما از همین بخش هنوز جزئیات کامل یا moderation مستقیم ندارد.

**کاهش:** این عملیات عمداً به فاز مستقل deferred شد تا با قراردادهای موجود moderation و جزئیات تداخل نکند.

## R-067 - ناقص‌بودن User Detail عملیاتی

**اثر:** پنل اکنون اطلاعات هویتی پایه را نشان می‌دهد، اما فعالیت‌ها و آگهی‌های کاربر هنوز در Detail جداگانه دیده نمی‌شوند.

**کاهش:** این مورد در tracker به‌عنوان فاز بعدی ثبت شد و از نمایش داده حدسی یا queryهای بدون قرارداد جلوگیری شد.

## R-066 - ناقص‌بودن عملیات پنل ادمین پس از اصلاح Support

**اثر:** خوانایی فهرست Support بهتر شده، اما User Detail، IA کامل و E2E نقش‌های ادمین هنوز پوشش داده نشده‌اند.

**کاهش:** این موارد deferred و در tracker به‌عنوان فازهای بعدی ثبت شدند؛ این increment به‌عنوان تکمیل کل مأموریت Admin اعلام نمی‌شود.

## R-065 - تفاوت نسخه وب/API در عملیات ویرایش مالک

**اثر:** اگر API مقصد قبل از release مربوطه باشد، ویرایش/حذف آگهی یا جزئیات ادمین ممکن است خطای عمومی بدهد.

**کاهش:** endpointهای `PUT/DELETE /api/v1/me/contents/:contentId` و endpoint جزئیات ادمین قبل از فعال‌سازی UI روی مقصد smoke شوند و وب/API هم‌نسخه deploy شوند.

## R-069 - وابستگی مقصد به تنظیمات CAPTCHA و SMS

**اثر:** حتی با قرارداد درست کلاینت، نبودن API فعال، تنظیمات SMS یا deploy هم‌نسخه در cPanel می‌تواند مسیر ورود را متوقف کند.

**کاهش:** قبل از release نهایی، health، captcha challenge/proof و مسیر OTP روی مقصد واقعی smoke شوند؛ نتیجه EAS و مقصد بدون مشاهده‌ی واقعی PASS اعلام نشود.

## R-071 - نبود fixture غرفه در feed مقصد

**اثر:** smoke عمومی production سالم است، اما نبود آگهی دارای `storefront_id` اجازه نمی‌دهد inclusion غرفه و صفحهٔ عمومی آن روی cPanel به‌صورت end-to-end تأیید شود.

**کاهش:** پس از فراهم‌شدن storefront فعال و listing approved متصل، فقط feed، endpoint غرفه و `/listing/{id}` با همان شناسه مقایسه شوند؛ دادهٔ آزمایشی بدون مجوز در production ساخته نشود.

## R-070 - عدم تأیید end-to-end فید غرفه روی مقصد

**اثر:** کد محلی inclusion آگهی غرفه را اصلاح کرده، اما اگر API مقصد قدیمی باشد یا آگهی/غرفه وضعیت approved/active نداشته باشد، کاربر هنوز اختلاف می‌بیند.

**کاهش:** Web و API هم‌زمان deploy شوند و با یک آگهی approved متصل به غرفه، feed عمومی، صفحهٔ غرفه و `/listing/{id}` مقایسه شوند.
## R-040 — برداشت نادرست از badge هویت

شدت: Medium | احتمال: Medium | وضعیت: Monitoring

badge فقط می‌گوید هویت توسط 4D بررسی شده است و تضمین معامله نیست. tooltip و متن عمومی عمداً همین محدودیت را توضیح می‌دهند؛ امتیاز عددی عمومی نشده است.
