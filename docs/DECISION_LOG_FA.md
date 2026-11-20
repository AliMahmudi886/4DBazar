# Decision Log پروژه 4D

## D-123 - retry محدود برای نشست منقضی

Date: 2026-08-30  
Status: Accepted

کلاینت‌ها فقط در پاسخ 401 و حداکثر یک بار refresh می‌کنند. درخواست refresh از retry مستثنی است، درخواست‌های موازی یک refresh مشترک دارند و شکست تمدید به logout خودکار/پیام ورود مجدد منتهی می‌شود؛ retry بی‌نهایت مجاز نیست.

## D-122 - Refresh token چرخشی

Date: 2026-08-30  
Status: Accepted

refresh token در جدول مستقل و فقط به‌صورت hash نگهداری می‌شود. هر استفاده موفق token قبلی را revoke و یک جفت جدید صادر می‌کند؛ session revokeشده نیز نمی‌تواند از refresh token خود استفاده کند.

## D-121 - ذخیره امن نشست موبایل

Date: 2026-08-30  
Status: Accepted

توکن نشست native موبایل باید در `expo-secure-store` نگهداری شود. برای migration و سازگاری با کلاینت‌های قدیمی، خواندن موقت AsyncStorage مجاز است؛ پس از انتقال موفق، مقدار legacy حذف می‌شود. refresh token در تصمیم و قرارداد جداگانه بررسی می‌شود.

## D-120 - قرارداد صریح خطاهای Auth

Date: 2026-08-30  
Status: Accepted

API برای خطاهای شماره موبایل، OTP و رمز عبور کدهای مستقل برمی‌گرداند تا وب و موبایل بتوانند پیام دقیق و قابل اقدام نشان دهند. status codeهای موجود برای سازگاری حفظ می‌شوند و پیام خام فقط برای خطاهای کنترل‌شده نمایش داده می‌شود.

## D-093 - غرفه به‌عنوان هویت عمومی کسب‌وکار

Date: 2026-08-22
Status: Accepted

در MVP، کاربر نباید دو صفحه مشابه برای «پروفایل کسب‌وکار» و «غرفه» ببیند. `storefront` همان صفحه عمومی کسب‌وکار است و اطلاعات معرفی، تماس و آگهی‌های مرتبط را جمع می‌کند؛ اطلاعات ضروری هویتی حساب همچنان جدا و خصوصی می‌ماند. مسیر legacy business profile فقط برای کاربران قدیمی نگه داشته می‌شود.

## D-094 - لایه‌بندی Support FAB

Date: 2026-08-22
Status: Accepted

Support FAB نسبت به viewport با `position: fixed` قرار می‌گیرد، بالاتر از محتوای عادی و پایین‌تر از modalهای اصلی است. فاصله bottom در موبایل باید ارتفاع bottom navigation و `env(safe-area-inset-bottom)` را لحاظ کند؛ افزایش بی‌دلیل z-index جایگزین اصلاح layout نیست.

## D-088 - عدم حدس‌زدن EAS projectId و credentials

Date: 2026-08-13  
Status: Accepted

config و profileهای EAS در repository ثبت می‌شوند، اما projectId واقعی و credentials تا زمان `eas init` و login صاحب پروژه وارد نمی‌شوند. placeholder فعلی مانع افشای شناسه یا secret اشتباه می‌شود و blocker در handoff ثبت شده است.

## D-088.1 - حذف placeholder از Expo app config

Date: 2026-08-13  
Status: Accepted

`REPLACE_WITH_EAS_PROJECT_ID` نباید در `extra.eas.projectId` باقی بماند، چون Expo/EAS آن را UUID واقعی فرض می‌کند و با `Invalid UUID appId` متوقف می‌شود. شناسه فقط بعد از `eas init` روی حساب صاحب پروژه ثبت می‌شود.

## D-087 - قابل تنظیم بودن provider اعلان

Date: 2026-08-13  
Status: Accepted

آدرس provider اعلان از config خوانده می‌شود تا endpoint رسمی Expo در development و mock provider در integration test بدون تغییر کد قابل استفاده باشد. parser پاسخ provider نیز مستقل و defensive نگه داشته می‌شود.

## D-086 - diagnostic outbox فقط برای moderator

Date: 2026-08-13  
Status: Accepted

خلاصه وضعیت و خطاهای اعلان فقط از مسیر admin و برای نقش moderator قابل مشاهده است؛ اطلاعات token یا متن حساس اعلان در این summary برگردانده نمی‌شود.

## D-085 - recovery و backoff برای outbox

Date: 2026-08-13  
Status: Accepted

jobی که بیش از ۵ دقیقه در وضعیت processing بماند، قابل recovery است. retryها از ۳۰ ثانیه شروع می‌شوند و تا ۱۵ دقیقه سقف دارند تا خطای موقت provider باعث فشار پیوسته روی سرویس نشود.

## D-084 - ثبت اعلان در outbox دیتابیسی

Date: 2026-08-13  
Status: Accepted

اعلان پیام ابتدا در PostgreSQL ثبت می‌شود و delivery توسط worker جدا انجام می‌گیرد. این تصمیم از گم‌شدن اعلان هنگام restart API جلوگیری می‌کند و برای شروع به queue خارجی نیاز ندارد؛ با افزایش بار، worker و queue مستقل قابل ارتقا هستند.

## D-083 - receipt polling کوتاه و best-effort

Date: 2026-08-13  
Status: Accepted

در این مرحله receiptهای Expo با تأخیر کوتاه بررسی می‌شوند تا وضعیت delivery و tokenهای منقضی بهتر مدیریت شود. چون polling هنوز queue durable ندارد، failure آن نباید پاسخ یا persistence پیام را تغییر دهد؛ reliability کامل به worker فاز بعد منتقل می‌شود.

## D-082 - delivery best-effort برای native push

Date: 2026-08-13  
Status: Accepted

ارسال native push در این مرحله best-effort و خارج از مسیر پاسخ API انجام می‌شود؛ خطای Expo نباید ارسال پیام چت را fail کند. payload دارای `conversationId` است و tokenهای شناخته‌شده به‌عنوان نامعتبر revoke می‌شوند. queue، retry و receipt polling به فاز reliability منتقل شدند.

## D-081 - جداسازی native token از Web Push subscription

Date: 2026-08-13  
Status: Accepted

توکن Expo/FCM/APNs در جدول و endpoint جدا از `push_subscriptions` نگهداری می‌شود؛ Web Push به VAPID و کلیدهای `p256dh/auth` وابسته است و native push قرارداد متفاوتی دارد. این جداسازی جلوی ثبت اشتباه token و coupling بین دو provider را می‌گیرد.

## D-080 - foundation اعلان native با Expo Notifications

Date: 2026-08-13  
Status: Accepted

برای شروع اعلان native موبایل، `expo-notifications` انتخاب شد تا permission، کانال Android، foreground handling و دریافت Expo push token در همان معماری Expo پیاده شود. token فعلاً local نگهداری می‌شود و ارسال production تا زمان EAS build، credentialهای FCM/APNs و endpoint پایدار token deferred است.

تصمیم‌های مهم باید با context، گزینه‌ها، نتیجه و پیامد ثبت شوند. تغییر foundation بدون decision جدید مجاز نیست.

## D-001 - شروع پروژه از Phase 0

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

در زمان شروع، repository خالی بود و هیچ foundation مستنداتی وجود نداشت. درخواست اصلی صراحتاً Phase 0 را نقطه شروع دانسته بود و کدنویسی feature را ممنوع کرده بود.

Decision:

ابتدا اسناد foundation ساخته شد و هیچ application feature code نوشته نشد.

Consequences:

- پروژه اکنون قابل ادامه توسط agent بعدی است.
- شروع کدنویسی به تکمیل phaseهای discovery، strategy، UX، domain، database/API، architecture و security وابسته شد.

## D-002 - زبان اصلی مستندات فارسی

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

درخواست پروژه تاکید کرده بود که تمام مستندات اصلی فارسی باشند.

Decision:

اسناد اصلی به فارسی نوشته می‌شوند. نام‌های فنی مانند API، Entity، Endpoint، Table و Event می‌توانند انگلیسی بمانند.

Consequences:

- onboarding فارسی برای مالک محصول و agentها ساده‌تر می‌شود.
- در کد آینده، naming انگلیسی و توضیح مستند فارسی ترکیب خواهد شد.

## D-003 - عدم initialize کردن Git در Phase 0

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

پوشه پروژه در scan اولیه Git repository نبود. درخواست کاربر initialize گیت یا commit صریح نکرده بود.

Decision:

در Phase 0 فقط وضعیت Git ثبت شد و repository initialize نشد.

Consequences:

- تغییری خارج از scope مستندات انجام نشد.
- اگر مالک محصول بخواهد، Git می‌تواند در فاز بعدی یا به‌عنوان task جداگانه فعال شود.

## D-004 - Modular Monolith فقط به‌عنوان hypothesis

تاریخ: 2026-08-11

وضعیت: Proposed

Context:

درخواست پروژه Modular Monolith را گزینه ترجیحی اولیه اما نیازمند تحلیل معرفی کرده بود.

Decision:

تا Phase 8، Modular Monolith فقط hypothesis است و تصمیم قطعی معماری محسوب نمی‌شود.

Consequences:

- از over-engineering و microservices زودهنگام جلوگیری می‌شود.
- تصمیم نهایی بعد از domain، database/API و نیازهای runtime ثبت خواهد شد.

## D-005 - Positioning محصول به‌عنوان بازار محلی 4D Region

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

تحلیل discovery و market research نشان داد رقابت مستقیم با دیوار و شیپور روی حجم ملی و breadth دسته‌ها برای MVP منطقی نیست.

Decision:

4D به‌عنوان بازار محلی گرمه، جاجرم، ایور و درق position می‌شود؛ تمرکز روی local relevance، trust ساده، Wanted، Service Request و cold start واقعی است.

Consequences:

- MVP باید محدود و local-first بماند.
- categoryهای زیاد، پرداخت، ارسال، auction و featureهای سنگین deferred می‌شوند.

## D-006 - عدم ساخت TrustScore ترکیبی در MVP

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

Trust یکی از تمایزهای اصلی 4D است، اما امتیاز ترکیبی زودهنگام می‌تواند غیرشفاف، غیرقابل دفاع و پرهزینه باشد.

Decision:

در MVP، signalها جداگانه نگهداری و نمایش داده می‌شوند: موبایل تاییدشده، عمر حساب، سابقه آگهی، response rate و report history داخلی.

Consequences:

- trust ساده‌تر و قابل توضیح‌تر می‌ماند.
- امکان ساخت score ترکیبی در آینده حفظ می‌شود.

## D-007 - Location ساده برای MVP

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

برای 4D Region در MVP، پیچیدگی geo search ارزش کافی نسبت به هزینه طراحی و پیاده‌سازی ندارد.

Decision:

MVP فقط از «شهر من»، «کل 4D» و انتخاب دستی گرمه، جاجرم، ایور و درق پشتیبانی می‌کند.

Consequences:

- UX ساده‌تر و سریع‌تر می‌شود.
- neighbourhood، latitude/longitude، radius search و nearby deferred می‌شوند.

## D-008 - تثبیت P0 MVP در PRD نسخه اول

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

Phase 4 باید MVP را به محدوده قابل launch و قابل سنجش تبدیل می‌کرد.

Decision:

P0 شامل account با تایید موبایل، profile پایه، location ساده، categoryهای P0، ثبت و مشاهده آگهی، search/filter پایه، Wanted، Service Listing، Service Request، contact/chat پایه، favorites، report، moderation/admin پایه و analytics events پایه شد.

Consequences:

- Business Profile، Saved Search، monetization، geo radius، payment، logistics و TrustScore ترکیبی از MVP خارج ماندند.
- Phase 5 می‌تواند UX را بر اساس سطح مشخصی از scope طراحی کند.

## D-009 - طراحی UX با Home Feed عملیاتی

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

4D قرار است ابزار واقعی بازار محلی باشد، نه صفحه معرفی محصول. برای MVP، کاربر باید بلافاصله بتواند محتوای محلی را ببیند یا جستجو کند.

Decision:

صفحه اول محصول feed/search عملیاتی است و landing page تبلیغاتی برای MVP طراحی نمی‌شود.

Consequences:

- UX مستقیماً روی liquidity، search و contact متمرکز می‌شود.
- محتوای اولیه و empty stateها برای cold start اهمیت بیشتری پیدا می‌کنند.

## D-010 - Create Hub به‌عنوان ورودی واحد ثبت محتوا

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

MVP چهار interaction اصلی دارد و اگر هرکدام مسیر جدا و پنهان داشته باشند، کاربر گیج می‌شود.

Decision:

ثبت محتوا از یک Create Hub با چهار نیت شروع می‌شود: فروش کالا، درخواست خرید، معرفی خدمت، درخواست خدمت.

Consequences:

- UX ثبت محتوا ساده‌تر و قابل آموزش‌تر می‌شود.
- Domain Model باید تفاوت نوع محتوا را واضح نگه دارد.

## D-011 - UX اولیه با pre-publication moderation

تاریخ: 2026-08-11

وضعیت: Proposed

Context:

Trust برای بازار کوچک 4D حیاتی است، اما pre-publication review می‌تواند سرعت انتشار را کم کند.

Decision:

UX نسخه اول بر اساس ارسال محتوا برای بررسی قبل از انتشار طراحی می‌شود. تصمیم نهایی عملیاتی در Phase 7 و Phase 9 تثبیت خواهد شد.

Consequences:

- تجربه status برای submitted، approved، edit_required و rejected لازم است.
- ریسک کند شدن supply باید در beta سنجیده شود.

## D-012 - جداسازی content typeها در Domain Model

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

چهار interaction اصلی 4D رفتارهای مشترک دارند، اما نیازهای معنایی متفاوتی دارند. یکی‌کردن کامل آن‌ها می‌تواند business ruleها را مبهم کند.

Decision:

در Domain Model، `Listing`، `WantedListing`، `ServiceListing` و `ServiceRequest` entity/aggregate جدا هستند. مفهوم `MarketContent` فقط برای lifecycle، moderation، report و analytics مشترک تعریف شد.

Consequences:

- قوانین اختصاصی هر content type روشن می‌ماند.
- Phase 7 باید تصمیم بگیرد این جداسازی در physical schema چگونه پیاده شود.

## D-013 - Conversation با context entity

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

برای trust، moderation و analytics، هر ارتباط باید معلوم باشد درباره کدام آگهی، Wanted، خدمت یا درخواست خدمت شروع شده است.

Decision:

هر Conversation یا ContactEvent باید context entity reference داشته باشد.

Consequences:

- report و moderation در ارتباط‌ها زمینه‌دار می‌شود.
- API contact/chat باید بدون context اجازه شروع ارتباط عادی marketplace ندهد.

## D-014 - PostgreSQL به‌عنوان database engine پیشنهادی

تاریخ: 2026-08-11

وضعیت: Proposed

Context:

داده‌های 4D رابطه‌ای، transactionمحور و نیازمند query، گزارش‌گیری و constraintهای قوی هستند.

Decision:

PostgreSQL به‌عنوان engine پیشنهادی اولیه برای MVP انتخاب شد. تصمیم نهایی runtime/hosting در Phase 8 بررسی می‌شود.

Consequences:

- می‌توان search پایه، JSONB برای attributeها و گزارش‌گیری را بدون dependency اضافه شروع کرد.
- اگر search رشد کند، engine جدا می‌تواند بعداً اضافه شود.

## D-015 - مدل content مشترک + subtype table

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

چهار content type lifecycle و moderation مشترک دارند، اما data و rules اختصاصی هم دارند.

Decision:

در طراحی database، `market_contents` برای فیلدهای مشترک و tableهای `listings`، `wanted_listings`، `service_listings` و `service_requests` برای جزئیات اختصاصی استفاده می‌شود.

Consequences:

- feed، search، favorites، reports و conversations ساده‌تر به یک content مشترک وصل می‌شوند.
- validation subtype باید در application و constraintهای database پوشش داده شود.

## D-016 - search اولیه با PostgreSQL

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

MVP 4D باید کوچک و قابل launch بماند. ورود Elasticsearch/OpenSearch در شروع هزینه عملیاتی اضافه می‌کند.

Decision:

search اولیه با PostgreSQL و indexهای مناسب طراحی می‌شود. engine جدا deferred است.

Consequences:

- dependency و هزینه عملیاتی کمتر می‌شود.
- باید performance و search result rate در beta سنجیده شود.

## D-017 - Modular Monolith برای MVP

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

پس از تکمیل domain، database/API و نیازهای runtime، scope MVP همچنان کوچک و transactionمحور است. Microservices و Kubernetes در MVP باعث پیچیدگی عملیاتی بدون منفعت واقعی می‌شوند.

Decision:

معماری MVP به‌صورت Modular Monolith با module boundaryهای روشن، PostgreSQL مشترک، backend API واحد و worker سبک طراحی می‌شود.

Consequences:

- توسعه و deployment ساده‌تر می‌شود.
- transaction و moderation قابل کنترل‌تر می‌ماند.
- مسیر جداسازی Search، Media، Notification یا Analytics در آینده باز می‌ماند.

## D-018 - عدم الزام cache خارجی و realtime chat در MVP

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

برای MVP، scale و نیاز realtime هنوز اثبات نشده است. افزودن Redis، WebSocket یا serviceهای جدا می‌تواند هزینه و complexity را بالا ببرد.

Decision:

cache خارجی و realtime chat در MVP الزامی نیستند. polling/refresh برای chat و cache داخلی محدود برای taxonomy قابل قبول است.

Consequences:

- MVP سریع‌تر و ساده‌تر قابل ساخت است.
- اگر metrics واقعی نیاز نشان دهند، Redis یا realtime layer بعداً اضافه می‌شود.

## D-019 - انتخاب framework به Phase 10 موکول شد

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

Phase 8 معماری سیستم را تثبیت می‌کند، اما انتخاب framework باید با معیارهای implementation، testing، hosting، AI agent support و talent بررسی شود.

Decision:

framework دقیق backend، web/admin و mobile در Phase 8 قطعی نشد و به Phase 10 Development Foundation موکول شد.

Consequences:

- از انتخاب تکنولوژی بدون تحلیل جلوگیری می‌شود.
- Phase 10 باید قبل از scaffold، گزینه‌ها را با معیارهای ثبت‌شده ارزیابی کند.

## D-020 - TrustScore ترکیبی خارج از MVP

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

Trust برای 4D حیاتی است، اما score ترکیبی زودهنگام می‌تواند غیرشفاف، قابل سوءبرداشت و ناعادلانه باشد.

Decision:

در MVP فقط trust signalهای جداگانه و قابل توضیح استفاده می‌شوند. TrustScore ترکیبی ساخته یا نمایش داده نمی‌شود.

Consequences:

- اعتماد قابل توضیح‌تر می‌ماند.
- امکان ساخت score آینده بعد از داده واقعی حفظ می‌شود.

## D-021 - Report بدون حذف خودکار محتوا

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

Report abuse می‌تواند باعث حذف ناعادلانه محتوای رقبا یا کاربران شود.

Decision:

گزارش کاربر به‌تنهایی محتوای عمومی را حذف نمی‌کند؛ report وارد moderation context می‌شود و decision انسانی/سیاستی لازم دارد.

Consequences:

- ریسک حذف ناعادلانه کمتر می‌شود.
- moderation queue و policy اهمیت بیشتری پیدا می‌کند.

## D-022 - شماره موبایل عمومی نمایش داده نمی‌شود

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

شماره موبایل داده حساس کاربر است و افشای عمومی آن ریسک privacy و abuse دارد.

Decision:

شماره موبایل در MVP عمومی نمایش داده نمی‌شود. تماس/چت باید از مسیر contextدار محصول انجام شود مگر تصمیم آینده خلاف آن را با دلیل ثبت کند.

Consequences:

- privacy بهتر حفظ می‌شود.
- Contact/Chat و moderation اهمیت بیشتری پیدا می‌کنند.

## D-023 - Stack اجرایی Phase 10

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

بعد از تکمیل Phase 9، پروژه نیازمند foundation اجرایی سازگار با Modular Monolith، تست‌پذیر و قابل توسعه توسط agentها بود.

Decision:

TypeScript monorepo انتخاب شد. Backend با Node.js + Fastify، Web/Admin با Vite + React و package مشترک TypeScript برای contractهای پایه شروع شد.

Consequences:

- API و web/admin foundation سریع و یکپارچه ساخته شد.
- mobile native scaffold به بعد از تثبیت API و web/admin foundation موکول شد.
- انتخاب ORM/query builder و providerهای عملیاتی هنوز برای sprint بعدی باز است.

## D-024 - انتخاب Kysely + pg برای Database Access

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

Development Sprint 1 باید PostgreSQL foundation را بدون ورود به ORM سنگین شروع می‌کرد و migrationهای SQL با طراحی Phase 7 شفاف بمانند.

Decision:

برای دسترسی به database از Kysely + pg استفاده می‌شود. migrationها به‌صورت SQL صریح و runner داخلی اجرا می‌شوند.

Consequences:

- queryها type-safe و نزدیک به SQL می‌مانند.
- migrationها قابل بازبینی و sync با مستند Database/API هستند.
- برخی امکانات ORM کامل مثل relation loading خودکار عمداً وارد MVP foundation نشدند.

## D-025 - مسیر موبایل: PWA قبل از Native App

تاریخ: 2026-08-11

وضعیت: Accepted

Context:

4D به تجربه موبایل نیاز جدی دارد، اما هنوز چند ریسک foundation مثل object storage عکس، bot protection سمت سرور، unread/notification چت و beta واقعی باقی مانده است. شروع native app قبل از تثبیت این موارد، دوباره‌کاری در دو کلاینت ایجاد می‌کند.

Decision:

قبل از ساخت کامل اپ native، web app به شکل PWA/installable آماده می‌شود. Native mobile با React Native + Expo بعد از تثبیت beta، object storage، bot protection و chat readiness شروع خواهد شد.

Consequences:

- تست روی موبایل واقعی زودتر ممکن می‌شود.
- هزینه شروع native app تا زمان تثبیت API و جریان‌های اصلی کنترل می‌شود.
- مسیر پیشنهادی native همچنان TypeScript/React Native + Expo باقی می‌ماند و می‌تواند از contractهای shared استفاده کند.

## D-026 - Media Storage Baseline قبل از Object Storage نهایی

تاریخ: 2026-08-12

وضعیت: Accepted

Context:

ذخیره عکس آگهی به شکل base64 داخل رکورد آگهی، هم payload ثبت آگهی را سنگین می‌کرد و هم مسیر production object storage را عقب می‌انداخت. هنوز provider نهایی object storage انتخاب نشده، اما frontend و API باید از همین حالا با مفهوم upload و URL کار کنند.

Decision:

در Sprint 28، local media storage به‌عنوان baseline میانی اضافه شد. عکس فشرده‌شده از مسیر `POST /api/v1/media/listing-images` آپلود می‌شود، در `data/media` ذخیره می‌شود و URL عمومی `/media/...` برمی‌گرداند. رکورد آگهی فعلا همان ستون قبلی را برای نگهداری URL استفاده می‌کند تا migration پرریسک لازم نباشد.

Consequences:

- base64 از payload نهایی submit آگهی و داده ذخیره‌شده آگهی حذف می‌شود.
- مهاجرت آینده به S3/MinIO/R2 ساده‌تر می‌شود چون contract کلاینت upload/URL شده است.
- local media storage برای production کافی نیست و باید با object storage managed، resize server-side و lifecycle cleanup جایگزین شود.

## D-027 - Captcha Proof سمت سرور برای OTP

تاریخ: 2026-08-12

وضعیت: Accepted

Context:

پازل ضد bot در UI تجربه بهتری ایجاد می‌کرد، اما تا Sprint 28 فقط client-side بود و API بدون proof معتبر هم می‌توانست OTP ارسال کند. مسیر OTP هزینه و ریسک abuse دارد، مخصوصاً وقتی SMS واقعی فعال است.

Decision:

در Sprint 29، API دو endpoint `GET /api/v1/auth/captcha-challenge` و `POST /api/v1/auth/captcha-proof` اضافه کرد. challenge در حافظه سرور کوتاه‌عمر است، proof با `SESSION_SECRET` امضا می‌شود و برای `POST /api/v1/auth/request-otp` الزامی است.

Consequences:

- ارسال OTP بدون حل challenge سمت سرور رد می‌شود.
- proof یک‌بارمصرف است و replay ساده را کم می‌کند.
- این baseline جایگزین provider ضد bot production-grade نیست و قبل از public release باید با reputation/observability تکمیل شود.

## D-028 - محدودیت تلاش ناموفق ورود با رمز

تاریخ: 2026-08-12

وضعیت: Accepted

Context:

بعد از اضافه شدن ورود با رمز، مسیر `password-login` بدون محدودیت اختصاصی می‌توانست هدف brute force روی شماره موبایل شود. rate limit عمومی API برای کنترل کلی مفید است، اما برای تلاش‌های ناموفق ورود کافی نیست.

Decision:

در Sprint 30، برای ورود با رمز یک bucket کوتاه‌عمر in-memory بر اساس IP و شماره موبایل اضافه شد. بعد از ۸ تلاش ناموفق در ۱۰ دقیقه، endpoint خطای `rate_limited` می‌دهد. بعد از ورود موفق، bucket همان شماره پاک می‌شود.

Consequences:

- brute force ساده روی رمز کاهش پیدا می‌کند.
- تجربه کاربر در UI برای خطای 429 واضح‌تر می‌شود.
- این baseline همچنان برای production به storage مشترک مثل Redis یا provider rate limit خارجی نیاز دارد.

## D-029 - Read State سبک برای گفتگو قبل از Realtime

تاریخ: 2026-08-12

وضعیت: Accepted

Context:

چت داخل برنامه برای جلوگیری از نمایش عمومی شماره ساخته شده بود، اما بدون unread count و preview آخرین پیام، برای کاربر حس inbox واقعی نداشت. اضافه کردن WebSocket یا push notification در این مرحله قبل از تثبیت beta، deploy target و object storage هزینه معماری را بالا می‌برد.

Decision:

در Sprint 32 جدول `conversation_reads` به PostgreSQL اضافه شد تا آخرین زمان خواندن هر گفتگو برای هر کاربر نگهداری شود. API گفتگوهای کاربر، unread count و metadata آخرین پیام را برمی‌گرداند و web app با polling سبک ۳۰ ثانیه‌ای inbox را تازه می‌کند.

Consequences:

- تجربه گفتگو برای MVP کاربردی‌تر و زنده‌تر می‌شود.
- مهاجرت آینده به realtime یا push notification ساده‌تر است، چون read state مستقل و persisted شده است.
- این تصمیم جایگزین notification production-grade، block/report پیام و read receipt کامل نیست.

## D-030 - گزارش پیام چت از مسیر یکپارچه Reports

تاریخ: 2026-08-12

وضعیت: Accepted

Context:

چت داخل برنامه به بخشی از تجربه تماس امن تبدیل شده است و قبل از beta واقعی باید راه ساده‌ای برای گزارش پیام آزاردهنده، مشکوک یا نامناسب وجود داشته باشد. در سیستم فعلی، reports و moderation_cases از قبل برای محتوا وجود داشتند و ساخت مسیر جدا برای پیام‌ها باعث دوگانگی moderation می‌شد.

Decision:

در Sprint 33 گزارش پیام با همان endpoint عمومی `POST /api/v1/reports` و `target_type=message` انجام می‌شود، اما API قبل از ثبت گزارش بررسی می‌کند که گزارش‌دهنده participant گفتگوی مربوط به آن پیام باشد. پنل moderation برای report پیام، preview متن پیام را از `conversation_messages` نمایش می‌دهد.

Consequences:

- moderation پیام و محتوای marketplace در یک queue باقی می‌ماند.
- گزارش پیام تصادفی یا خارج از گفتگوی کاربر پذیرفته نمی‌شود.
- block/mute، read receipt کامل و policy پیشرفته گفتگو همچنان برای فازهای بعدی باقی مانده‌اند.

## D-031 - Mute گفتگو قبل از Block کامل

تاریخ: 2026-08-12

وضعیت: Accepted

Context:

بعد از اضافه شدن report پیام، نیاز بعدی کنترل مزاحمت در چت بود. block کامل کاربر تصمیم محصولی حساس‌تری است، چون باید مشخص کند پیام طرف مقابل چه می‌شود، آیا طرف مقابل متوجه block می‌شود یا نه و چه policyهایی برای abuse لازم است.

Decision:

در Sprint 34 ابتدا mute/unmute گفتگو اضافه شد. preference هر کاربر برای هر گفتگو در جدول `conversation_preferences` ذخیره می‌شود و گفتگوهای mute شده در badge پیام‌های جدید حساب نمی‌شوند.

Consequences:

- کاربر بدون بستن کامل مسیر ارتباطی می‌تواند مزاحمت notification/badge را کم کند.
- مسیر future برای notification/push آماده‌تر می‌شود، چون preference کاربر persisted شده است.
- block کامل کاربر، mute زمان‌دار و policy abuse همچنان برای فازهای بعدی باقی مانده‌اند.

## D-032 - Block در سطح گفتگو قبل از Block سراسری کاربر

تاریخ: 2026-08-12

وضعیت: Accepted

Context:

بعد از report پیام و mute گفتگو، کاربر هنوز راهی برای توقف کامل پیام‌های یک گفتگوی مزاحم نداشت. block سراسری کاربر در همه آگهی‌ها و گفتگوها policy پیچیده‌تری می‌خواهد، چون ممکن است روی معامله‌های دیگر، گزارش‌های ادمین و رفتار طرف مقابل اثر بگذارد.

Decision:

در Sprint 35 ابتدا block در سطح conversation اضافه شد. رکوردها در جدول `conversation_blocks` ذخیره می‌شوند، API ارسال پیام را برای هر گفتگوی blocked رد می‌کند و error code مشترک `conversation_blocked` ثبت شد.

Consequences:

- کاربر می‌تواند مسیر پیام یک گفتگوی خاص را ببندد.
- block هنوز scoped است و اثر ناخواسته روی همه تعاملات کاربر مقابل ندارد.
- block سراسری کاربر، appeal policy و رفتار notification برای حالت block هنوز برای فازهای بعدی باقی مانده‌اند.

## D-033 - Notification سبک وب قبل از Push سروری

تاریخ: 2026-08-12

وضعیت: Accepted

Context:

چت اکنون unread، mute، block و report دارد، اما کاربر برای پیام جدید فقط badge می‌دید. push سروری کامل به service worker، subscription، backend delivery و policy بیشتری نیاز دارد و قبل از beta واقعی هزینه زیادی دارد.

Decision:

در Sprint 36 ابتدا notification سبک وب اضافه شد. web app با polling موجود افزایش unread را تشخیص می‌دهد، notification tray داخل برنامه نشان می‌دهد و در صورت اجازه کاربر، از Browser Notification API هم استفاده می‌کند. گفتگوهای mute شده، blocked یا گفتگوی فعال اعلان جدید نمی‌سازند.

Consequences:

- تجربه چت زنده‌تر می‌شود بدون اضافه کردن زیرساخت push سروری.
- مسیر آینده برای push واقعی روشن‌تر است چون رفتار notification و mute/block در UI تثبیت شده است.
- notification فقط وقتی web app باز و در حال polling است قابل اتکاست؛ push سروری و realtime هنوز باقی مانده‌اند.

## D-034 - ذخیره Push Subscription قبل از Delivery Worker

تاریخ: 2026-08-12

وضعیت: Accepted

Context:

بعد از notification سبک وب، قدم بعدی باید مسیر production برای Push واقعی را آماده کند. ارسال push کامل به VAPID keys، worker یا job ارسال، مدیریت endpointهای منقضی، retry و policy mute/block نیاز دارد. ساخت همه این‌ها در یک sprint ریسک بالایی دارد، اما ثبت امن subscription دستگاه پیش‌نیاز مشترک همه مسیرهای بعدی است.

Decision:

در Sprint 37 ابتدا baseline ذخیره و مدیریت subscription اضافه شد. جدول `push_subscriptions` endpoint و کلیدهای `p256dh/auth` را برای هر کاربر نگه می‌دارد، API protected برای list/upsert/revoke ساخته شد، وب با `VITE_VAPID_PUBLIC_KEY` می‌تواند subscription واقعی مرورگر را ثبت کند و service worker رویدادهای `push` و `notificationclick` را مدیریت می‌کند. ارسال سروری push هنوز عمداً اضافه نشده است.

Consequences:

- مسیر production push مرحله‌ای شد و بدون وابستگی فوری به worker ارسال قابل تست است.
- نبود VAPID key در محیط توسعه با پیام واضح به کاربر/توسعه‌دهنده اعلام می‌شود.
- delivery worker، حذف endpointهای invalid، payload policy و احترام کامل به mute/block در سمت ارسال هنوز باقی مانده‌اند.

## D-035 - Push Delivery به صورت Best-Effort داخل API

تاریخ: 2026-08-12

وضعیت: Accepted

Context:

بعد از ذخیره subscription، اولین ارزش واقعی Push باید روی پیام جدید چت دیده شود. راه‌اندازی job queue مستقل، retry پیشرفته و real-time کامل برای MVP هنوز سنگین است، اما ارسال مستقیم و best-effort از API می‌تواند مسیر واقعی را فعال کند بدون اینکه تجربه ارسال پیام را شکننده کند.

Decision:

در Sprint 38 ارسال Web Push پس از ثبت پیام چت به صورت asynchronous و best-effort در همان API انجام می‌شود. اگر VAPID keys تنظیم نشده باشند delivery skip می‌شود. اگر گفتگوی گیرنده mute باشد push ارسال نمی‌شود. خطای push باعث شکست ارسال پیام نمی‌شود و subscriptionهایی که provider با 404 یا 410 رد کند revoke می‌شوند.

Consequences:

- پیام جدید می‌تواند حتی بیرون از صفحه باز برنامه notification واقعی بسازد.
- API فعلاً نقش delivery worker سبک را هم بازی می‌کند و در صورت رشد ترافیک باید به job queue جدا منتقل شود.
- retry/backoff، analytics delivery و تنظیمات granular notification هنوز باقی مانده‌اند.

## D-036 - تست Push توسط خود کاربر قبل از Diagnostic پیشرفته

تاریخ: 2026-08-12

وضعیت: Accepted

Context:

بعد از فعال شدن VAPID و delivery، تشخیص اینکه مشکل از کلید، permission مرورگر، subscription یا خود delivery است برای کاربر و توسعه‌دهنده سخت می‌شود. ساخت dashboard diagnostic کامل هنوز زود است، اما یک تست مستقیم از پروفایل می‌تواند مسیر end-to-end را سریع تایید کند.

Decision:

در Sprint 40 endpoint محافظت‌شده `POST /api/v1/me/push-test` اضافه شد تا کاربر واردشده برای دستگاه‌های Push ثبت‌شده خودش اعلان تستی بفرستد. UI پروفایل فقط وقتی subscription فعال وجود دارد دکمه تست را نشان می‌دهد و نتیجه‌های skipped، sent، no subscription و failure را با پیام قابل فهم نمایش می‌دهد.

Consequences:

- تست دستی Push بدون نیاز به ساخت پیام چت واقعی ممکن می‌شود.
- عیب‌یابی setup محلی و beta ساده‌تر می‌شود.
- telemetry کامل delivery، retry/backoff و dashboard سلامت Push هنوز باقی مانده‌اند.
## D-018 - جدا کردن secretهای VAPID از فایل نمونه و افزودن release preflight

تاریخ: 2026-08-12

وضعیت: Accepted

Context:

فایل `.env.example` شامل private key واقعی VAPID بود و برای انتشار نیز کنترل متمرکز artifactها و envهای ضروری وجود نداشت.

Decision:

private key و API key واقعی از فایل نمونه حذف شدند. ابزار `npm run release:check` برای کنترل artifactهای API/web/PWA و hygiene secretها اضافه شد و حالت strict آن envهای لازم production را بررسی می‌کند.

Consequences:

- نمونه env قابل commit و اشتراک‌گذاری باقی می‌ماند.
- قبل از deploy خطاهای واضح artifact یا secret زودتر دیده می‌شوند.
- media local همچنان برای beta مناسب است، اما production واقعی به volume پایدار یا object storage نیاز دارد.
## D-037 - آداپتر AvalAI برای قابلیت‌های AI با fallback محلی

تاریخ: 2026-08-12

وضعیت: Accepted

برای اتصال قابلیت‌های هوش مصنوعی محصول، provider `avalai` با قرارداد OpenAI-compatible و endpoint `/v1/responses` استفاده می‌شود. مدل پیش‌فرض `gpt-5.6-luna` است و کلید فقط در environment واقعی backend با نام `AVALAI_API_KEY` قرار می‌گیرد؛ هرگز به frontend یا artifactهای build منتقل نمی‌شود.

پاسخ مدل فقط به‌عنوان پیشنهاد برای کاربر استفاده می‌شود. پاسخ JSON قبل از نمایش normalize می‌شود و در نبود کلید، خطای شبکه یا پاسخ نامعتبر، بررسی محلی فعلی به‌عنوان fallback برمی‌گردد. AI حق انتشار، حذف یا تصمیم moderation خودکار ندارد.

پیامدها:

- قابلیت AI در توسعه بدون کلید هم قابل استفاده می‌ماند.
- برای فعال‌سازی provider واقعی، `AI_PROVIDER=avalai`، `AI_MODEL=gpt-5.6-luna` و `AVALAI_API_KEY` لازم است.
- هزینه، quota و latency provider باید در pilot پایش شود.
## D-038 - AI به‌عنوان Copilot تعاملی، نه پیام یک‌خطی

تاریخ: 2026-08-12

خروجی AI در فرم ثبت آگهی به‌صورت پنل ساختاریافته نمایش داده می‌شود. کاربر می‌تواند پیشنهاد عنوان و توضیحات را جداگانه اعمال کند و category، price hint، score و tips را ببیند. هیچ پیشنهاد AI بدون اقدام صریح کاربر روی آگهی اعمال یا منتشر نمی‌شود.
## D-039 - ارسال metadata تصویر به‌جای عکس خام برای AI

تاریخ: 2026-08-12

برای فاز کیفیت تصویر، فقط width، height، size و MIME type در prompt AI قرار می‌گیرد. تصویر خام به provider خارجی ارسال نمی‌شود تا حریم خصوصی و هزینه کنترل شود. بررسی vision واقعی به فاز جداگانه و پس از تصمیم صریح درباره storage، consent و provider موکول است.
## D-040 - جست‌وجوی relevance-based قبل از embedding

تاریخ: 2026-08-12

برای MVP توسعه‌یافته، جست‌وجوی فارسی با normalize و scoring محلی اجرا شد و پیشنهاد مشابه‌ها از category، city، condition و واژه‌های عنوان استفاده می‌کند. embedding و semantic search واقعی بعد از pilot و اندازه‌گیری search success اضافه می‌شود تا هزینه و پیچیدگی قبل از داشتن داده واقعی تحمیل نشود.
## D-041 - استفاده از لوگوی مالک و اعتماد قابل اثبات

تاریخ: 2026-08-12

لوگوی ارسالی مالک به‌عنوان asset اصلی برند در هدر وب استفاده شد. برای favicon و PWA icon، asset مربعی موجود حفظ شد تا آیکن نصب‌شده خوانا بماند. Trust Layer فقط mobile verified، profile complete، تعداد آگهی و تعداد گفتگو را نمایش می‌دهد؛ business badge یا reputation score بدون داده و API واقعی ساخته نمی‌شود.
## D-059 - Business profile as a bounded trust surface

Date: 2026-08-12  
Status: Accepted

- Business identity در جدول مستقل `business_profiles` ذخیره می‌شود.
- ویرایش فقط برای کاربر احراز‌شده موبایلی مجاز است.
- نمایش عمومی فقط با `is_public = true` انجام می‌شود.
- badge، review و verification تجاری تا زمان وجود evidence واقعی deferred هستند.
## D-060 - تفکیک asset افقی و لوگومارک

Date: 2026-08-12  
Status: Accepted

برای جلوگیری از فشرده‌شدن یا بدنمایی لوگو، نسخه `4d-logo-horizontal.png` فقط برای header و نسخه `4d-mark.png` برای favicon/PWA استفاده می‌شود. asset قبلی `4d-logo.png` در UI جدید deprecated است.
## D-061 - Analytics فقط برای eventهای قابل اثبات

Date: 2026-08-12  
Status: Accepted

Analytics فاز فعلی فقط eventهای واقعی `listing_view`، `favorite_added` و `contact_started` را ذخیره می‌کند. امتیازدهی، badge و رتبه‌بندی تا زمان داشتن evidence معتبر ساخته نمی‌شوند.
## D-062 - کنترل کاربر روی analytics شخصی

Date: 2026-08-13  
Status: Accepted

داشبورد فقط aggregateهای آگهی‌های متعلق به کاربر را نشان می‌دهد. کاربر می‌تواند ثبت eventهای شخصی آینده را متوقف کند و eventهای actor خود را حذف کند؛ eventهای ناشناس برای aggregate محصولی با این کنترل حذف نمی‌شوند.
## D-063 - Trust signal سابقه پاسخ‌گویی

Date: 2026-08-13  
Status: Accepted

سابقه پاسخ‌گویی فقط از conversationهایی محاسبه می‌شود که فروشنده واقعاً حداقل یک پیام ارسال کرده است. برای فروشنده بدون conversation مقدار `null` نمایش داده می‌شود؛ عدد صفر جعلی تولید نمی‌شود.
## D-064 - Media asset contract مستقل از provider

Date: 2026-08-13  
Status: Accepted

Upload API از این پس `asset_id`، `storage_key`، `public_url`، `mime_type`، `size_bytes` و `checksum_sha256` را به‌عنوان قرارداد برمی‌گرداند. adapter محلی برای development حفظ می‌شود و provider production می‌تواند بدون تغییر کلاینت به object storage منتقل شود.
## D-065 - S3-compatible object storage برای production

Date: 2026-08-13  
Status: Accepted

media provider از طریق `MEDIA_STORAGE_PROVIDER` انتخاب می‌شود. `local` فقط برای development/beta است؛ production باید `s3` با bucket، credentials و public base URL داشته باشد. این قرارداد برای AWS S3، MinIO و providerهای S3-compatible قابل استفاده است.
## D-068 - احراز هویت دو مسیره در موبایل

Date: 2026-08-13  
Status: Accepted

موبایل باید هم ورود با رمز عبور و هم ورود با پیامک را ارائه کند. مسیر پیامک قبل از `request-otp` از challenge/proof سمت API استفاده می‌کند و verify با فیلد `otp` انجام می‌شود. رمز عبور برای کاربرانی که قبلاً در پروفایل آن را تنظیم کرده‌اند، مسیر سریع ورود است.

## D-067 - router محدود داخلی برای MVP موبایل

Date: 2026-08-13  
Status: Accepted

در export اندروید، dependency مربوط به `react-native-screens` خطای Fabric codegen ایجاد کرد. برای حفظ قابلیت build و کاهش ریسک native، MVP موبایل از router محدود داخلی استفاده می‌کند. بعد از تثبیت نسخه‌های native و build profile، مهاجرت به navigation library دوباره ارزیابی می‌شود.

## D-066 - شروع native mobile با Expo و Android-first

Date: 2026-08-13  
Status: Accepted

اپ native در `apps/mobile` با React Native + Expo شروع می‌شود. نسخه اول فقط تجربه کاربر/فروشنده را پوشش می‌دهد؛ admin روی Web می‌ماند. navigation سبک فعلی تا تثبیت flowها استفاده می‌شود و بعداً در صورت افزایش scope به navigation library منتقل خواهد شد.

## D-069 - مختصات فیزیکی برای تعامل drag و runtime production-first موبایل

Date: 2026-08-16
Status: Accepted

- متن و ترتیب محتوای رابط فارسی RTL می‌ماند، اما مقدار افقی drag puzzle با مختصات فیزیکی `left` محاسبه و رسم می‌شود تا مرورگر یا React Native آن را وارونه نکند.
- پازل فقط بعد از drag واقعی و ورود قطعه به tolerance سمت API proof می‌سازد؛ tap ساده تایید محسوب نمی‌شود.
- build موبایل در نبود env محلی از `https://api.4dbazar.ir` استفاده می‌کند. override با `EXPO_PUBLIC_API_BASE_URL` برای توسعه محلی حفظ می‌شود.
- لوگومارک رسمی برای app/adaptive icon و نسخه افقی شفاف برای داخل اپ استفاده می‌شود؛ asset افقی نباید به‌عنوان آیکن مربع کشیده شود.
- fallback حافظه‌ای rate limit فقط در development/test و هنگام در دسترس نبودن PostgreSQL مجاز است؛ production برای OTP و ورود با رمز در نبود persistence باید fail-closed باشد.

## D-070 - artifact مستقل و deterministic برای cPanel

Date: 2026-08-16
Status: Accepted

- انتشار API shared hosting از monorepo یا workspace install انجام نمی‌شود؛ `npm run release:cpanel` یک package مستقل تولید می‌کند.
- نسخه runtime dependencyها از root lockfile استخراج و دقیق pin می‌شوند تا نصب دستی `zod` یا packageهای ناسازگار تکرار نشود.
- startup رسمی `apps/api/dist/main.js` است و package فقط dist، migration، seed، shared runtime و manifest لازم را حمل می‌کند.
- فایل واقعی `.env`، secret و `node_modules` محلی داخل artifact قرار نمی‌گیرند.

## D-071 - صداقت داده production و cache شبکه‌محور

Date: 2026-08-16
Status: Accepted

- feed و ثبت آگهی production نباید demo item یا success preview محلی را با داده واقعی مخلوط کند.
- شکست ثبت آگهی باید فرم کاربر را حفظ و خطای واقعی را نمایش دهد.
- navigation در Service Worker به‌صورت network-first و با cache version جدید است؛ shell قدیمی نباید نسخه تازه را در Chrome پنهان کند.
- browser CORS فقط برای originهای ثبت‌شده در `CORS_ORIGINS` پاسخ می‌دهد؛ native client بدون Origin همچنان مجاز است.

## D-072 - APK مستقل برای تست محدود Android

Date: 2026-08-17
Status: Accepted

- profile رسمی تست محدود `preview` است و باید APK با `distribution=internal` بسازد؛ Development Build به Metro وابسته است و برای کاربر آزمایشی ارسال نمی‌شود.
- `EXPO_PUBLIC_API_BASE_URL` داخل profileهای EAS روی API production تنظیم می‌شود تا APK بدون کامپیوتر کار کند.
- تغییر launcher icon نیازمند native rebuild و نصب مجدد است؛ Metro reload آیکن package نصب‌شده را تغییر نمی‌دهد.
- profile `production` فقط AAB فروشگاهی می‌سازد و جای APK تست محدود را نمی‌گیرد.

## D-073 - Quality gate چندمرورگری و دفاع چندلایه release candidate

Date: 2026-08-17
Status: Accepted

- release وب فقط با build production، بودجه bundle، visual QA و ماتریس Chromium/Firefox/WebKit در viewport موبایل، تبلت و دسکتاپ پذیرفته می‌شود.
- quality gate باید نبود صفحه خالی، overflow افقی، خطای runtime و violation جدی/بحرانی Axe را برای بازار، پروفایل و ادمین بررسی کند.
- API علاوه بر schema validation باید body limit، redaction داده حساس، headerهای امنیتی، پاسخ no-store برای مسیرهای حساس و بررسی magic-byte تصویر داشته باشد.
- هشدارهای dependency زنجیره Expo با `npm audit fix --force` رفع نمی‌شوند؛ ارتقای major فقط در migration کنترل‌شده همراه با device QA انجام می‌شود.

## D-074 - مرز بازار خدمات، تعرفه و OTP Autofill

Date: 2026-08-17
Status: Accepted

- آگهی ارائه خدمت باید با `content_type=service_listing` ذخیره شود و نباید فقط category خدمات روی یک `listing` عمومی باشد.
- تعرفه انتشار از کاتالوگ دیتابیس خوانده و هنگام انتخاب روی publication snapshot می‌شود؛ مبلغ ارسالی کلاینت منبع حقیقت نیست.
- تا تعیین provider، مسیر پولی fail-closed است. دوره آزمایشی فقط با `is_beta_waived` صریح و ثبت مبلغ اصلی مجاز است.
- اجرای Sprint 92 به تکمیل exit criteria اسپرینت ۹۱ وابسته است؛ طراحی آن می‌تواند آماده شود اما منطق مالی قبل از release gate وارد RC نمی‌شود.
- موبایل برای OTP از Autofill استاندارد سیستم‌عامل و verify خودکار کد شش‌رقمی استفاده می‌کند. مجوزهای کامل خواندن/دریافت SMS اضافه نمی‌شوند؛ SMS User Consent بومی فقط در فاز مستقل و همراه EAS rebuild بررسی می‌شود.

## D-075 - سیستم طراحی مشترک و اولویت feed در تجربه بازار

Date: 2026-08-17
Status: Accepted

- Web و Mobile از tokenهای مشترک Navy، Teal، Gold، Coral، canvas خنثی، radius هشت و spacing پایه استفاده می‌کنند.
- در viewport موبایل، feed و جستجو بر فرم ثبت و فیلترهای پیشرفته اولویت دارند؛ navigation اصلی پایین viewport قرار می‌گیرد.
- hero بازار باید فشرده و محصولی باشد و نمایش آگهی واقعی را از نمای اول خارج نکند.
- هر تغییر بصری مهم باید quality QA وب و Android export را پاس کند و native UX فقط پس از device QA نهایی است.

## D-076 - taxonomy کاربردی و بنر محصولی بازار

Date: 2026-08-17
Status: Accepted

- دسته‌بندی‌ها بر اساس الگوی رایج بازارهای نیازمندی ایرانی به گروه‌های کالا، خودرو، املاک، خدمات، استخدام، آموزش و فعالیت‌های محلی گسترش می‌یابند؛ taxonomy فعلاً flat و قابل جست‌وجو می‌ماند تا قبل از نیاز واقعی، پیچیدگی parent/child وارد MVP نشود.
- banner بازار به‌صورت تصویر پس‌زمینه برندمحور با فضای خالی برای متن تولید می‌شود؛ متن فارسی، CTA و آمار باید در HTML/Native رندر شوند تا خوانایی، accessibility و SEO حفظ شود.
- خطاهای پروفایل باید پیام قابل‌فهم API را نمایش دهند و خطای foreign key شهر نامعتبر نباید به پاسخ 500 تبدیل شود.

## D-077 - CORS و پایه انتشار خدمات

Date: 2026-08-17
Status: Accepted

- API باید preflightهای وب را با `PUT`، `PATCH` و headerهای احراز هویت لازم پاسخ دهد؛ خطای CORS نباید به‌عنوان `Failed to fetch` در UI دیده شود.
- فرم خدمت با `content_type=service_listing` و فیلدهای حوزه، مدل قیمت‌گذاری و زمان ارائه ذخیره می‌شود. تعرفه، snapshot انتشار و پرداخت به مرحله مالی Sprint 92 موکول می‌شود و در این تغییر پرداخت صوری وجود ندارد.
- **D-081 - URL media در کلاینت از origin API resolve می‌شود (2026-08-18):** چون API برای media محلی مسیر نسبی برمی‌گرداند، Web نباید آن را نسبت به دامنه frontend تفسیر کند. تمام نمایش‌های تصویر از resolver مشترک استفاده می‌کنند و پاسخ upload بدون `data.url` قابل قبول نیست.
- **D-082 - قرارداد قیمت ثابت/توافقی در UI و API یکسان است (2026-08-18):** حالت `negotiable` مبلغ را پاک و ارسال نمی‌کند؛ حالت `fixed` مبلغ مثبت می‌خواهد و UI مقدار را با جداکننده هزارگان نمایش می‌دهد. اعتبارسنجی نهایی در API باقی می‌ماند.
- **D-083 - Local Media رایگان تا زمان تأیید هزینه (2026-08-18):** مهاجرت به Object Storage فعلاً انجام نمی‌شود. تصویرها روی `data/media` می‌مانند و ابزار `media:backup`/`media:verify` با manifest و SHA-256 برای backup و restore محلی اضافه شده است. این تصمیم برای RC کم‌هزینه است و به‌معنای مناسب‌بودن local storage برای public production نیست.

## D-084 - پروفایل دوحالته و پشتیبانی کم‌حجم

Date: 2026-08-21
Status: Accepted

- «وضعیت حساب» فقط نشان‌دهنده اعتماد، احراز و آمادگی انتشار است؛ «اطلاعات حساب» داده قابل ویرایش کاربر است و نباید دو فرم تکراری نشان داده شود.
- پشتیبانی در مسیر اصلی پروفایل به‌صورت دکمه آیکونی با popup ارائه می‌شود تا قابلیت در دسترس بماند اما فضای صفحه را اشغال نکند.

## D-085 - releaseهای cPanel نسخه‌دار و قابل rollback

Date: 2026-08-21
Status: Accepted

اسکریپت release ابتدا در staging موقت build می‌کند و ZIPهای نسخه‌دار را بدون حذف artifactهای قبلی تولید می‌کند. مقصد deploy باید `data/media` و env را حفظ کند و فقط artifact نسخه جدید را جایگزین کند.

### D-086 - انتشار آگهی و خدمت در مودال

- **تصمیم:** فرم‌های انتشار در صفحه بازار دائمی نمایش داده نشوند و از طریق مودال باز شوند.
- **دلیل:** کاهش شلوغی صفحه، خوانایی بهتر موبایل و تفکیک واضح وظیفه انتشار از مرور بازار.

### D-087 - حفظ مرز دسترسی فهرست کاربران

- **تصمیم:** مسیر فهرست کاربران فقط برای نقش `admin` باقی بماند؛ moderator فقط صف محتوا و پشتیبانی را ببیند.
- **دلیل:** اطلاعات کاربران حساس است و نباید برای رفع مشکل UI، مجوز API تضعیف شود.
## D-088 - Multi-Agent به‌صورت role gate داخلی

- تاریخ: ۱۴۰۵/۰۵/۳۰
- تصمیم: چون ابزار مستقل orchestration چندعاملی در این محیط callable نیست، نقش‌های Product، Architecture، Backend، Web، Mobile، Security، QA و Review به‌صورت گیت‌های داخلی در اجرای phase استفاده شوند.
- دلیل: قابلیت محیطی را نمی‌توان از داخل محصول فعال کرد و نباید آن را با feature محصول اشتباه گرفت.

## D-089 - تست بار فقط روی محیط محلی/تستی ایزوله

- تاریخ: ۱۴۰۵/۰۵/۳۰
- تصمیم: harness تست ۳۰۰ کاربر فقط مقصدهای local/test را قبول کند و هر مقصد production را رد کند.
- دلیل: اجرای ramp-up روی بازار واقعی می‌تواند به کاربران، provider پیامک، داده‌های persisted و منابع هاست آسیب بزند. بدون DB/API تست ایزوله، نتیجه عملکردی معتبر هم تولید نمی‌شود.
- پیامد: تا راه‌اندازی Docker/PostgreSQL تستی، مرحله اجرای ramp-up و stress در وضعیت blocked باقی می‌ماند.

## D-090 - غرفه مستقل از پروفایل کسب‌وکار

Date: 2026-08-22
Status: Accepted

- `Storefront` موجودیت عمومی و قابل اشتراک است و `business_profiles` موجودیت اطلاعات تکمیلی مالک باقی می‌ماند.
- در MVP هر مالک یک غرفه دارد؛ آگهی می‌تواند بدون غرفه یا با `storefront_id` ثبت شود.
- انتشار غرفه پس از moderation انجام می‌شود و public endpoint فقط وضعیت `active` را نمایش می‌دهد.
- پرداخت، اشتراک، staff، follow و قابلیت‌های کامل تجارت الکترونیک deferred هستند.
## D-091 - مسیر عمومی غرفه و فرم مالک

- تاریخ: ۱۴۰۵/۰۶/۰۱
- تصمیم: UI مالک غرفه در disclosure مستقل پروفایل قرار می‌گیرد و صفحه عمومی با URL پایدار `/storefront/{slug}` ارائه می‌شود.
- دلیل: کاربر بین اطلاعات حساب، پروفایل کسب‌وکار و صفحه قابل اشتراک غرفه تفاوت روشن می‌خواهد؛ آگهی نیز باید بتواند بدون غرفه باقی بماند.
- پیامد: public فقط `active` و آگهی‌های `approved` را می‌بیند؛ integration smoke و ZIP release به increment بعد موکول است.
## D-092 - کارت آگهی به‌عنوان ناحیه ناوبری، نه کنترل‌های تو در تو

- **تصمیم:** محتوای غیرتعاملی کارت آگهی در وب نقش button دارد و با click/Enter/Space detail را باز می‌کند؛ Favorite و CTA تماس کنترل‌های مستقل باقی می‌مانند و event propagation را متوقف می‌کنند.
- **دلیل:** کاهش اصطکاک Marketplace و حفظ دسترسی‌پذیری بدون nested interactive element.
- **دامنه:** Web در Sprint 94؛ Mobile پس از parity review.
- **پیامد:** هر کنترل جدید داخل کارت باید مستقل و با keyboard semantics معتبر اضافه شود.
## D-095 - انتخاب‌گر جست‌وجوپذیر برای فهرست‌های بلند

Date: 2026-08-22

برای شهرها و دسته‌های پرتعداد، UI فقط چند گزینه اول را نشان می‌دهد و جست‌وجو را مسیر اصلی دسترسی به سایر گزینه‌ها می‌کند؛ native select بلند در فیلتر و فرم انتشار استفاده نمی‌شود.

## D-096 - صف غرفه در پنل moderation

Date: 2026-08-22

غرفه با وضعیت `pending_review` باید در پنل moderator/admin دیده شود و تصمیم تأیید یا توقف از API رسمی storefront انجام شود؛ fallback یا داده نمایشی قابل قبول نیست.

## D-097 - گالری عمومی و پشتیبانی مستقل از layout

تاریخ: ۱۴۰۵/۰۶/۳۱

- گالری رسانه در کارت public storefront و drawer جزئیات با thumbnail و navigation قابل مشاهده است.
- لینک غرفه فقط از `storefront_slug` معتبر ساخته می‌شود و public همچنان به وضعیت `active` وابسته است.
- Support FAB و panel با Portal زیر `document.body` mount می‌شوند تا overflow/transform والد روی position ثابت اثر نگذارد؛ لایه آن‌ها زیر modal است.
- شمارنده بازدید از analytics eventها در detail API محاسبه می‌شود و به کارت analytics پروفایل وابسته نیست.

## D-098 - smoke مقصد باید قرارداد JSON را هم بررسی کند

تاریخ: ۱۴۰۵/۰۶/۳۱

smoke عمومی علاوه بر HTTP status، شکل پاسخ‌های health، feed، شهرها، دسته‌ها و کپچا را بررسی می‌کند. قرارداد کپچا شامل `challenge_id`، `target` و `y` است. صف غرفه نیز اطلاعات مالک را با join به `user_profiles` و `users` برمی‌گرداند تا بررسی ادمین قابل اتکا باشد.

## D-099 - قرارداد metadata در خود دسته نگهداری می‌شود

تاریخ: ۱۴۰۵/۰۶/۳۱

برای جلوگیری از جدا شدن فرم وب، فیلتر و API، schema فیلدهای اختصاصی در `categories.metadata_schema` نگهداری می‌شود و مقدار آگهی در `market_contents.metadata_json` ذخیره می‌گردد. schema شامل key، label، type، required و options است؛ پنل ویرایش schema فعلاً deferred است.

## D-100 - صفحه مستقل برای جزئیات آگهی

## D-101 - حمل‌ونقل به‌عنوان domain متصل به بازار

حمل‌ونقل محلی به‌صورت microservice یا بازار جدا ساخته نمی‌شود. جزئیات سفر در جدول یک‌به‌یک `transport_details` به `market_contents` متصل می‌شود تا moderation، مالکیت، گزارش، چت و visibility موجود دوباره استفاده شوند.

## D-102 - دو mode برای MVP حمل‌ونقل

MVP فقط `offer` برای «سفر دارم» و `request` برای «سفر می‌خواهم» دارد. رزرو قطعی، پرداخت، wallet، escrow، ردیابی زنده و dispatch تا تصمیم محصول بعدی deferred هستند.

## D-103 - AI فقط مترجم intent است

مدل زبانی اجازه تولید SQL، نام جدول یا query آزاد ندارد. AI در صورت فعال‌بودن provider فقط عبارت کاربر را به intent محدود و schema-validated تبدیل می‌کند؛ اجرای فیلترها و جست‌وجو کاملاً در search service داخلی انجام می‌شود.

## D-104 - جست‌وجوی هوشمند با fallback قطعی

نرمال‌سازی فارسی و استخراج موارد روشن ابتدا به‌صورت deterministic انجام می‌شود. timeout، خطای provider یا پاسخ نامعتبر AI نباید جست‌وجو را از کار بیندازد و باید به fallback قابل‌فهم برسد.

## D-105 - مقصد متنی با city id اختیاری

برای پشتیبانی از روستاها و مقصدهای خارج از فهرست چهار شهر اصلی، `origin_label` و `destination_label` الزامی/اصلی هستند و city id فقط به‌عنوان داده کمکی و قابل تطبیق نگه‌داری می‌شود.

تاریخ: ۱۴۰۵/۰۶/۳۱

جزئیات آگهی علاوه بر Drawer فعلی، مسیر عمومی `/listing/{id}` دارد تا لینک‌پذیری، اشتراک‌گذاری، SEO و استفاده در موبایل ممکن باشد. Drawer برای مرور سریع حفظ می‌شود و صفحه مستقل منبع تجربه کامل است.

## D-106 - جزئیات حمل‌ونقل در جدول اختصاصی متصل به آگهی

ثبت سفر از `market_contents` برای عنوان، توضیح، مالکیت، moderation و تعاملات موجود استفاده می‌کند و فیلدهای سفر در `transport_details` نگهداری می‌شوند.

## D-107 - ثبت سفر از ابتدا وارد صف moderation می‌شود

هر سفر جدید با وضعیت `submitted` در محتوای بازار ثبت می‌شود؛ فعال‌شدن آن به مسیر moderation موجود وابسته است. انتشار مستقیم برای MVP مجاز نیست.

## D-108 - لغو سفر فقط توسط مالک انجام می‌شود

در این increment فقط lifecycle انتقال `active` به `cancelled` پیاده شده است. expiry خودکار، تکمیل سفر و رزرو/ظرفیت نهایی به incrementهای بعدی موکول هستند.

## D-109 - جست‌وجوی حمل‌ونقل ابتدا deterministic است

جست‌وجوی سفر قبل از اتصال به AI با فیلترهای محدود و قابل تست در API انجام می‌شود. AI در increment بعدی فقط intent را استخراج می‌کند و اجازه ندارد مستقیماً query یا SQL بسازد. این تصمیم نتیجه‌ی پایه را قابل پیش‌بینی، قابل audit و مستقل از provider نگه می‌دارد.

تاریخ: ۱۴۰۵/۰۶/۰۳

## D-134 - جداسازی تکمیل پروفایل از password و verification status

`profile_complete` فقط باید فیلدهای هویتی لازم (`first_name`، `last_name`، `primary_city_id`) را منعکس کند. تأیید موبایل شرط جداگانه‌ی `can_create_listing` است و password فقط قابلیت ورود با رمز را تعیین می‌کند؛ بنابراین هیچ‌کدام معیار تکمیل پروفایل نیستند.

تاریخ: ۱۴۰۵/۰۶/۰۹

## D-135 - قرارداد خطای سه‌حالته CAPTCHA

کلاینت‌ها باید بین CAPTCHA لازم، نامعتبر و منقضی‌شده تفاوت بگذارند تا کاربر به‌جای پیام گمراه‌کننده‌ی اتصال اینترنت، اقدام اصلاحی درست ببیند. proof همچنان یک‌بارمصرف است.

تاریخ: ۱۴۰۵/۰۶/۰۹

## D-112 - نتیجه جست‌وجو باید بخشی از سطح بازار باشد

نتایج جست‌وجوی حمل‌ونقل در feed اصلی بازار رندر می‌شوند و هر نتیجه به جزئیات همان مورد لینک می‌شود. launcher فقط نقطه شروع جست‌وجو/ثبت است و محل نگهداری نتیجه نیست.

تاریخ: ۱۴۰۵/۰۶/۰۳

## D-113 - مدیریت کاربران ادمین با انتخابگر تک‌موردی

پنل ادمین به‌جای رندر هم‌زمان تمام کاربران، جست‌وجو و یک کاربر انتخاب‌شده را نشان می‌دهد تا ارتفاع صفحه و بار بصری کنترل شود.

تاریخ: ۱۴۰۵/۰۶/۰۳

## D-111 - dataset بزرگ فقط برای توسعه و تست محلی

برای تست جست‌وجو، فیلتر، moderation و صفحات مختلف، seed توسعه‌ای ۳۰۰ کاربر و ۹۰۰ محتوا اضافه شد. این داده‌ها شناسه‌های deterministic دارند و اجرای مجددشان idempotent است. اسکریپت در `NODE_ENV=production` عمداً متوقف می‌شود، رسانه‌ی ساختگی نمی‌سازد و نباید روی دیتابیس مقصد اجرا شود.

تاریخ: ۱۴۰۵/۰۶/۰۳

## D-110 - حمل‌ونقل در وب با launcher و modal مستقل

برای جلوگیری از مخلوط‌شدن منطق سفر با آگهی عمومی، حمل‌ونقل محلی در وب launcher مستقل دارد و فرم آن داخل modal اختصاصی باز می‌شود. فرم دو حالت offer/request را نگه می‌دارد و فقط به قراردادهای transport متصل است؛ فرم عمومی آگهی و فرم خدمات وارد این modal نمی‌شوند.

تاریخ: ۱۴۰۵/۰۶/۰۳
- **Sprint 108 - منطق قیمت آگهی و رسانه در ویرایش:** برای جلوگیری از state متناقض، آگهی معمولی فقط از وجود مبلغ مثبت برای تعیین `fixed` استفاده می‌کند و نبود مبلغ `negotiable` است؛ `price_type` حمل‌ونقل مستقل باقی می‌ماند. ویرایش، فهرست رسانه‌های انتخاب‌شده را صریحاً جایگزین می‌کند تا حذف/افزودن تصویر قابل پیش‌بینی باشد.
- **Sprint 108 - تراکم پنل ادمین:** صف‌های گزارش و پشتیبانی به‌صورت disclosure بسته‌شونده باقی می‌مانند تا اطلاعات حساس/عملیاتی بدون درخواست کاربر در صفحه باز نشوند و پنل در فهرست‌های طولانی قابل استفاده بماند.

## D-114 - قرارداد بصری پایدار رسانه و launcher بازار

رسانه کارت‌های بازار در قاب ثابت ۱۸۰ پیکسلی با `object-fit: cover` نمایش داده می‌شود تا نسبت فایل اصلی ارتفاع کارت را تغییر ندهد. launcherهای هم‌سطح بازار در دسکتاپ ارتفاع یکسان ۲۷۰ پیکسل دارند و در موبایل به ارتفاع محتوامحور برمی‌گردند. گالری جزئیات نیز نسبت ۴:۳ دارد تا عکس‌های افقی و عمودی بدون تغییر layout دیده شوند.

تاریخ: ۱۴۰۵/۰۶/۰۳

## D-124 - تفکیک release candidate از release نهایی

artifactهای محلی می‌توانند قبل از smoke مقصد ساخته شوند، اما تا تأیید health، readiness، feed و مسیرهای احراز‌شده روی cPanel با نسخه هم‌زمان وب/API، release نهایی اعلام نمی‌شوند.

تاریخ: ۱۴۰۵/۰۶/۰۹

## D-123 - release فقط پس از smoke مقصد

با وجود سبزبودن گیت محلی، release نهایی production تا smoke جفت API/وب روی cPanel با نشست واقعی admin تأیید نمی‌شود؛ preflight محلی به‌تنهایی صحت مقصد را اثبات نمی‌کند.

تاریخ: ۱۴۰۵/۰۶/۰۹

## D-122 - تست صریح تفکیک admin و moderator

مسیرهای فهرست کاربران و آگهی‌های هر کاربر فقط برای `admin` هستند و این مرز با تست endpoint حفظ می‌شود؛ نقش `moderator` صرفاً برای صف‌ها و عملیات moderation مجاز است.

تاریخ: ۱۴۰۵/۰۶/۰۸

## D-121 - فارسی‌سازی presentation پنل ادمین

برچسب‌های status و priority فقط در لایه UI به فارسی نگاشت می‌شوند؛ مقدار قراردادی API و منطق moderation تغییر نمی‌کند.

تاریخ: ۱۴۰۵/۰۶/۰۸

## D-120 - moderation محدود در User Detail

کنترل تأیید/رد فقط برای وضعیت `submitted` در User Detail نمایش داده می‌شود و از endpoint رسمی moderation استفاده می‌کند. برای جلوگیری از تصمیم اشتباه، آگهی‌های سایر وضعیت‌ها فقط قابل مشاهده هستند.

تاریخ: ۱۴۰۵/۰۶/۰۸

## D-119 - بازکردن جزئیات آگهی از User Detail با endpoint موجود

برای جلوگیری از duplicate کردن منطق و قرارداد، دکمه جزئیات آگهی کاربر از تابع و endpoint موجود جزئیات ادمین استفاده می‌کند و dialog فعلی را باز می‌کند. هیچ عملیات moderation جدیدی در این مرحله اضافه نشد.

تاریخ: ۱۴۰۵/۰۶/۰۸

## D-118 - آگهی‌های کاربر با endpoint admin محدود

برای نمایش فعالیت واقعی کاربر، endpoint جداگانه با guard نقش `admin` اضافه شد و از `listUserContents` موجود استفاده می‌کند. آگهی‌های حذف‌شده طبق رفتار repository کنار گذاشته می‌شوند و اطلاعات حساس یا عملیات جدید به User Detail اضافه نمی‌شود.

تاریخ: ۱۴۰۵/۰۶/۰۸

## D-117 - User Detail مرحله‌ای با قرارداد فعلی

User Detail فعلاً به‌صورت پنل inline در فهرست ادمین پیاده می‌شود و فقط داده‌های endpoint موجود `/api/v1/admin/users` را نمایش می‌دهد. برای جلوگیری از گسترش scope، endpoint جزئیات جدید یا داده‌های حدسی برای فعالیت کاربر اضافه نمی‌شود.

تاریخ: ۱۴۰۵/۰۶/۰۸

## D-116 - نمایش عملیاتی تیکت Support بدون نشت UUID

در فهرست ادمین، اطلاعات موجود کاربر با join حداقلی به تیکت اضافه می‌شود و UI به‌جای `user_id` خام، نام/شماره و یک کد نمایشی پایدار `SUP-XXXXXX` نشان می‌دهد. UUID برای قرارداد داخلی باقی می‌ماند و migration جدید یا داده مصنوعی برای شماره‌گذاری اضافه نمی‌شود.

تاریخ: ۱۴۰۵/۰۶/۰۸

## D-115 - قرارداد مشترک فیلدهای آگهی بر اساس دسته و نوع محتوا

نمایش فیلدهای قیمت، وضعیت کالا و جزئیات خدمت از یک policy مشترک در پکیج shared پیروی می‌کند. همان policy در Web برای نمایش فرم و در API برای پاک‌سازی payload اجرا می‌شود تا پنهان‌سازی UI به‌تنهایی منبع صحت نباشد و داده نامرتبط یا قدیمی ذخیره نشود.

تاریخ: ۱۴۰۵/۰۶/۰۳
# تصمیم Sprint 144 — Trust signal غیرتضمینی

هویت تأییدشده یک نشانه مستقل و قابل لغو است، نه امتیاز اعتماد عمومی و نه تضمین امنیت معامله. score فقط server-side برای سیاست‌های داخلی محاسبه می‌شود؛ کلاینت مجاز به ساختن یا ارسال وضعیت verified نیست. هویت مالک غرفه از تأیید خود غرفه جدا می‌ماند.
# تصمیم ممیزی — ۲۰۲۶-۱۱-۲۰

- هدر هویت/نقش فقط در factory صریح تست و با NODE_ENV=test مجاز است؛ نمونه تست حق listen شبکه ندارد.
- تست‌های هم‌زمانی فقط روی دیتابیس محلی مستقل fourd_audit اجرا می‌شوند.
- به دلیل عمومی و خالی بودن مقصد و وجود اطلاعات شخصی در تاریخچه محلی، تحویل اولیه از snapshot بدون والد و با مسیرهای مجاز انجام می‌شود. تاریخچه محلی بازنویسی نمی‌شود.
- seed نمایشی تنها روی میزبان محلی، خارج production و با ALLOW_DEMO_SEED=true اجرا می‌شود.
- سرور production در این مرحله تغییر نمی‌کند. ارتقای عمده Expo و تضمین آمادگی production از دامنه این تحویل تأییدشده خارج است و باید جداگانه اعتبارسنجی شود.

