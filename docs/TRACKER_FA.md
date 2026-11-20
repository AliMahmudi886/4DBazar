# Implementation Tracker پروژه 4D

## Development Sprint 123 - تمدید خودکار نشست

| بخش | وضعیت | یادداشت |
|---|---|---|
| Mobile auto-refresh | Done | retry یک‌باره با coalescing درخواست refresh |
| Web auto-refresh | Done | refresh برای authenticated fetchهای workspace |
| Loop prevention | Done | refresh endpoint از retry مستثنی است و شکست، 401 را حفظ می‌کند |
| Release validation | Done | build وب و APK با source نهایی |

## Development Sprint 122 - پایه Refresh Token

| بخش | وضعیت | یادداشت |
|---|---|---|
| Refresh token schema | Done | migration `0027_session_refresh_tokens.sql` با hash و revoke |
| Rotation endpoint | Done | `POST /api/v1/auth/refresh` |
| Login response | Done | refresh token به OTP/password login افزوده شد |
| Client auto-refresh | Open | اتصال retry و deploy مقصد در increment بعدی |

## Development Sprint 121 - امنیت نشست موبایل

| بخش | وضعیت | یادداشت |
|---|---|---|
| Secure token storage | Done | استفاده از `expo-secure-store` با migration از AsyncStorage |
| Logout hardening | Done | revoke best-effort سمت API و پاک‌سازی هر دو storage |
| Android release | Done | APK محلی با versionCode 17 ساخته شد |
| Refresh token | Open | نیازمند قرارداد API و migration مستقل |

## Development Sprint 120 - قرارداد Auth و نشست

| بخش | وضعیت | یادداشت |
|---|---|---|
| Auth error contract | Done | `invalid_phone`، `invalid_otp` و `invalid_credentials` در shared/API و mapping وب/موبایل |
| Session identity response | Done | `/api/v1/me` شماره حساب صاحب نشست را برمی‌گرداند؛ داده کاربران دیگر expose نمی‌شود |
| Validation | Done | check، ۵۵ تست API، web build و mobile typecheck سبز |
| Device/hosted smoke | Open | نیازمند اجرای ورود واقعی روی مقصد و تست دستگاه |

## خلاصه

| بخش | وضعیت | یادداشت |
|---|---|---|
| Repository Scan | Done | repository خالی و بدون Git بود |
| Documentation Foundation | Done | اسناد اصلی ایجاد شد |
| Product Discovery | Done | سند Phase 1 تکمیل شد |
| Market Research | Done | نسخه اول desk research تکمیل شد |
| Product Strategy | Done | strategy نسخه اول تکمیل شد |
| PRD + MVP | Done | PRD و MVP Scope تکمیل شد |
| UX | Done | UX Design نسخه اول تکمیل شد |
| Domain Model | Done | مدل دامنه نسخه اول تکمیل شد |
| Database/API Design | Done | طراحی Database و API نسخه اول تکمیل شد |
| System Architecture | Done | معماری سیستم نسخه اول تکمیل شد |
| Security & Trust | Done | طراحی امنیت و اعتماد نسخه اول تکمیل شد |
| Development Foundation | Done | foundation اجرایی نسخه اول تکمیل شد |
| Development Sprint 1 | In Progress | Backend Foundation؛ وابسته به اجرای Docker برای validation نهایی |
| Development Sprint 2 | In Progress | Marketplace Experience و UI سطح بالا |
| Development Sprint 3 | Done | Trust Interaction Persistence پایه |
| Development Sprint 4 | Done | Real DB validation، seed demo و smoke test |
| Development Sprint 5 | Done | Session Auth Foundation با OTP stub |
| Development Sprint 6 | Done | Moderation Admin Panel پایه |
| Development Sprint 7 | Done | Role-Based Admin Access |
| Development Sprint 8 | Done | Content Approval Lifecycle |
| Development Sprint 9 | Done | Session Revocation |
| Development Sprint 10 | Done | UX Warmth and Navigation Polish |
| Development Sprint 11 | Done | Automated Visual QA |
| Development Sprint 12 | Done | Production Auth Hardening |
| Development Sprint 13 | Done | Admin Route Separation |
| Development Sprint 14 | Done | Real SMS OTP Adapter |
| Development Sprint 15 | Done | Kavenegar SMS Provider |
| Development Sprint 16 | Done | SMS E2E Smoke Tooling |
| Development Sprint 17 | Done | Kavenegar Delivery Smoke |
| Development Sprint 18 | Done | Root Env Loading Fix |
| Development Sprint 19 | Done | Admin Access Boundary |
| Development Sprint 20 | Done | Persisted OTP Challenge |
| Development Sprint 21 | Done | OTP Cleanup and Rate Limit |
| Development Sprint 22 | Done | Beta UX Polish |
| Development Sprint 23 | Done | Deploy Readiness and CI |
| Development Sprint 24 | Done | Final Beta UX and Access Pass |
| Development Sprint 25 | Done | Public UX، Signup، Listing Media و Puzzle Captcha |
| Development Sprint 26 | Done | User Workspace، My Listings و Conversation Polish |
| Development Sprint 27 | Done | Mobile Readiness و PWA Install Baseline |
| Development Sprint 28 | Done | Media Storage Baseline و Listing Image Upload |
| Development Sprint 29 | Done | Server-Side Captcha Proof و OTP Bot Protection |
| Development Sprint 30 | Done | Password Login Abuse Guard |
| Development Sprint 31 | Done | Captcha Experience Polish و Microinteraction Pass |
| Development Sprint 32 | Done | Conversation Inbox، unread count و read state |
| Development Sprint 33 | Done | Chat Safety Controls و report پیام |
| Development Sprint 34 | Done | Conversation mute preferences |
| Development Sprint 35 | Done | Conversation block controls |
| Development Sprint 36 | Done | Web chat notification baseline |
| Development Sprint 37 | Done | Push subscription storage baseline |
| Development Sprint 38 | Done | Best-effort push delivery for chat messages |
| Development Sprint 39 | Done | VAPID key generation tooling and setup guide |
| Development Sprint 40 | Done | Push self-test endpoint and profile diagnostics |
| Development Sprint 41 | Done | Web root env loading for VAPID public key |
| Development Sprint 42 | Done | Web bundle vendor chunk split |
| Development Sprint 43 | Done | Web bundle budget guard |
| Development Sprint 44 | Done | Admin workspace lazy loading |
| Development Sprint 45 | Done | Admin lazy split stabilization |
| Development Sprint 46 | Done | Admin legacy JSX cleanup |
| Development Sprint 47 | Done | Profile and chat component split |
| Development Sprint 48 | Done | Profile and chat lazy loading |
| Development Sprint 49 | Done | Account, chat and publish UX polish |
| Development Sprint 50 | Done | Mobile, PWA and beta readiness |
| Development Sprint 51 | Done | Storage/deploy release preflight |
| Development Sprint 52 | Done | Search, price filter and sort expansion |
| Development Sprint 53 | Done | Favorite persistence and AI listing assistant |
| Development Sprint 89 | Done | Cross-client puzzle، mobile production API، branding و core UX polish |
| Development Sprint 90 | Done | workspaceهای کاربر، production truthfulness، CORS و بسته مستقل cPanel |
| Development Sprint 91 | In Progress | ممیزی release و design hardening مشترک Web/Mobile تکمیل شد؛ اصلاح پروفایل، taxonomy گسترده، hero banner، فرم قیمت و resolve تصویر API اضافه شد؛ deploy smoke، backup media و device QA واقعی باقی مانده است |
| Development Sprint 92 | Planned | جداسازی بازار خدمات، کاتالوگ تعرفه انتشار و snapshot مالی؛ فقط بعد از تکمیل exit criteria اسپرینت ۹۱ شروع می‌شود |
| Coding | Active | Phase 10 تکمیل شده و توسعه کنترل‌شده شروع شده است |
| Development Sprint 109 | Done locally / Hosted smoke open | گالری رسانه ادمین، اندازه ثابت تصویر، حذف مقاوم و پنجره ویرایش ۲۴ساعته |
| Development Sprint 110 | Done locally / Hosted smoke open | اصلاح cover کارت‌ها، هم‌اندازی launcherها و بازطراحی responsive صفحه جزئیات آگهی |
| Development Sprint 114 | Done locally / Hosted smoke open | فرم دسته‌آگاه، پاک‌سازی فیلدهای نامرتبط در API و بازطراحی/QA جزئیات آگهی |

## Phase 0 Tasks

| Task | Status | خروجی |
|---|---|---|
| Scan repository | Done | repository خالی، `.git` وجود ندارد |
| Create README | Done | `README.md` |
| Create AGENTS | Done | `AGENTS.md` |
| Create documentation architecture | Done | `docs/DOCUMENTATION_ARCHITECTURE_FA.md` |
| Create master roadmap | Done | `docs/ROADMAP_FA.md` |
| Create tracker | Done | `docs/TRACKER_FA.md` |
| Create risk register | Done | `docs/RISK_REGISTER_FA.md` |
| Create decision log | Done | `docs/DECISION_LOG_FA.md` |
| Create tech debt register | Done | `docs/TECH_DEBT_FA.md` |
| Create unknowns | Done | `docs/UNKNOWNS_FA.md` |
| Create project status | Done | `PROJECT_STATUS_FA.md` |
| Create phase report | Done | `docs/phase-reports/PHASE_0_COMPLETION_REPORT_FA.md` |

## Phase 1 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| نقد Vision اولیه | Done | vision اصلاح‌شده یا تاییدشده با دلیل |
| تعریف Problem Statement | Done | مسئله از دید کاربران محلی روشن باشد |
| تعریف Personas | Done | حداقل buyer، seller، service provider، business |
| تعریف JTBD | Done | jobهای اصلی قابل اولویت‌بندی باشند |
| تعریف Value Proposition | Done | تمایز local، trust، speed، liquidity روشن باشد |
| تعریف Marketplace Model | Done | چهار interaction اصلی پوشش داده شود |
| پیشنهاد Core Metrics | Done | گزینه‌های North Star و metricهای پشتیبان ثبت شوند |
| ثبت Hypotheses و Risks | Done | فرضیات قابل تست باشند |

## Phase 2 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| جمع‌آوری منابع بازار محلی 4D | Done | جمعیت، فاصله شهرها و context منطقه‌ای با source ثبت شود |
| تحلیل Divar | Done | strength، weakness، habit، liquidity، trust، UX و gap بررسی شود |
| تحلیل Sheypoor | Done | strength، weakness، habit، liquidity، trust، UX و gap بررسی شود |
| تحلیل marketplaceهای مرتبط جهانی | Done | الگوهای قابل استفاده و غیرقابل استفاده برای 4D جدا شود |
| تحلیل جایگزین‌های محلی | Done | Telegram، Instagram، WhatsApp و شبکه‌های آفلاین بررسی شوند |
| Opportunity Map | Done | فرصت‌های local-first و trust-first استخراج شوند |
| Category Recommendation | Done | P0/P1/P2 دسته‌ها بر اساس research اصلاح شوند |

## Phase 3 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Positioning | Done | جایگاه 4D نسبت به رقبا روشن باشد |
| Differentiation | Done | تمایز قابل اجرا و قابل سنجش تعریف شود |
| Category Strategy | Done | دسته‌های P0/P1/P2 با دلیل مشخص شوند |
| Local Strategy | Done | شهر من، کل 4D و توسعه آینده تعریف شود |
| Cold Start Strategy | Done | مسیر تامین supply واقعی مشخص شود |
| Monetization Strategy | Done | فرضیه درآمدی بدون paywall buyer تعریف شود |
| Trust Strategy | Done | trust signalها و moderation سطح strategy مشخص شود |
| Growth Strategy | Done | کانال‌های جذب اولیه و retention تعریف شود |
| Metrics Strategy | Done | North Star candidate و metric tree تعریف شود |

## Phase 4 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| PRD نسخه اول | Done | مسئله، هدف، کاربران، scope و constraints روشن باشد |
| MVP Scope P0/P1/P2/P3 | Done | featureها اولویت‌بندی و deferredها مشخص باشند |
| Acceptance Criteria P0 | Done | هر P0 قابل تست و بررسی باشد |
| Non-goals MVP | Done | scope creepهای ممنوع ثبت شوند |
| Success Metrics | Done | metricهای launch و beta مشخص باشند |

## Phase 5 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Sitemap | Done | ساختار صفحات web/mobile/admin مشخص باشد |
| Navigation | Done | مسیرهای اصلی buyer، seller، service و moderator روشن باشد |
| Screen List | Done | لیست screenهای MVP و نقش هرکدام مشخص باشد |
| Listing Flow | Done | ثبت، بررسی، انتشار، مشاهده و contact آگهی طراحی شود |
| Wanted Flow | Done | ثبت، نمایش، پاسخ و expiry طراحی شود |
| Service Flow | Done | service listing و service request طراحی شوند |
| Search Flow | Done | جستجو، فیلتر، empty state و result state طراحی شود |
| Chat/Contact Flow | Done | شروع ارتباط، context و report/block مشخص شود |
| Report Flow | Done | گزارش و مسیر moderation روشن باشد |
| Subscription Flow | Done | فقط placeholder/آینده، بدون ورود به MVP paid flow |

## Phase 6 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Entity List | Done | entityهای MVP و آینده نزدیک مشخص باشند |
| Aggregates | Done | aggregate rootها و مالکیت تغییرات مشخص شود |
| Relationships | Done | رابطه‌های اصلی بین entityها تعریف شود |
| Domain Boundaries | Done | مرز moduleها و وابستگی‌ها مشخص شود |
| Business Rules | Done | ruleهای ثبت، انتشار، تماس، گزارش و moderation نوشته شود |
| Domain Events | Done | eventهای مهم برای analytics/audit مشخص شود |

## Phase 7 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Database Schema | Done | schema اولیه با tableها و رابطه‌ها طراحی شود |
| Indexes & Constraints | Done | indexها و constraintهای مهم مشخص شوند |
| Content Modeling Decision | Done | table مشترک یا جدا برای content types تصمیم‌گیری شود |
| API Contract | Done | endpointها، request/response و versioning مشخص شوند |
| Error Contract | Done | ساختار error استاندارد تعریف شود |
| Pagination/Filtering/Sorting | Done | contract مشترک لیست‌ها و search مشخص شود |
| API Security | Done | authentication، authorization و idempotency قواعد پایه داشته باشند |

## Phase 8 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Architecture Diagram | Done | نمای کلی سیستم و جریان درخواست‌ها مشخص شود |
| Modules | Done | moduleهای modular monolith و مسئولیت‌ها مشخص شوند |
| Dependency Rules | Done | وابستگی‌های مجاز و ممنوع تعریف شوند |
| Runtime | Done | backend، web، mobile، admin و job runtime طراحی شوند |
| Storage & Media | Done | storage strategy و media processing مشخص شود |
| Search | Done | search architecture و مسیر توسعه آینده مشخص شود |
| Chat/Notification | Done | chat و notification MVP و آینده طراحی شوند |
| Caching/Logging/Deployment | Done | caching، logging، health check و deployment strategy مشخص شود |

## Phase 9 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Threat Model | Done | تهدیدهای اصلی کاربران، محتوا، admin و API مشخص شوند |
| Moderation Policy | Done | workflow و decision policy پایه تعریف شود |
| Abuse Prevention | Done | spam، duplicate، fraud، report abuse و OTP abuse کنترل شوند |
| Trust Architecture | Done | trust signals و محدودیت‌های نمایش آن‌ها مشخص شود |
| Admin Security | Done | role، audit، least privilege و حساسیت عملیات تعریف شود |
| Security Requirements | Done | auth، rate limit، secrets، privacy و logging policy مشخص شود |

## Phase 10 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Stack Decision | Done | backend، web/admin، mobile strategy و tooling با دلیل انتخاب شوند |
| Project Scaffold | Done | ساختار repo و appها مطابق Modular Monolith ساخته شود |
| CI Foundation | Done | lint/test/build پایه تعریف شود |
| Testing Infrastructure | Done | unit/integration/API/security test پایه آماده شود |
| Configuration | Done | env، secrets و config validation پایه داشته باشد |
| Logging & Error Handling | Done | structured logging و error contract پیاده‌سازی پایه شود |
| Base Security | Done | auth skeleton، authorization helpers، rate limit و audit foundation طراحی/پیاده شود |

## Development Sprint 1 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| ORM/Query Builder Decision | Done | ابزار DB با دلیل و ریسک انتخاب شود |
| Real Migrations | Done | migrationهای اولیه مطابق database design ایجاد شوند |
| Seed 4D Data | Done | region، city و categoryهای P0 idempotent seed شوند |
| PostgreSQL Connection | In Progress | config و health ready به DB واقعی وصل شود |
| Auth Session Foundation | Ready | OTP/session واقعی جایگزین header stub شود |
| Content Create/Read Foundation | Done | market_contents و listing create/read پایه پیاده شود |
| Audit Log Persistence | Ready | audit logger به DB وصل شود |
| Web Functional MVP Shell | Done | UI شهر/دسته، وضعیت API/DB و فرم ثبت آگهی قابل استفاده باشد |

## Development Sprint 2 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Premium Marketplace Layout | Done | صفحه اول محصول حس marketplace واقعی داشته باشد، نه صفحه ساده با دکمه |
| Animated Interaction Layer | Done | ورود کارت‌ها، hover، focus و وضعیت‌های submit/refresh نرم و مزاحم نبودن انیمیشن‌ها رعایت شود |
| Search and Filter Surface | Done | کاربر بتواند شهر، دسته و عبارت جستجو را در همان صفحه کنترل کند |
| Listing Composer UX | Done | فرم ثبت آگهی کامل‌تر، قابل فهم و دارای stateهای loading/success/fallback باشد |
| API/DB Health Visibility | Done | وضعیت اتصال API و DB در UI خوانا باشد |
| Persisted Feed API | Done | endpoint فید عمومی محتوای ذخیره‌شده را از backend بخواند و در نبود DB fallback قابل کنترل بدهد |
| Persisted Feed DB Validation | In Progress | آگهی‌های ذخیره‌شده بعد از refresh روی PostgreSQL واقعی دیده شوند |
| Listing Detail Drawer | Done | کاربر بتواند جزئیات آگهی را بدون خروج از فید ببیند |
| Safe Contact MVP | Done | کاربر بتواند intent تماس را شروع کند بدون نمایش عمومی شماره |
| Report Flow MVP | Done | کاربر بتواند آگهی را برای moderation علامت‌گذاری نمایشی کند |
| Visual QA Automation | Ready | screenshot/viewport check با Playwright یا ابزار مشابه اضافه شود |

## Development Sprint 3 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Contact/Report Migration | Done | جدول‌های `contact_events`، `reports` و `moderation_cases` اضافه شوند |
| Contact Intent API | Done | شروع تماس context-aware با auth و mobile verification ثبت شود |
| Report API | Done | گزارش با reason معتبر ثبت شود و moderation case بسازد |
| Moderation Queue Persistence | Done | queue ادمین از `moderation_cases` خوانده شود و fallback امن داشته باشد |
| Web Contact/Report API Integration | Done | UI تماس/گزارش به API وصل شود و در نبود DB fallback کاربرپسند بدهد |
| Real DB Validation | In Progress | migration و create contact/report روی PostgreSQL واقعی اجرا و smoke test شود |
| Audit Persistence | Done | audit logger به شکل best-effort به `audit_logs` وصل شود |

## Development Sprint 4 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Resolve PostgreSQL Port Conflict | Done | Postgres پروژه بدون تداخل روی host port جدا بالا بیاید |
| Run Real Migrations | Done | migrationهای `0001` و `0002` روی PostgreSQL واقعی اجرا شوند |
| Seed Demo Listings | Done | آگهی‌های نمونه UI با ID ثابت در DB وجود داشته باشند |
| Contact Smoke Test | Done | تماس برای «کولر آبی سالم» در `contact_events` ثبت شود |
| Report Smoke Test | Done | report واقعی case باز در moderation queue بسازد |
| Audit Smoke Test | Done | actionهای contact/report در `audit_logs` ذخیره شوند |
| Test Isolation With Live DB | Done | تست‌های unavailable با DATABASE_URL جعلی از DB واقعی مستقل شوند |

## Development Sprint 5 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| OTP Request Endpoint | Done | درخواست OTP با شماره معتبر پاسخ کنترل‌شده بدهد |
| OTP Verify Endpoint | Done | کد stub معتبر session واقعی بسازد و کد نامعتبر رد شود |
| Session Persistence | Done | hash توکن در جدول `sessions` ذخیره شود |
| Bearer Auth Middleware | Done | API بتواند کاربر را از `Authorization: Bearer` تشخیص دهد |
| Me Endpoint | Done | کاربر نشست فعلی را از `/api/v1/me` ببیند |
| Web Session Integration | Done | web نشست توسعه‌ای بگیرد و برای مسیرهای protected از Bearer token استفاده کند |
| Live Auth Smoke Test | Done | OTP، session، `/me` و contact با Bearer token روی API live تست شوند |
| Real SMS Provider | Ready | provider واقعی SMS جایگزین OTP stub شود |

## Development Sprint 6 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Moderation Decisions Migration | Done | جدول `moderation_decisions` اضافه شود |
| Moderation Decision API | Done | moderator بتواند برای case تصمیم ثبت کند |
| Case Status Transition | Done | تصمیم‌ها case را close/escalate کنند |
| Report Status Transition | Done | گزارش بعد از تصمیم به reviewed/escalated تغییر کند |
| Reject Content Action | Done | decision رد محتوا status آگهی را rejected کند |
| Admin Queue UI | Done | صف گزارش‌ها در web دیده شود |
| Admin Decision UI | Done | بستن، ارجاع و رد محتوا از UI قابل انجام باشد |
| Live Decision Smoke Test | Done | report، queue و decision روی PostgreSQL واقعی validate شود |
| Real Moderator Roles | Done | roleها از DB/session واقعی خوانده شوند، نه header fallback |

## Development Sprint 7 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| User Roles Migration | Done | جدول `user_roles` اضافه شود |
| Seed Dev Roles | Done | کاربر توسعه نقش `user` و `moderator` بگیرد |
| Session Role Hydration | Done | auth middleware roleها را از DB بخواند |
| Me Roles Response | Done | `/api/v1/me` roleهای session را نشان دهد |
| Admin UI Bearer Access | Done | پنل admin web در حالت نشست واقعی از Bearer token استفاده کند |
| Live Role Smoke Test | Done | admin queue بدون `x-4d-roles` و فقط با Bearer token باز شود |
| Remove Header Fallback In Production | Ready | header fallback برای محیط production حذف/غیرفعال شود |

## Development Sprint 8 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Public Feed Approval Filter | Done | feed عمومی فقط محتوای `approved` را نشان دهد |
| Submitted Content Queue API | Done | moderator بتواند آگهی‌های `submitted` را بخواند |
| Content Decision API | Done | moderator بتواند آگهی pending را approve/reject کند |
| Content Status History | Done | تغییر وضعیت در `content_status_history` ثبت شود |
| Pending Content Admin UI | Done | آگهی‌های pending در پنل admin دیده شوند |
| Approve/Reject UI Actions | Done | تایید و رد آگهی از UI قابل انجام باشد |
| Live Approval Smoke Test | Done | آگهی created به queue برود، approve شود و وارد feed شود |
| Submitted Content Review Detail | Ready | صفحه/جزئیات review کامل‌تر برای content اضافه شود |

## Development Sprint 9 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Logout API | Done | کاربر authenticated بتواند نشست را revoke کند |
| Session Revoke Persistence | Done | `sessions.revoked_at` برای token فعلی مقدار بگیرد |
| Logout Audit | Done | action خروج در audit ثبت شود |
| Web Logout Action | Done | UI دکمه خروج داشته باشد و token را از localStorage پاک کند |
| Revoked Token Rejection | Done | token revoke شده دیگر `/api/v1/me` را باز نکند |
| Live Logout Smoke Test | Done | before=200، logout=204، after=401 validate شود |
| Session Cleanup Job | Ready | پاکسازی نشست‌های منقضی/قدیمی به job آینده منتقل شود |

## Development Sprint 10 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Marketplace/Admin Separation | Done | UI بازار و پنل ادمین با تب جدا شوند |
| Warm Market Hero | Done | اولین بخش بازار حس محصول محلی و زنده داشته باشد |
| Live Summary Stats | Done | تعداد آگهی منتشرشده، pending و گزارش باز در UI دیده شود |
| Softer Visual System | Done | رنگ، پس‌زمینه، کارت و hoverها کمتر خشک و زمخت باشند |
| Mobile Layout Polish | Done | تب‌ها، statusها و hero در موبایل stack تمیز داشته باشند |
| Build/Test Validation | Done | check/build/test پس از تغییرات UI پاس شود |
| Automated Visual QA | Done | screenshot/viewport automation اضافه شود |

## Development Sprint 11 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Visual QA Tooling | Done | Playwright به web workspace اضافه شود |
| QA Script | Done | `npm run qa:visual` اجرا شود |
| Desktop Market Screenshot | Done | screenshot دسکتاپ بازار ساخته شود |
| Mobile Market Screenshot | Done | screenshot موبایل بازار ساخته شود |
| Desktop Admin Screenshot | Done | screenshot دسکتاپ ادمین ساخته شود |
| Mobile Admin Screenshot | Done | screenshot موبایل ادمین ساخته شود |
| Overflow Detection | Done | horizontal overflow باعث fail شدن QA شود |
| Mobile Overflow Fix | Done | overflow موبایل پیدا و رفع شود |
| System Chrome Fallback | Done | اگر browser bundled دانلود نشد، Chrome سیستم استفاده شود |

## Development Sprint 12 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Production Secret Guard | Done | `SESSION_SECRET=development-secret` در production رد شود |
| Production OTP Stub Guard | Done | `OTP_PROVIDER=stub` در production رد شود |
| Disable Header Fallback In Production | Done | `x-4d-*` در production user نسازد |
| SMS Placeholder Safety | Done | تا قبل از integration واقعی، verify با provider `sms` خطای امن بدهد |
| Production Guard Tests | Done | تست‌های config و auth guard اضافه شوند |
| Dev Auth Regression Smoke | Done | مسیر dev با Bearer session همچنان کار کند |
| Real SMS Integration | Ready | provider واقعی SMS اضافه شود |

## Development Sprint 13 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Direct Admin Route | Done | `/admin` مستقیم پنل ادمین را render کند |
| Browser History Sync | Done | تب‌های بازار/ادمین با history مرورگر و back/forward هماهنگ باشند |
| Admin Command Surface | Done | search بازار از صفحه ادمین جدا شود و status اختصاصی ادمین نمایش داده شود |
| Visual QA Admin Route | Done | visual QA برای desktop/mobile ادمین مستقیم `/admin` را باز کند |
| Route Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 14 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| OTP Challenge Store | Done | کد OTP با TTL کوتاه و محدودیت تلاش نگهداری شود |
| SMS Provider Config | Done | `SMS_API_URL` و `SMS_API_KEY` برای production با `OTP_PROVIDER=sms` اجباری شوند |
| Generic HTTP SMS Adapter | Done | request OTP بتواند payload عمومی SMS ارسال کند |
| SMS Verify Flow | Done | verify OTP در حالت SMS دیگر 503 ندهد و challenge را بررسی کند |
| No Dev Code In SMS Mode | Done | response حالت SMS شامل `dev_code` نباشد |
| SMS Env Documentation | Done | `.env.example` و راهنمای provider به‌روز شوند |
| Regression Validation | Done | check، build، test و smoke auth موفق باشند |

## Development Sprint 15 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Kavenegar Vendor Config | Done | `SMS_VENDOR=kavenegar` پشتیبانی شود |
| Kavenegar REST Sender | Done | پیام OTP از مسیر REST کاوه‌نگار ساخته شود |
| Kavenegar Phone Mapping | Done | شماره `+98...` به `09...` برای receptor تبدیل شود |
| Kavenegar Production Guard | Done | در production برای Kavenegar مقدار `SMS_SENDER` اجباری باشد |
| Secret Hygiene | Done | API key واقعی در repository یا docs ثبت نشود |
| Kavenegar Adapter Test | Done | تست واحد payload و endpoint کاوه‌نگار اضافه شود |
| Regression Validation | Done | check، build و test موفق باشند |

## Development Sprint 16 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| SMS Smoke Script | Done | `npm run sms:smoke` اضافه شود |
| Interactive OTP Verify | Done | اسکریپت کد دریافتی را از ترمینال بپرسد و verify کند |
| Local Secret Safety | Done | API key فقط از env خوانده شود و در خروجی کامل چاپ نشود |
| Smoke Documentation | Done | روش تست واقعی Kavenegar با `TEST_PHONE_NUMBER` مستند شود |
| Regression Validation | Done | check، build و test موفق باشند |

## Development Sprint 17 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Secret Cleanup | Done | کلید واقعی از `.env.example` پاک شود |
| Kavenegar Delivery Smoke | Done | request OTP با Kavenegar پاسخ `202` بدهد |
| No Dev Code Check | Done | response حالت SMS شامل `dev_code` نباشد |
| Verify Limitation Note | Done | محدودیت verify به دلیل in-memory challenge و بسته شدن process ثبت شود |

## Development Sprint 18 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Root Env Loading | Done | `sms:smoke` فایل `D:\Projects\4D\.env` را از داخل workspace API بخواند |
| Workspace Env Fallback | Done | اگر `apps/api/.env` وجود داشت، آن هم خوانده شود |
| Noninteractive Error | Done | نبود stdin تعاملی پیام واضح بدهد |
| OTP Code Override | Done | `OTP_CODE` برای verify بدون prompt پشتیبانی شود |
| Example Secret Cleanup | Done | secret از `.env.example` حذف شود |
| Regression Validation | Done | check، build API و test موفق باشند |

## Development Sprint 19 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| SMS Full E2E Verify | Done | `npm run sms:smoke` با Kavenegar کد را verify کند و session بسازد |
| Current User Roles | Done | web از `/api/v1/me` نقش‌های واقعی را بخواند |
| Admin UI Boundary | Done | `/admin` برای کاربر غیر moderator حالت دسترسی محدود نشان دهد |
| Moderator Status Pill | Done | health/status نشست moderator را در UI نشان دهد |
| Visual QA Boundary Support | Done | visual QA حالت access boundary را محتوای معتبر بداند |
| Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 20 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| OTP Challenge Migration | Done | جدول `otp_challenges` ایجاد شود |
| OTP Hash Persistence | Done | hash کد OTP در PostgreSQL ذخیره شود |
| OTP Consumption | Done | verify موفق challenge را با `consumed_at` مصرف کند |
| OTP Attempts | Done | attempts و max_attempts ذخیره و enforce شوند |
| Production Persistent Guard | Done | production در شکست store به memory fallback نکند |
| DB Smoke Validation | Done | migration و request/verify روی PostgreSQL واقعی پاس شود |
| Regression Validation | Done | check، build و test موفق باشند |

## Development Sprint 21 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| OTP Phone Rate Limit | Done | هر شماره در ۱۰ دقیقه بیشتر از ۵ کد نگیرد |
| OTP Cleanup Before Request | Done | challengeهای منقضی یا مصرف‌شده قبل از request جدید پاک شوند |
| OTP Cleanup Script | Done | `npm run db:cleanup:otp` اجرا شود |
| Production Rate Limit Guard | Done | در production اگر بررسی محدودیت شکست خورد خطای امن داده شود |
| Rate Limit Test | Done | تست تکرار درخواست OTP برای یک شماره 429 بگیرد |
| DB Cleanup Smoke | Done | cleanup script روی PostgreSQL واقعی اجرا شود |
| Regression Validation | Done | check، build و test موفق باشند |

## Development Sprint 22 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Refresh Loading State | Done | دکمه refresh هنگام بارگیری disabled و متحرک شود |
| Market Skeleton State | Done | اولین load بازار skeleton card نشان دهد |
| Empty State Copy Polish | Done | متن نبود نتیجه واضح‌تر و کاربرپسندتر شود |
| Form Helper Copy | Done | فرم ثبت آگهی توضیح کوتاه وضعیت review داشته باشد |
| Visual QA Regression | Done | desktop/mobile بازار و ادمین پاس شوند |
| Test Stability Fix | Done | تست rate limit به داده قبلی DB وابسته نباشد |
| Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 23 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Local CI Script | Done | `npm run ci:local` check/build/test/visual QA را اجرا کند |
| GitHub Actions CI | Done | workflow برای push/PR اضافه شود |
| Self Hosted Visual QA | Done | visual QA در نبود dev server خودش preview را بالا بیاورد |
| Production Readiness Checklist | Done | envها، deploy sequence و smokeها مستند شوند |
| README Refresh | Done | README با وضعیت و دستورات جدید sync شود |
| CI Validation | Done | `npm run ci:local` موفق باشد |

## Development Sprint 24 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Remove Auto Dev Login | Done | web بدون ورود خودکار توسعه‌ای boot شود |
| Real OTP Login UI | Done | کاربر شماره و کد پیامکی وارد کند |
| User Profile Workspace | Done | بخش «حساب من» برای پروفایل و مسیر ثبت آگهی وجود داشته باشد |
| Admin Visibility Boundary | Done | تب ادمین فقط برای moderator دیده شود |
| Admin Data Boundary | Done | queueهای ادمین فقط برای moderator fetch شوند |
| Protected User Actions | Done | ثبت آگهی، تماس و گزارش بدون ورود کاربر را به login هدایت کند |
| Final Visual Regression | Done | check، build، visual QA و test موفق باشند |

## Development Sprint 25 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Hide Public Technical Status | Done | `API/DB/Auth` فقط برای moderator واردشده در admin دیده شود |
| Signup Login Copy | Done | ورود OTP به عنوان ثبت‌نام/ورود با ساخت خودکار حساب توضیح داده شود |
| Iranian Phone Normalization | Done | `093...`، `938...`، `989...` و `+989...` پذیرفته شوند |
| Admin Phone Role Grant | Done | شماره تنظیم‌شده در `ADMIN_PHONE_NUMBERS` نقش moderator بگیرد |
| Puzzle Captcha UX | Done | قبل از ارسال OTP یک پازل اسلایدری client-side حل شود |
| Listing Image MVP | Done | فرم آگهی عکس بگیرد، preview کند، در DB ذخیره کند و در کارت/جزئیات نشان دهد |
| Public Timeline Copy | Done | timeline فنی فرم به مسیر انتشار آگهی تبدیل شود |
| Password Login | Done | بعد از ثبت‌نام/تکمیل پروفایل، ورود با رمز بدون SMS ممکن باشد |
| Required User Profile | Done | نام، نام خانوادگی، شهر و رمز قبل از ثبت آگهی اجباری باشد |
| Client Image Compression | Done | عکس‌های معمولی قبل از ذخیره خودکار کوچک شوند |
| In-App Chat MVP | Done | شروع تماس روی آگهی persisted مکالمه بسازد و پیام داخل برنامه ارسال شود |
| My Listings Count Fix | Done | شمارنده پروفایل از آگهی‌های خود کاربر خوانده شود، نه feed عمومی |
| Regression Validation | Done | check، build، test، db:migrate و visual QA موفق باشند |

## Development Sprint 26 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Profile Listings Workspace | Done | کاربر در پروفایل، آخرین آگهی‌های خودش را همراه وضعیت و قیمت ببیند |
| Private Listing Detail Access | Done | آگهی‌های خود کاربر از پروفایل قابل باز شدن باشند، حتی اگر هنوز در feed عمومی نیستند |
| Conversation Role Context | Done | لیست گفتگوها نقش خریدار/فروشنده و آخرین زمان فعالیت را نمایش دهد |
| Existing Chat Shortcut | Done | اگر برای آگهی مکالمه ساخته شده باشد، جزئیات آگهی دکمه «باز کردن چت» نشان دهد |
| Unpublished Contact Guard | Done | برای آگهی منتشرنشده، شروع گفتگو انجام نشود و پیام واضح نمایش داده شود |
| Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 27 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| PWA Manifest | Done | web app فایل manifest با نام، زبان، جهت RTL، رنگ و start URL داشته باشد |
| Mobile App Icon | Done | آیکن مستقل 4D برای نصب موبایل در public assets وجود داشته باشد |
| Mobile Meta Tags | Done | theme color و metaهای پایه mobile web در `index.html` ثبت شوند |
| Production Service Worker | Done | service worker فقط در production build ثبت شود و shell پایه را cache کند |
| Mobile Strategy Document | Done | زمان‌بندی، stack پیشنهادی و criteria شروع native app مستند شود |
| Documentation Sync | Done | README، status، tracker و decision log با Sprint 27 هماهنگ باشند |
| Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 28 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Local Media Store | Done | عکس آگهی به فایل local خارج از PostgreSQL تبدیل و ذخیره شود |
| Listing Image Upload API | Done | endpoint `POST /api/v1/media/listing-images` عکس data URL را validate و URL عمومی برگرداند |
| Public Media Serving | Done | مسیر `/media/...` فایل‌های ذخیره‌شده را با content type و cache header سرو کند |
| Web Upload Flow | Done | frontend بعد از فشرده‌سازی عکس، آن را آپلود کند و فقط URL را همراه آگهی بفرستد |
| Config and Ignore Sync | Done | env example تنظیم media داشته باشد و `data/` از versioning خارج شود |
| Media API Test | Done | upload/read media با تست خودکار پوشش داده شود |
| Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 29 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Captcha Challenge API | Done | endpoint ساخت challenge با target/y و TTL داشته باشد |
| Captcha Proof API | Done | endpoint proof امضاشده، کوتاه‌عمر و مبتنی بر حل challenge بسازد |
| OTP Proof Requirement | Done | درخواست OTP بدون `captcha_proof` معتبر رد شود |
| Web Captcha Integration | Done | پازل frontend از challenge سرور استفاده کند و قبل از OTP proof بگیرد |
| SMS Smoke Sync | Done | smoke test واقعی SMS با captcha proof جدید سازگار باشد |
| Shared Error Contract | Done | کد خطای `captcha_required` در shared contract ثبت شود |
| Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 30 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Password Failure Bucket | Done | تلاش‌های ناموفق ورود با رمز بر اساس IP/شماره در حافظه محدود شوند |
| Password Login 429 | Done | بعد از چند شکست، endpoint `password-login` خطای `rate_limited` برگرداند |
| Success Cleanup | Done | بعد از ورود موفق، bucket شکست‌های همان شماره پاک شود |
| Web Rate Limit Message | Done | UI برای 429 ورود با رمز پیام صبر نشان دهد و کاربر را بی‌دلیل به SMS نبرد |
| Password Rate Limit Test | Done | تست خودکار برای محدودیت تلاش ورود با رمز اضافه شود |
| Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 31 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Captcha Scene Polish | Done | کپچا scene چندلایه، target ring، scan line و depth بصری داشته باشد |
| Close State Feedback | Done | وقتی قطعه نزدیک هدف است، متن و رنگ feedback تغییر کند |
| Success Microanimation | Done | بعد از حل شدن، قطعه lock animation و burst subtle داشته باشد |
| Track Target Marker | Done | ریل کپچا marker هدف و fill هماهنگ با موقعیت قطعه داشته باشد |
| CSS Variable Sync | Done | موقعیت قطعه و هدف بین board و track با custom property هماهنگ شود |
| Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 32 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Conversation Read State Migration | Done | جدول `conversation_reads` برای last read هر کاربر در هر گفتگو اضافه شود |
| Inbox Enrichment API | Done | endpoint گفتگوهای من unread count، آخرین پیام، زمان و فرستنده آخرین پیام را برگرداند |
| Read On Open | Done | با باز کردن گفتگو پیام‌های همان گفتگو برای کاربر خوانده‌شده محسوب شوند |
| Web Inbox Badges | Done | تب حساب و کارت گفتگو badge پیام جدید، preview آخرین پیام و حالت برجسته داشته باشند |
| Gentle Polling | Done | در نشست فعال، داده‌های حساب و گفتگوها هر ۳۰ ثانیه refresh شوند |
| Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 33 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Message Report API Guard | Done | report با `target_type=message` فقط برای participant همان گفتگو پذیرفته شود |
| Chat Message Report UI | Done | هر پیام داخل چت دکمه گزارش کم‌مزاحم و state گزارش‌شده داشته باشد |
| Moderation Message Context | Done | پنل moderation برای report پیام، preview متن پیام را نشان دهد |
| Target Type Validation | Done | API نوع هدف گزارش را فقط از بین content، user و message بپذیرد |
| Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 34 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Conversation Preferences Migration | Done | جدول `conversation_preferences` برای preference هر کاربر در هر گفتگو اضافه شود |
| Mute Preference API | Done | endpoint تنظیم mute/unmute گفتگو با guard participant اضافه شود |
| Muted Inbox State | Done | گفتگوهای mute شده در لیست مشخص شوند و در badge کل پیام جدید حساب نشوند |
| Chat Drawer Mute Control | Done | کاربر از داخل چت بتواند گفتگو را بی‌صدا یا دوباره فعال کند |
| Preference Validation Test | Done | تست خودکار برای رد مقدار mute نامعتبر اضافه شود |
| Regression Validation | Done | check، build، migration، test و visual QA موفق باشند |

## Development Sprint 35 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Conversation Blocks Migration | Done | جدول `conversation_blocks` برای block در سطح گفتگو اضافه شود |
| Block API | Done | endpoint block/unblock گفتگو با guard participant اضافه شود |
| Send Guard | Done | ارسال پیام در گفتگوی blocked با خطای `conversation_blocked` رد شود |
| Web Block Control | Done | کاربر از داخل drawer چت بتواند گفتگو را مسدود یا رفع مسدود کند |
| Blocked Inbox State | Done | گفتگوهای blocked در inbox با برچسب مشخص شوند |
| Regression Validation | Done | check، build، migration، test و visual QA موفق باشند |

## Development Sprint 36 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| New Message Detection | Done | polling گفتگوها افزایش unread را نسبت به refresh قبلی تشخیص دهد |
| In-App Notification Tray | Done | پیام جدید unmuted/unblocked داخل برنامه به صورت notification tray نمایش داده شود |
| Browser Notification Opt-In | Done | کاربر بتواند اجازه اعلان مرورگر را فعال کند |
| Notification Filters | Done | گفتگوهای mute شده، blocked یا چت فعال اعلان جدید نسازند |
| Notification Cleanup | Done | با باز کردن گفتگو، اعلان همان گفتگو از tray پاک شود |
| Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 37 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Push Subscription Migration | Done | جدول `push_subscriptions` با unique کاربر/endpoint و index کاربر ساخته شود |
| Push Subscription API | Done | مسیرهای protected برای list، upsert و revoke subscription دستگاه وجود داشته باشند |
| Web Push Setup Control | Done | کاربر بتواند از پروفایل آماده‌سازی Push واقعی را شروع کند و نبود VAPID پیام روشن بدهد |
| Service Worker Push Handlers | Done | service worker رویدادهای `push` و `notificationclick` را مدیریت کند |
| Regression Validation | Done | check، build، migration، test و visual QA موفق باشند |

## Development Sprint 38 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| VAPID API Config | Done | API بتواند `VAPID_PUBLIC_KEY`، `VAPID_PRIVATE_KEY` و `VAPID_SUBJECT` را بخواند |
| Push Delivery Service | Done | ارسال Web Push برای subscriptionهای فعال کاربر انجام شود و در نبود VAPID امن skip شود |
| Chat Message Hook | Done | بعد از ارسال پیام، گیرنده غیر-muted notification push دریافت کند |
| Invalid Subscription Cleanup | Done | subscriptionهایی که provider با 404/410 رد می‌کند revoke شوند |
| Regression Validation | Done | check، build، migration، test و visual QA موفق باشند |

## Development Sprint 39 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Local VAPID Generator | Done | دستور `npm run push:vapid` بدون نصب global کلید public/private بسازد |
| Secret-Safe Output | Done | خروجی به کاربر یادآوری کند private key را commit نکند |
| Push Setup Guide | Done | `docs/RUN_LOCAL_FA.md` مراحل کامل قرار دادن کلیدها در `.env` را توضیح دهد |
| Regression Validation | Done | check، build، test و اجرای smoke بدون نمایش کلیدها موفق باشند |

## Development Sprint 40 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Push Test Endpoint | Done | کاربر واردشده بتواند `POST /api/v1/me/push-test` را برای ارسال اعلان تستی اجرا کند |
| Reusable Push Payload | Done | سرویس push بتواند payload عمومی و پیام چت را با یک مسیر مشترک ارسال کند |
| Profile Test Control | Done | وقتی دستگاه Push ثبت شده باشد، دکمه ارسال تست در پروفایل نمایش داده شود |
| Diagnostic Feedback | Done | UI وضعیت skipped، sent، no subscription و failure را واضح نمایش دهد |
| Regression Validation | Done | check، build، migration، test و visual QA موفق باشند |

## Development Sprint 41 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Vite Root Env Loading | Done | web workspace هنگام dev/build، `.env` ریشه پروژه را بخواند |
| VAPID Public Injection Check | Done | `VITE_VAPID_PUBLIC_KEY` داخل bundle وب تزریق شود |
| Private Key Leak Check | Done | `VAPID_PRIVATE_KEY` داخل bundle وب دیده نشود |
| Run Guide Update | Done | راهنمای اجرا توضیح دهد env وب از ریشه خوانده می‌شود و restart لازم است |
| Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 42 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Bundle Warning Review | Done | warning اندازه chunk در build وب بررسی شود |
| Vendor Manual Chunks | Done | React و iconها از app chunk اصلی جدا شوند |
| Bundle Size Check | Done | بزرگ‌ترین JS chunk زیر آستانه warning Vite قرار بگیرد |
| Regression Validation | Done | check، build، test و visual QA موفق باشند |

## Development Sprint 43 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Bundle Budget Script | Done | `npm run bundle:check` خروجی build وب را برای اندازه chunkهای JS بررسی کند |
| Chunk Ceiling | Done | بزرگ‌ترین JS chunk با آستانه پیش‌فرض 480KB کنترل شود |
| Total JS Ceiling | Done | مجموع JS با آستانه پیش‌فرض 560KB کنترل شود |
| CI Local Integration | Done | `npm run ci:local` بعد از build، budget check را اجرا کند |
| Regression Validation | Partial | check، build، bundle:check و visual QA موفق؛ دو تست rate-limit پس از روشن شدن PostgreSQL باید دوباره اجرا شوند |

## Development Sprint 47 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Profile Workspace Split | Done | ورود، ثبت‌نام، تکمیل پروفایل، آگهی‌های من و خلاصه گفتگو در `ProfileWorkspace.tsx` قرار بگیرند |
| Chat Workspace Split | Done | drawer گفتگو، پیام‌ها، report، mute/block و ارسال پیام در `ChatWorkspace.tsx` قرار بگیرند |
| Callback and State Wiring | Done | state و handlerهای موجود از `main.tsx` به componentها منتقل شوند بدون تغییر قرارداد رفتاری |
| Bundle Regression | Done | chunk اصلی کاهش یابد و `bundle:check` پاس شود |
| Visual Validation | Done | `check`، `build`، `bundle:check` و `qa:visual` موفق باشند |

## Development Sprint 48 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Profile Lazy Import | Done | `ProfileWorkspace` با `React.lazy` و dynamic import بارگذاری شود |
| Chat Lazy Import | Done | `ChatWorkspace` فقط هنگام باز شدن گفتگو بارگذاری شود |
| Loading Fallbacks | Done | fallback قابل‌فهم برای حساب و چت هنگام بارگذاری نمایش داده شود |
| Chunk Output | Done | chunk مستقل profile حدود ۲۴KB و chunk چت حدود ۵.۵KB ساخته شود |
| Regression Validation | Done | check، build، bundle:check و visual QA موفق باشند |

## Development Sprint 53 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Favorites Migration | Done | جدول `favorites` با unique user/content و indexهای لازم اضافه شود |
| Favorites API | Done | list/add/remove endpointهای protected ساخته شوند |
| Favorites UI | Done | قلب کارت آگهی به favorite واقعی وصل شود و حالت active داشته باشد |
| AI Listing Review | Done | endpoint بررسی کیفیت آگهی با local fallback قابل استفاده باشد |
| AI Unit Tests | Done | پیشنهادهای دستیار برای آگهی ناقص و کامل تست شوند |
| Regression Validation | Partial | check/build/bundle/visual موفق؛ دو تست rate-limit منتظر PostgreSQL هستند |

## Development Sprint 50 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Mobile Viewport QA | Done | viewport ۳۹۰×۸۴۴ بدون horizontal overflow و overlap باشد |
| Desktop Viewport QA | Done | viewport ۱۴۴۰×۹۰۰ بدون horizontal overflow و shell پایدار باشد |
| PWA Shell Check | Done | manifest و service worker در build web حاضر باشند |
| Content Quality Pass | Done | labelهای فرم ثبت آگهی خوانا و فارسی باشند |
| Regression Validation | Done | check، build، bundle:check و visual QA موفق باشند |

## Development Sprint 51 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Secret Hygiene | Done | `.env.example` private key یا SMS API key واقعی نداشته باشد |
| Release Preflight | Done | `npm run release:check` artifactهای build و PWA را بررسی کند |
| Strict Production Guard | Done | حالت `RELEASE_PREFLIGHT_STRICT=1` envهای production را کنترل کند |
| Storage Decision | Done | local media برای beta و volume/object storage برای production مستند شود |
| Release Checklist | Done | ترتیب deploy، migration، smoke و موارد deferred در سند production ثبت شود |

## Development Sprint 52 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Price Range Filter | Done | بازار حداقل و حداکثر قیمت را روی نتایج اعمال کند |
| Market Sorting | Done | مرتب‌سازی جدیدترین، ارزان‌ترین و گران‌ترین در UI فعال باشد |
| Filter UX | Done | کنترل‌ها در rail فعلی و mobile layout بدون overlap کار کنند |
| Product Roadmap Reset | Done | فازهای بعدی از زیرساخت صرف به قابلیت‌های محصولی اولویت‌بندی شوند |
| Regression Validation | Done | check، build، bundle:check و visual QA موفق باشند |

## Development Sprint 49 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Notice Feedback | Done | پیام‌های سراسری قابل‌بستن و دارای live region باشند |
| Publish Feedback | Done | فرم ثبت آگهی hint مرحله‌ای و وضعیت واضح هنگام ارسال داشته باشد |
| Chat Readability | Done | عنوان گفتگو، subtitle امن و loading state خوانا باشند |
| Responsive Controls | Done | کنترل‌های جدید در layout موجود بدون overlap کار کنند |
| Regression Validation | Done | check، build، bundle:check و visual QA موفق باشند |

## Development Sprint 44 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Admin Component Split | Done | پنل ادمین به component جدا در `apps/web/src/components/AdminWorkspace.tsx` منتقل شود |
| Dynamic Import | Done | workspace ادمین با `React.lazy` و dynamic import بارگذاری شود |
| Suspense Fallback | Done | هنگام بارگذاری پنل ادمین fallback سبک و خوانا نمایش داده شود |
| Bundle Output Check | Done | build وب chunk جدا برای `AdminWorkspace` بسازد و chunk اصلی کوچک‌تر شود |
| Regression Validation | Done | check، build، bundle:check، test و visual QA موفق باشند |

## Development Sprint 45 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Import Hygiene | Done | import اضافه `Inbox` از `main.tsx` حذف شود |
| Lazy Split Stability | Done | build همچنان chunk جدا برای `AdminWorkspace` بسازد |
| Bundle Budget | Done | `npm run bundle:check` با chunk اصلی حدود 440KB پاس شود |
| Regression Validation | Done | check، build، bundle:check، test و visual QA موفق باشند |

## Development Sprint 46 Tasks

| Task | Status | Acceptance Criteria |
|---|---|---|
| Legacy Admin JSX Removal | Done | بلوک‌های قدیمی `false && activeWorkspace === "admin"` از `main.tsx` حذف شوند |
| Admin Lazy Path Integrity | Done | مسیر live `AdminWorkspace` با `React.Suspense` باقی بماند |
| Dead Import Check | Done | ارجاع مرده به icon/component قدیمی در `main.tsx` باقی نماند |
| Regression Validation | Partial | check، build، bundle:check و visual QA موفق؛ دو تست rate-limit پس از روشن شدن PostgreSQL باید دوباره اجرا شوند |

## Backlog اولیه

| Item | Priority | وضعیت |
|---|---|---|
| Product Discovery Document | P0 | Done |
| Market Research Document | P0 | Done |
| Product Strategy Document | P0 | Done |
| PRD MVP Document | P0 | Done |
| PRD MVP | P0 | Done |
| UX Flow Design | P0 | Done |
| Domain Model | P0 | Done |
| Database/API Design | P0 | Done |
| System Architecture | P0 | Done |
| Security & Trust Design | P0 | Done |
| Development Scaffold | P0 | Done |
| Backend Foundation Sprint | P0 | Ready |
| Marketplace Experience Sprint | P0 | In Progress |
| Trust Interaction Persistence Sprint | P0 | Done |
| Real Database Validation Sprint | P0 | Done |
| Session Auth Foundation Sprint | P0 | Done |
| Moderation Admin Panel Sprint | P0 | Done |
| Role-Based Admin Access Sprint | P0 | Done |
| Content Approval Lifecycle Sprint | P0 | Done |
| Session Revocation Sprint | P0 | Done |
| UX Warmth and Navigation Polish Sprint | P0 | Done |
| Automated Visual QA Sprint | P0 | Done |
| Production Auth Hardening Sprint | P0 | Done |
| Admin Route Separation Sprint | P1 | Done |
| Real SMS OTP Adapter Sprint | P0 | Done |
| Kavenegar SMS Provider Sprint | P0 | Done |
| SMS E2E Smoke Tooling Sprint | P0 | Done |
| Kavenegar Delivery Smoke Sprint | P0 | Done |
| Root Env Loading Fix Sprint | P0 | Done |
| Admin Access Boundary Sprint | P1 | Done |
| Persisted OTP Challenge Sprint | P0 | Done |
| OTP Cleanup and Rate Limit Sprint | P0 | Done |
| Beta UX Polish Sprint | P1 | Done |
| Deploy Readiness and CI Sprint | P0 | Done |
| Final Beta UX and Access Pass Sprint | P0 | Done |
| Public UX, Signup, Media and Captcha Sprint | P0 | Done |
| User Workspace and Conversation Polish Sprint | P1 | Done |
| Mobile Readiness and PWA Baseline Sprint | P1 | Done |
| Media Storage Baseline Sprint | P1 | Done |
| Server-Side Captcha Proof Sprint | P1 | Done |
| Password Login Abuse Guard Sprint | P1 | Done |
| Captcha Experience Polish Sprint | P1 | Done |
## Development Sprint 54 - AvalAI AI Provider

| Task | Status | Acceptance Criteria |
|---|---|---|
| AvalAI adapter | Done | Backend با `POST /v1/responses` و مدل `gpt-5.6-luna` کار کند |
| Secret boundary | Done | `AVALAI_API_KEY` فقط در env backend باشد و وارد web نشود |
| Response normalization | Done | JSON ناقص، code fence و خطای provider به پاسخ معتبر تبدیل شود |
| Local fallback | Done | نبود کلید یا خطای سرویس، ثبت آگهی و review محلی را از کار نیندازد |
| Regression validation | Partial | check، build و release check موفق؛ دو تست rate-limit نیازمند PostgreSQL روشن هستند |
## Development Sprint 55 - AI Listing Copilot

| Task | Status | Acceptance Criteria |
|---|---|---|
| AI result panel | Done | نتیجه AI داخل فرم و مستقل از notice نمایش داده شود |
| Apply suggestions | Done | عنوان و توضیحات با تایید کاربر روی فرم اعمال شوند |
| Listing enrichment | Done | category suggestion و price hint نمایش داده شوند |
| Broken UI copy | Done | علامت سؤال و متن خراب دکمه AI حذف شوند |
| Native mobile gate | Done | شروع native به بعد از تثبیت backend، pilot و readiness منتقل شود |
| Regression validation | Done | check، build، bundle و release check موفق باشند |
## Development Sprint 56 - Image Quality and Listing Attributes

| Task | Status | Acceptance Criteria |
|---|---|---|
| Image metadata | Done | ابعاد، حجم و MIME type قبل از review استخراج شوند |
| Local image advice | Done | کیفیت پایه تصویر بدون provider خارجی بررسی شود |
| Attribute suggestions | Done | ویژگی‌های پیشنهادی در پاسخ AI و UI نمایش داده شوند |
| Privacy boundary | Done | عکس خام به provider خارجی ارسال نشود |
| Regression validation | Done | check، build و 39 تست API موفق باشند |
## Development Sprint 57 - Smart Search and Similar Listings

| Task | Status | Acceptance Criteria |
|---|---|---|
| Persian normalization | Done | ي/ی، ك/ک و اعراب در query یکسان شوند |
| Relevance ranking | Done | عنوان، دسته، شهر و توضیحات وزن متفاوت داشته باشند |
| Similar listings | Done | حداکثر سه پیشنهاد مشابه در جزئیات نمایش داده شود |
| Mobile responsive | Done | بخش مشابه‌ها در viewport موبایل بدون overflow باشد |
| Visual regression | Done | QA دسکتاپ و موبایل موفق باشد |
## Development Sprint 58 - Brand and Trust Layer

| Task | Status | Acceptance Criteria |
|---|---|---|
| Brand asset | Done | لوگوی ارسالی در assetهای web قرار گیرد |
| Header branding | Done | لوگو در هدر بدون crop و distortion دیده شود |
| Trust signals | Done | فقط نشانه‌های قابل اثبات نمایش داده شوند |
| Business profile boundary | Done | badge و امتیاز جعلی اضافه نشود |
| Responsive validation | Done | build و visual QA موفق باشند |
## Development Sprint 59 - Done

Business Profile persistence، public trust context، فرم پروفایل کسب‌وکار و اتصال seller context به جزئیات آگهی تکمیل شد. خروجی بعدی: evidence-backed trust signals و analytics پایه.
## Development Sprint 60 - Done

Brand Asset Cleanup و handoff documentation تکمیل شد. گام بعدی مصوب: Evidence-backed Trust Signals و Analytics پایه.
## Development Sprint 61 - Done

Evidence-backed trust summary و analytics event persistence تکمیل شد. سند انتقال کامل برای اکانت جدید در `docs/NEW_ACCOUNT_START_HERE_FA.md` قرار گرفت.
## Development Sprint 62 - Implemented

Analytics dashboard محدود به مالک آگهی، تنظیم opt-out و حذف eventهای شخصی اضافه شد. DB validation پس از فعال‌شدن Docker Desktop باید اجرا شود.
## Development Sprint 63 - Done

Retention job، privacy policy endpoint/UI copy و seller response rate مبتنی بر پیام‌های واقعی تکمیل شد.
## Development Sprint 64 - Done

Media asset metadata، storage contract و API contract اپ موبایل تکمیل شد. object storage واقعی برای production همچنان deployment decision بعدی است.
## Development Sprint 89 - Done

- پازل وب در RTL دیگر وارونه حرکت نمی‌کند.
- پازل موبایل drag واقعی دارد و کلیک ساده proof تولید نمی‌کند.
- build موبایل به‌صورت پیش‌فرض به `https://api.4dbazar.ir` متصل است.
- app icon، adaptive icon، splash و لوگوی شفاف رسمی اضافه شدند.
- auth، market، navigation، loading/error/empty stateهای اصلی موبایل بازطراحی شدند.
- فرم ثبت آگهی شهر، دسته‌بندی، نوع قیمت و مبلغ را از flow واقعی دریافت می‌کند.
- URL نسبی media با دامنه API resolve می‌شود.
- rate limit احراز هویت در تست و توسعه از روشن بودن PostgreSQL مستقل شد و production همچنان fail-closed است.
- check، build، ۴۷ تست، Expo config/export، emulator QA، bundle check و visual QA موفق بودند.

## Development Sprint 88 - Done

- `eas.json` با profileهای development/preview/production اضافه شد.
- script `mobile:build:android:development` اضافه شد.
- platform ثبت native token از `Platform.OS` خوانده می‌شود.
- Expo config و Android export موفق بودند.
- cloud EAS build به projectId واقعی و credentials وابسته است.

## Development Sprint 87 - Done

- `EXPO_PUSH_API_URL` به config و `.env.example` اضافه شد.
- مسیر send و getReceipts از config استفاده می‌کند.
- parser مستقل ticket پاسخ Expo اضافه شد.
- تست malformed provider response اضافه شد.
- test suite به ۴۳ تست API رسید و موفق بود.

## Development Sprint 86 - Done

- endpoint diagnostic مدیریتی outbox اضافه شد.
- شمارش statusهای pending/processing/sent و سایر وضعیت‌ها برگردانده می‌شود.
- ۱۰ خطای اخیر برای debugging برگردانده می‌شود.
- دسترسی فقط با نقش moderator ممکن است.
- تست authorization جدید اضافه شد.
- check، API build و test suite موفق بودند.

## Development Sprint 85 - Done

- recovery jobهای stuck بعد از timeout اضافه شد.
- retry delay به backoff نمایی با سقف ۱۵ دقیقه تبدیل شد.
- خروجی worker تعداد recovered را گزارش می‌کند.
- check، build و test suite موفق بودند.
- deferred: worker دائمی و metrics production.

## Development Sprint 84 - Done

- migration `0019_notification_outbox.sql` اضافه شد.
- job اعلان هنگام پیام در PostgreSQL ثبت می‌شود.
- worker پردازش outbox با claim، send، sent و retry ساخته شد.
- command `npm run notifications:worker` اضافه شد.
- مسیر پاسخ ارسال پیام از delivery مستقیم جدا شد.
- build و test suite موفق بودند.
- deferred: worker دائمی، lock recovery و queue observability.

## Development Sprint 83 - Done

- Expo ticket بعد از ارسال ثبت و receipt آن با تأخیر کوتاه polling می‌شود.
- `native_failed` به نتیجه delivery اضافه شد.
- DeviceNotRegistered از receipt نیز revoke می‌شود.
- خطا یا timeout receipt مسیر ارسال پیام را مختل نمی‌کند.
- check، API build و test suite موفق بودند.
- deferred: queue/worker durable و retry policy کامل.

## Development Sprint 82 - Done

- ارسال native push به Expo Push Service اضافه شد.
- payload شامل `conversationId` و `url` است.
- native delivery آمار مستقل attempted/sent/revoked دارد.
- tokenهای `DeviceNotRegistered` خودکار revoke می‌شوند.
- نبود VAPID، native delivery را متوقف نمی‌کند.
- build و test suite موفق بودند.
- deferred: receipt polling، queue/worker و EAS production credentials.

## Development Sprint 81 - Done

- migration `0018_native_push_tokens.sql` اضافه شد.
- جدول native token با unique کاربر/توکن و status ساخته شد.
- endpointهای `POST/DELETE /api/v1/me/native-push-tokens` اضافه شدند.
- validation platform/provider/token و mobile verification اعمال شد.
- mobile بعد از فعال‌سازی اعلان، token را best-effort به API ثبت می‌کند.
- تست validation جدید اضافه شد؛ build و test suite موفق بودند.
- deferred: ارسال واقعی Expo/FCM push و worker ارسال.

## Development Sprint 80 - Done

- `expo-notifications` به mobile اضافه شد.
- notification channel اندروید و permission flow پیاده‌سازی شد.
- Expo push token به‌صورت local ذخیره می‌شود.
- notification response با `conversationId` به deep link فعلی گفتگو متصل شد.
- `app.json` برای plugin اعلان آماده شد.
- typecheck، config validation، build کامل و Android export موفق بودند.
- deferred: EAS build، FCM/APNs credentials، native token persistence و ارسال production push.

## Development Sprint 79 - Done

| خروجی | وضعیت | توضیح |
|---|---|---|
| Conversation deep link | Done | cold start و foreground با Linking |
| Push destination foundation | Done | بازکردن conversation مشخص |
| Chat image hardening | Done | رد تصویر بزرگ‌تر از ۲MB قبل از upload |

## Development Sprint 78 - Done

| خروجی | وضعیت | توضیح |
|---|---|---|
| Chat image picker | Done | انتخاب تصویر از گالری |
| Chat media upload | Done | استفاده از media API موجود |
| Image message UI | Done | نمایش تصویر داخل thread |
| Size control | Existing | محدودیت فعلی media/MVP حفظ شد |

## Development Sprint 77 - Done

| خروجی | وضعیت | توضیح |
|---|---|---|
| Persisted read receipt | Done | محاسبه از `conversation_reads` |
| Message status UI | Done | ارسال‌شده / خوانده‌شده |
| Conversation continuity | Done | سازگار با polling و mark-read فعلی |

## Development Sprint 76 - Done

| خروجی | وضعیت | توضیح |
|---|---|---|
| Chat polling | Done | refresh خودکار هر ۱۵ ثانیه |
| Mute/unmute | Done | تنظیم اعلان گفتگو |
| Block/unblock | Done | کنترل مسدودسازی و جلوگیری از ارسال |
| Message report | Done | گزارش پیام با target واقعی |

## Development Sprint 75 - Done

| خروجی | وضعیت | توضیح |
|---|---|---|
| Conversation thread | Done | ورود از inbox به گفتگوی واقعی |
| Message history | Done | دریافت پیام‌ها از API |
| Send message | Done | ارسال پیام و append فوری در UI |
| Thread refresh | Done | refresh دستی برای پیام‌های جدید |

## Development Sprint 74 - Done

| خروجی | وضعیت | توضیح |
|---|---|---|
| Mobile edit form | Done | ویرایش عنوان و توضیحات آگهی |
| Moderation reset UX | Done | نمایش پیام ارسال برای بررسی مجدد |
| Edit/delete workspace | Done | مدیریت آگهی از تب آگهی‌های من |

## Development Sprint 73 - Done

| خروجی | وضعیت | توضیح |
|---|---|---|
| Mobile profile tabs | Done | اطلاعات حساب و آگهی‌های من |
| Mobile profile actions | Done | ذخیره اطلاعات، حذف آگهی و خروج |
| Web visual pass | Done | brand surfaces، hover و motion |
| Accessibility motion | Done | پشتیبانی `prefers-reduced-motion` |

## Development Sprint 72 - Done

| خروجی | وضعیت | توضیح |
|---|---|---|
| Owner update API | Done | `PUT /api/v1/me/contents/:contentId` |
| Owner delete API | Done | `DELETE` با soft-delete و کنترل مالکیت |
| Moderation reset | Done | ویرایش آگهی دوباره به submitted برمی‌گردد |
| Mobile delete action | Done | تایید حذف و refresh لیست موبایل |

## Development Sprint 71 - Done

| خروجی | وضعیت | توضیح |
|---|---|---|
| My listings API | Done | اتصال به `/api/v1/me/contents` |
| Listing status UI | Done | نمایش منتشرشده، در انتظار بررسی و ردشده |
| Profile workspace | Done | تعداد و خلاصه آگهی‌های کاربر |

## Development Sprint 70 - Done

| خروجی | وضعیت | توضیح |
|---|---|---|
| Profile hydration | Done | دریافت `/api/v1/me` و پرکردن فرم از DB |
| Profile status | Done | نمایش تایید موبایل، رمز و کامل‌بودن حساب |
| Persian profile UI | Done | حذف متن‌های انگلیسی از profile |
| Official logo | Done | نمایش asset برند در profile |

## Development Sprint 69 - Done

| خروجی | وضعیت | توضیح |
|---|---|---|
| Mobile password setup | Done | ذخیره رمز از مسیر `/api/v1/me/profile` |
| Profile onboarding | Done | نام، نام خانوادگی و شهر MVP |
| Official logo asset | Done | لوگوی افقی رسمی در bundle موبایل |
| Password validation UX | Done | حداقل ۸ کاراکتر و پیام خطای API |

## Development Sprint 68 - Done

| خروجی | وضعیت | توضیح |
|---|---|---|
| Mobile password login | Done | اتصال به `/api/v1/auth/password-login` |
| Mobile SMS captcha | Done | challenge/proof واقعی قبل از OTP |
| OTP payload fix | Done | ارسال `otp` مطابق قرارداد API |
| Auth error feedback | Done | نمایش کد خطای واقعی به‌جای پیام عمومی |

## Development Sprint 67 - Done

| خروجی | وضعیت | توضیح |
|---|---|---|
| Mobile router | Done | بازار، ثبت آگهی، گفتگو و پروفایل |
| Listing detail/contact | Done | جزئیات و contact intent واقعی |
| Native image flow | Done | انتخاب تصویر، upload و ثبت آگهی |
| Android export | Done | خروجی Expo Android موفق |
| Dependency audit | Monitoring | npm تعداد 17 آسیب‌پذیری گزارش کرد |

## Development Sprint 65 - Done

S3-compatible media adapter، production config guard و storage documentation تکمیل شد.
## Development Sprint 66 - Done

Native mobile shell اولیه با Expo، feed، detail، OTP auth و profile اضافه شد.

## Development Sprint 91 - In Progress

| Task | Status | Acceptance Criteria |
|---|---|---|
| Unified product design system | Done | token، component، responsive، motion و accessibility مشترک مستند و روی Web/Mobile اعمال شود |
| Web marketplace redesign | Done | آگهی در نمای اول، فیلتر responsive، mobile bottom nav و visual QA بدون overflow باشد |
| Mobile marketplace redesign | Done | search، category، کارت تصویری، navigation و RTL interaction در export Android موجود باشد |
| Firefox post-design rerun | Pending | quality matrix با Firefox binary سالم پس از design hardening دوباره پاس شود |
| OS OTP Autofill hint | Done | Android/iOS بتوانند کد یک‌بارمصرف را بدون مجوز کامل SMS پیشنهاد دهند |
| Auto verify six-digit OTP | Done | verify فقط یک‌بار پس از کامل شدن ۶ رقم اجرا شود و شکست باعث loop نشود |
| Hosted release smoke | In Progress | smoke عمومی production پاس شد و smoke حساب‌محور read-only آماده است؛ OTP، listing با تصویر، moderation و chat روی production باید پس از آپلود v0.1.3 دستی اجرا و evidence شوند |
| Media backup and restore drill | Done | روی cPanel، backup/verify/restore واقعی انجام شد؛ ۷ فایل، ۲۳۶۶۳۳ بایت و checksum موفق |
| Real-device preview QA | In Progress | preview APK با `versionCode=3` روی emulator `Pixel_2_API_36` نصب و اجرا شد؛ لوگو، صفحه ورود و پازل پاس شدند؛ ورود واقعی، OTP، ثبت آگهی و چت باقی است |

## Development Sprint 92 - Planned

| Task | Status | Acceptance Criteria |
|---|---|---|
| Service/content separation | In Progress | `listing` و `service_listing` در DB/API ثبت شوند؛ migration و validation پایه انجام شد |
| Local places and support foundation | In Progress | شهر/روستا با parent city، تیکه‌ی احراز، پشتیبانی و API مدیریت کاربران اضافه شد؛ UI ادمین و تایید فهرست رسمی روستاها باقی است |
| Multi-media listing foundation | In Progress | حداکثر ۶ عکس و ۱ ویدیو با asset ownership و local storage رایگان اضافه شد؛ اتصال کامل موبایل و UI گالری باقی است |
| Admin listing/user controls | In Progress | endpoint جزئیات سازنده، حذف آگهی و احراز کاربر اضافه شد؛ پنل دیداری ادمین باید متصل شود |
| Publication plan catalog | Planned | تعرفه فقط از DB/API خوانده و روی انتشار snapshot شود |
| Service-specific form | In Progress | محدوده خدمت، مدل قیمت و زمان ارائه در Web/Mobile ثبت می‌شوند |
| Searchable selectors | In Progress | جست‌وجوی شهر و دسته در فرم ثبت وب و موبایل موجود باشد |
| Payment boundary | Planned | free/waived واقعی کار کند و paid بدون provider به‌صورت fail-closed بماند |
| Cross-client QA | Planned | build، test، quality QA و Android device QA پاس شوند |

مرجع اجرایی: `docs/SERVICE_MARKETPLACE_TARIFFS_FA.md`

## Development Sprint 92 - Increment 2

| Task | Status | Acceptance Criteria |
|---|---|---|
| Admin users and verification UI | Done | فهرست کاربران و تغییر وضعیت verification برای نقش admin در پنل وب وصل باشد |
| Admin listing deletion UI | Done | حذف آگهی با تأیید کاربر و endpoint محافظت‌شده انجام شود |
| Support UI | Done | ارسال تیکت از پروفایل و پاسخ از پنل ادمین انجام شود |
| Profile summary/edit state | Done | اطلاعات کامل‌شده خلاصه و ویرایش در مسیر جدا نمایش داده شود |
| Full village catalog | Pending | فهرست رسمی و کامل روستاهای چهار شهر با منبع معتبر وارد و راستی‌آزمایی شود |
| Listing composer modal | Pending | ثبت آگهی در composer مستقل و responsive باز شود |

## Development Sprint 92 - Increment 3

| Task | Status | Acceptance Criteria |
|---|---|---|
| Profile status vs account information | Done | وضعیت حساب و اطلاعات قابل ویرایش در دو حالت روشن نمایش داده شوند |
| Support popup | Done | پشتیبانی با دکمه آیکونی باز شود و سابقه/ارسال تیکت کار کند |
| Persistent listing media | Done | رسانه feed و محتوای کاربر از DB خوانده شود و بعد از refresh باقی بماند |
| Multi-media validation | Done | فرمت‌های مجاز تصویر/ویدیو و preview پیش از ارسال کنترل شوند |
| Admin creator details | Done | ادمین بتواند کاربر را جست‌وجو و جزئیات creator/media آگهی را ببیند |
| Versioned cPanel artifacts | Done | release جدید بدون حذف ZIPهای قبلی ساخته شود |
| cPanel multi-media smoke | Pending | چند تصویر و یک ویدیو روی مقصد ذخیره و بعد از refresh قابل مشاهده باشد |
| Full village catalog | Pending | فهرست رسمی روستاهای چهار شهر تکمیل و راستی‌آزمایی شود |
| Listing composer modal | Pending | مسیر ثبت آگهی مستقل، responsive و قابل بازگشت باشد |

## Development Sprint 92 - Increment 4

| Task | Status | Acceptance Criteria |
|---|---|---|
| Support FAB and corner popup | Done | دکمه آیکونی، tooltip، popup responsive و close قابل‌دسترس باشد |
| Separate business profile summary | Done | پروفایل کسب‌وکار از اطلاعات ضروری summary و مسیر ویرایش مستقل داشته باشد |
| Admin detail error handling | Done | خطای API قدیمی در promise خام رها نشود و پیام قابل فهم نمایش داده شود |
| Multi-media affordance | Done | انتخاب چند عکس/ویدیو و تعداد رسانه آماده برای کاربر واضح باشد |
| Release 0.1.7 | Done | ZIP وب و API تولید و artifactهای v0.1.5/v0.1.6 حفظ شوند |
| Hosted API route smoke | Pending | endpointهای support و admin detail بعد از deploy 2xx بدهند |

## Development Sprint 92 - Increment 5

| Task | Status | Acceptance Criteria |
|---|---|---|
| Append media selections | Done | عکس دوم/سوم به آرایه قبلی اضافه شود و overwrite نکند |
| Collapsible profile sections | Done | اطلاعات ضروری و کسب‌وکار فقط با انتخاب کاربر باز شوند |
| Admin visual pass | Done | پنل ادمین ستون‌بندی، فاصله و hierarchy قابل‌اسکن داشته باشد |
| Release 0.1.8 | Done | ZIPهای وب/API تولید و نسخه‌های قبل حفظ شوند |

## Development Sprint 92 - Increment 6

| Task | Status | Acceptance Criteria |
|---|---|---|
| Modal listing/service composer | Done | فرم‌ها فقط با دکمه باز شوند، escape/backdrop/close کار کند و بعد از ثبت بسته شود |
| Support floating action | Done | FAB پایین راست و popup راست‌چین responsive باشد |
| Admin users clarity | Done | users فقط برای admin، جستجو/refresh مستقل و نقش فعلی برای moderator شفاف باشد |
| Release 0.1.9 | Done | ZIPهای وب/API تولید و releaseهای قبل حفظ شوند |

## Development Sprint 92 - Increment 7

| Task | Status | Acceptance Criteria |
|---|---|---|
| Separate listing/service forms | Done | هر launcher فقط فرم خودش را باز کند |
| Support popup visual fix | Done | کارت سفید، خوانا، پایین راست و responsive باشد |
| Admin role grant | Done | شماره تنظیم‌شده در ورود بعدی admin و moderator بگیرد |
| Release 0.1.10 | Done | ZIPهای وب/API و manifest تولید شوند |

## Development Sprint 92 - Increment 8

| Task | Status | Acceptance Criteria |
|---|---|---|
| مستقل‌سازی فرم خدمت | Done | فیلدهای خدمت از فرم آگهی جدا و معنایی باشند |
| اصلاح FAB و popup پشتیبانی | Done | اندازه ثابت، لایه مستقل و بدون overlap با bottom action |
| بهبود فهرست کاربران ادمین | Done | جستجو/refresh و محدودیت role admin حفظ شود |
| Release 0.1.11 | Done | ZIP وب/API و manifest نسخه‌دار تولید شوند |

## Development Sprint 92 - Increment 9

| Task | Status | Acceptance Criteria |
|---|---|---|
| فاصله و خروج مودال انتشار | Done | navbar با فرم تداخل نداشته باشد و close واضح باشد |
| همسان‌سازی launcher آگهی/خدمت | Done | اندازه و رفتار هر دو دکمه یکسان باشد |
| پشتیبانی شناور | Done | FAB با اسکرول در viewport بماند و popup overlay مستقل داشته باشد |
| کاربران ادمین در disclosure | Done | کاربران داخل بخش بازشونده با search/refresh/verify دیده شوند |
| Release 0.1.12 | Done | ZIP وب/API و manifest تولید شوند |

## Development Sprint 92 - Increment 10

| Task | Status | Acceptance Criteria |
|---|---|---|
| طرح تست بار ۳۰۰ کاربر | Done | سناریوها، گروه‌ها، ramp-up، SLA و مرز ایمنی در سند تست ثبت شد |
| harness بار محلی | Done | اجرای فقط روی local/test، ثبت stage metrics و JSON result |
| اجرای read-heavy ramp-up | Done with warning | هر ۸ مرحله تا ۳۰۰ اجرا شد؛ ۵۴۱۹ درخواست، ۰ خطای 5xx/network و ۴۶۹۹ پاسخ 429 |
| اجرای read-heavy با bypass محلی | Done with warning | فقط روی `127.0.0.1` با `LOAD_TEST_MODE=true`؛ ۵۴۱۹ درخواست، ۰ خطا، P95 برابر ۵۰۷ms |
| اجرای write/auth/upload/chat/admin | Blocked | DB تستی ایزوله و fixture tokenهای معتبر لازم است |
| رفع bundle و quality gate | Open | مجموع JS از budget عبور کرده و harness Playwright با context ناقص متوقف می‌شود |
| گزارش تست بار | Done with warning | گزارش با P50/P90/P95/P99، rate limit و محدودیت پوشش ثبت شد |

## Development Sprint 93 - Storefront Foundation

| Task | Status | Acceptance Criteria |
|---|---|---|
| Gap Analysis و مرزبندی غرفه | Done | تفاوت حساب، پروفایل کسب‌وکار و غرفه در سند مستقل ثبت شد |
| migration و مدل داده غرفه | In progress | مالک یکتا، slug یکتا، lifecycle، media و اتصال آگهی تعریف شود |
| API مالک/public/admin | In progress | مالکیت، visibility عمومی و moderation با role gate تست شود |
| اتصال آگهی به غرفه | In progress | `storefront_id` nullable و آگهی‌های active در صفحه غرفه نمایش داده شوند |
| UI وب غرفه | Pending | صفحه عمومی و workspace مالک با responsive QA اضافه شود |
| release و handoff | Pending | تست، build و ZIP نسخه‌دار پس از تکمیل increment تولید شود |
## Development Sprint 93 - Increment 2

| Task | Status | Acceptance Criteria |
|---|---|---|
| مدیریت غرفه در پروفایل | Done | فرم ساخت/ویرایش، disclosure مستقل و وضعیت moderation نمایش داده شود |
| اتصال آگهی به غرفه | Done | انتخاب اختیاری storefront در فرم ثبت آگهی و ارسال `storefront_id` |
| صفحه عمومی غرفه | Done | مسیر slug، اطلاعات معرفی و آگهی‌های approved با responsive پایه |
| check و production build | Done | `npm run check` و `npm run build` موفق |
| integration PostgreSQL و release ZIP | Pending | smoke دیتابیس، moderation و artifact نسخه‌دار در increment بعد |

## Development Sprint 94 - Listing Experience Foundation

| Task | Status | Acceptance Criteria |
|---|---|---|
| quality gate و build | Done | check، build و workspace tests سبز؛ ۵۱ تست API و ۱ تست shared |
| release cPanel نسخه‌دار | Done | web/api ZIP و manifest برای `v0.1.14-2026-08-22` ساخته شد |
| Gap Analysis Epic تجربه آگهی | Done | وضعیت هر requirement و ترتیب sliceها در سند مستقل ثبت شد |
| navigation کارت آگهی | Done | click تصویر/عنوان/بدنه و Enter/Space جزئیات را باز می‌کند؛ کنترل‌های مستقل جدا هستند |
| CTA تماس و trust copy | Done | «تماس» جایگزین متن فنی شد و trust widget عمومی حذف شد |
| integration PostgreSQL/moderation | Blocked | Docker daemon در محیط توسعه در دسترس نیست؛ روی cPanel/DB مقصد باید smoke شود |
| Dynamic category forms و filters | Next | metadata مشترک API/Web/Mobile، validation و فیلتر category-specific |
| Chat push device E2E | Deferred | FCM credential و دستگاه واقعی لازم است |

## Development Sprint 95 - Support/Profile/Moderation Hardening

| Task | Status | Acceptance Criteria |
|---|---|---|
| Support FAB viewport و safe-area | Done | در scroll به card/footer نمی‌چسبد و با bottom navigation تداخل ندارد |
| Support accessibility و keyboard | Done | label، focus، close و Escape کار می‌کنند |
| ادغام مفهومی کسب‌وکار و غرفه | Done | با وجود غرفه، بخش تکراری کسب‌وکار پنهان و اطلاعات ضروری حساب جداست |
| پیام تشخیصی صف moderation | Done | نبود migrationهای 0021/0022 پیام دقیق و قابل‌اقدام می‌دهد |
| تست و build | Done | check، test و build سبز |
| smoke دیتابیس cPanel | Pending | اجرای migration و بررسی health/صف ادمین روی DB مقصد |

## Development Sprint 96 - Storefront Queue and Searchable Selectors

| Task | Status | Acceptance Criteria |
|---|---|---|
| صف غرفه در پنل ادمین | Done | غرفه‌های pending از API خوانده و تأیید/توقف می‌شوند |
| انتخاب‌گر جست‌وجوپذیر شهر/دسته | Done | حداکثر ۷ گزینه نمایش و سایر گزینه‌ها با جست‌وجو قابل انتخاب‌اند |
| تست و build | Done | check، build و workspace tests سبز |
| release و smoke مقصد | Pending | ZIP نسخه‌دار ساخته و migration/تست روی cPanel اجرا شود |

## Development Sprint 97 - Media Gallery, Storefront Discovery and Support Layer

| Task | Status | Acceptance Criteria |
|---|---|---|
| نمایش چندعکسی در کارت و جزئیات | Done | thumbnail، قبلی/بعدی و شمارنده رسانه در Web و public storefront |
| دسترسی به غرفه عمومی | Done | لینک غرفه از کارت و جزئیات آگهی با slug فعال |
| شمارنده بازدید آگهی | Done | `view_count` از eventهای `listing_view` در detail API و UI نمایش داده شود |
| حذف analytics privacy از پروفایل | Done | کارت حریم خصوصی تحلیل‌ها حذف شد |
| Support Portal و لایه‌بندی modal | Done | mount زیر body، fixed viewport، زیر modal و safe-area |
| check، test و build | Done | tsc، ۵۱ تست API، ۱ تست shared و build وب موفق |
| release cPanel نسخه‌دار | Done | ZIP وب/API و manifest برای `v0.1.17-2026-08-22` ساخته شد |
| smoke واقعی مقصد | Next | deploy هر دو ZIP، health/ready، login، گالری، غرفه و admin queue |

## Development Sprint 98 - Hosted Release and Admin Discovery Hardening

| Task | Status | Acceptance Criteria |
|---|---|---|
| smoke عمومی هاست | Done | live، ready، categories، cities، feed، captcha و CORS روی `api.4dbazar.ir` سبز شدند |
| قرارداد پاسخ smoke | Done | shape پاسخ‌های JSON علاوه بر status code بررسی می‌شود |
| صف غرفه ادمین | Done | مالک غرفه با نام/شماره از API برمی‌گردد و صف به‌صورت جمع‌شونده نمایش داده می‌شود |
| release cPanel | Done | ZIPهای وب/API و manifest نسخه `v0.1.18-2026-08-22` ساخته و preflight شدند |
| smoke احراز هویت | Deferred | فقط با `HOSTED_AUTH_TOKEN` واقعی و نشست معتبر قابل اجراست |
| تست واقعی گالری/تصمیم ادمین | Deferred | نیازمند token ادمین و fixture پایدار روی مقصد است |

## Development Sprint 97 - Dynamic Category Metadata (Completion Correction)

| Task | Status | Acceptance Criteria |
|---|---|---|
| schema پویا برای دسته‌ها | Done | migration 0023 و seed اختصاصی برای دسته‌های اصلی |
| اعتبارسنجی metadata در API | Done | ثبت/ویرایش فقط فیلدهای تعریف‌شده و نوع معتبر را می‌پذیرد |
| فرم اختصاصی دسته | Done | تغییر دسته، فیلدهای پویا و requiredهای همان دسته را نمایش می‌دهد |
| فیلتر اختصاصی بازار | Done | فیلترهای metadata فقط برای دسته انتخاب‌شده نمایش و اعمال می‌شوند |
| تست و build | Done | check، build و ۵۳ تست API و ۱ تست shared سبز |
| انتشار روی cPanel | Pending | اجرای migration/seed و deploy جفت ZIP نسخه جدید |

## Development Sprint 99 - Public Listing Detail

| Task | Status | Acceptance Criteria |
|---|---|---|
| مسیر مستقل جزئیات | Done | `/listing/{id}` مستقیماً جزئیات را از API می‌خواند |
| گالری و رسانه | Done | تصویر، چند thumbnail و ویدیو در صفحه مستقل قابل مشاهده‌اند |
| لینک از کارت بازار | Done | تصویر و عنوان کارت به URL جزئیات لینک می‌شوند |
| metadata و اطلاعات کلیدی | Done | شهر، دسته، قیمت، وضعیت، توضیح، ویژگی‌ها، بازدید و غرفه نمایش داده می‌شوند |
| responsive و accessibility پایه | Done | layout موبایل/دسکتاپ، label و keyboard focus پایه برقرار است |
| check، build و test | Done | check/build و ۵۳ تست API و ۱ تست shared سبز |
| اتصال CTAها و SEO اختصاصی | Next | ذخیره/چت واقعی، view dedupe و Open Graph در increment بعد |
| انتشار و smoke هاست | Pending | deploy جفت ZIP و تست URL عمومی روی cPanel |

## Development Sprint 99 - Seed Hotfix 0.1.21

| Task | Status | Acceptance Criteria |
|---|---|---|
| اصلاح seed دسته‌ها | Done | همه ردیف‌های insert دسته‌بندی ۷ مقدار دارند و `metadata_schema` برای دسته‌های جدید `'[]'` است |
| اعتبارسنجی workspace | Done | check، build، ۵۳ تست API و ۱ تست shared سبز |
| بسته‌بندی cPanel | Done | ZIPهای وب/API و manifest نسخه `v0.1.21-2026-08-22` ساخته و seed اصلاح‌شده در API ZIP موجود است |
| اجرای seed روی مقصد | Pending | پس از deploy، `npm run db:seed` با خروجی `Seeds applied.` اجرا شود |

## Release Hardening پس از Sprint 99

| Task | Status | Acceptance Criteria |
|---|---|---|
| دسترس‌پذیری کارت آگهی | Done | حذف nested interactive و پاس quality QA Chromium/WebKit |
| پایداری quality harness | Done | route در سطح page و گزارش شفاف browser skipped |
| کنترل bundle | Done | بزرگ‌ترین chunk زیر ۴۸۰KB و مجموع JS زیر سقف ۶۴۰KB |
| release جدید cPanel | Done | build/test/QA نهایی سبز و ZIP جفت `v0.1.22-2026-08-23` به‌همراه manifest ساخته شد؛ smoke مقصد پس از آپلود باقی است |

## Development Sprint 100 - Admin Queue Data Compatibility

| Task | Status | Acceptance Criteria |
|---|---|---|
| پوشش داده‌های submitted/pending | Done | صف بررسی هر دو وضعیت را نمایش دهد و فقط به سه seed محدود نباشد |
| fallback دیتابیس قدیمی | Done | نبودن جدول‌های اختیاری storefront/media کل صف را 503 نکند |
| رسانه legacy | Done | `image_data_url` قدیمی در fallback به‌صورت media قابل نمایش برگردد |
| تست محلی | Done | check، build و ۵۳ تست API و ۱ تست shared سبز |
| release cPanel | Done (local) | ZIP جفت نسخه `v0.1.23-2026-08-23` و manifest ساخته شد؛ upload، restart و smoke مقصد باقی است |

## Development Sprint 101 - Listing Write Compatibility Repair

| Task | Status | Acceptance Criteria |
|---|---|---|
| ترمیم schema نوشتن آگهی | Done | migration `0024_listing_runtime_repair.sql` برای ستون‌ها و جدول‌های رسانه |
| fallback ثبت آگهی | Done | دیتابیس ناقص با schema پایه هم بتواند آگهی submitted بسازد |
| خطاهای رسانه | Done | مالکیت و سقف رسانه با پاسخ validation 400 گزارش شوند، نه 500 |
| تست محلی | Done | check، build و ۵۳ تست API و ۱ تست shared سبز |
| release cPanel | Pending | ساخت ZIP نسخه `v0.1.24-2026-08-23` و smoke نوشتنی مقصد |

## Development Sprint 102 - Transport + AI Smart Search Design Foundation

| Task | Status | Acceptance Criteria |
|---|---|---|
| gap analysis حمل‌ونقل و جست‌وجوی هوشمند | Done | وضعیت موجود به Already/Partial/Missing/Broken/Redesign تقسیم و در سند ثبت شد |
| مرزبندی MVP و deferred | Done | رزرو، پرداخت، ردیابی زنده، بار و recommendation پیچیده خارج از MVP ثبت شد |
| مدل داده و قرارداد API | Done | transport_details، endpointهای transport و smart search تعریف شد |
| امنیت و fallback AI | Done | schema محدود، fallback deterministic و منع اجرای SQL توسط AI ثبت شد |
| خروجی phase report | Done | گزارش Sprint 102 در `docs/phase-reports` ثبت شد |
| پیاده‌سازی feature | Pending | شروع در Sprint 103 پس از review قراردادها |

## Development Sprint 103 - Transport Core API

| Task | Status | Acceptance Criteria |
|---|---|---|
| migration جزئیات سفر | Done | جدول `transport_details`، index و category migration idempotent هستند |
| ثبت سفر offer/request | Done | endpoint با احراز، پروفایل کامل و validation سفر را submitted می‌کند |
| جزئیات و فهرست مالک | Done | detail عمومی و فهرست سفرهای کاربر وجود دارد |
| لغو سفر | Done | فقط مالک سفر active می‌تواند آن را cancelled کند |
| audit و کنترل lifecycle | Done | create و cancel audit می‌شوند و status domain جداست |
| check/build/test محلی | Done | check، build و ۵۳ تست API و ۱ تست shared سبز |
| migration/smoke cPanel | Pending | روی مقصد اجرا و create/detail/cancel با داده واقعی smoke شود |

## Development Sprint 105 - Transport Web UI

| Task | Status | Acceptance Criteria |
|---|---|---|
| باکس مستقل حمل‌ونقل محلی | Done | launcher مستقل کنار ثبت آگهی/خدمت با CTA ثبت مسیر و جست‌وجو وجود دارد |
| فرم اختصاصی offer/request | Done | فرم سفر از فرم آگهی جداست و فیلدهای مسیر، زمان، ظرفیت و قیمت را دارد |
| اتصال ثبت سفر و جست‌وجو | Done | submit به endpoint transport و search به endpoint deterministic متصل هستند؛ فیلترهای انتخابی مبدأ، مقصد و نوع مسیر نیز searchable هستند |
| modal و keyboard UX | Done | modal با backdrop، close و Escape کنترل می‌شود و فرم داخل صفحه گیر نمی‌کند |
| واکنش‌گرایی وب | Done | layout موبایل تک‌ستونه و کنترل‌های جست‌وجو/فرم قابل استفاده هستند |
| check/build/test محلی | Done | check، build و تست‌های workspace سبز هستند |
| اتصال موبایل و smoke مقصد | Pending | در Sprint بعدی و پس از deploy مقصد انجام شود |

## Development Sprint 106 - Transport UX and Demo Dataset

| Task | Status | Acceptance Criteria |
|---|---|---|
| هم‌ترازی launcherها | Done | launcher حمل‌ونقل بدون badgeهای اضافه و با همان الگوی CTA/فاصله‌گذاری ثبت آگهی و خدمت نمایش داده می‌شود |
| جست‌وجوی منطقی حمل‌ونقل | Done | جست‌وجوی متنی و فیلترهای searchable مبدأ، مقصد و نوع مسیر داخل پنل پیشرفته‌ی بسته‌شونده در دسترس هستند |
| داده دمو توسعه‌ای | Done | اسکریپت local-only برای ۳۰۰ کاربر، ۹۰۰ محتوا و ۲۴ غرفه به‌صورت idempotent اضافه شد |
| حفاظت production | Done | اجرای seed دمو در `NODE_ENV=production` رد می‌شود و رسانه‌ی ساختگی تولید نمی‌شود |
| check/build/test | Done | check، build و ۵۳ تست API و ۱ تست shared سبز |
| اتصال موبایل و smoke مقصد | Pending | در increment بعدی پس از deploy و آماده‌سازی داده مقصد |

## Development Sprint 107 - Market Results and Admin Density

| Task | Status | Acceptance Criteria |
|---|---|---|
| نمایش نتیجه جست‌وجو در بازار | Done | نتایج transport در feed اصلی و با لینک مستقیم جزئیات نمایش داده می‌شوند |
| ویرایش و حذف آگهی خود کاربر | Done | پروفایل action مستقل دارد و به endpointهای موجود PUT/DELETE متصل است |
| فهرست کاربران ادمین | Done | جست‌وجو و dropdown تک‌کاربره جایگزین نمایش هم‌زمان همه کاربران شده است |
| دیالوگ جزئیات ادمین | Done | fixed، محدود به viewport، دارای scroll داخلی و بستن با Escape است |
| check/build محلی | Done | TypeScript و build وب سبز هستند |
| smoke مقصد cPanel | Pending | پس از آپلود، transport، ویرایش/حذف و جزئیات ادمین بررسی شود |

## Development Sprint 108 - Listing Form and Admin UX Repair

| Task | Status | Acceptance Criteria |
|---|---|---|
| ویرایش رسانه‌های آگهی | Done | رسانه‌های قبلی حفظ و `media_asset_ids` جدید در ویرایش به همان آگهی متصل شوند |
| حذف آگهی کاربر | Done | خطای مالکیت و خطای سرویس از هم تفکیک و پیام واقعی به کاربر نمایش داده شود |
| انتخاب مجدد فایل | Done | input فایل بعد از انتخاب reset شود و انتخاب دوباره همان فایل ممکن باشد |
| منطق قیمت آگهی | Done | مبلغ مثبت ثابت و نبودن مبلغ توافقی باشد؛ selector اضافی فرم حذف شود |
| فرم پویا بر اساس دسته | Done | دسته در ابتدای فرم قرار گیرد و metadata اختصاصی پس از انتخاب دسته نمایش داده شود |
| تراکم پنل ادمین | Done | صف گزارش‌ها و پشتیبانی به صورت بسته‌شونده و کم‌تراکم نمایش داده شوند |
| check/build/test محلی | Done | build سبز و ۵۴ تست workspace موفق باشند |
| انتشار و smoke مقصد | Pending | جفت release وب/API آپلود، restart و create/edit/delete روی cPanel بررسی شود |

### Hotfix محلی: guest boot و نشست منقضی

| Task | Status | Acceptance Criteria |
|---|---|---|
| عدم شکست boot با پاسخ ۴۰۱ | Done | پاسخ‌های خصوصی قبل از parse با `response.ok` بررسی شوند و خطای `allow_personalized_events` رخ ندهد |
| پاک‌سازی نشست منقضی | Done | در پاسخ `HTTP 401` توکن storage پاک و برنامه به حالت مهمان برگردد |
| اعتبارسنجی محلی | Done | `npm run check`، `npm run build` و ۵۴ تست workspace سبز باشند |
| انتشار hotfix | Pending | ساخت و آپلود جفت ZIP و Restart App در cPanel |

## Development Sprint 111 - Listing Delete and Media Runtime Repair

| Task | Status | Acceptance Criteria |
|---|---|---|
| ترمیم schema حذف نرم | Done | ستون‌های `updated_at` و `deleted_at` و index مالک/محتوای فعال به‌صورت idempotent موجود باشند |
| smoke حذف واقعی | Done | DELETE مالک روی PostgreSQL محلی پاسخ ۲۰۰ بدهد و `deleted_at` مقدار بگیرد |
| رفع خطای Service Worker | Done | پاسخ پیش از مصرف body clone شود و خطای `Response body is already used` رخ ندهد |
| قاب تصویر و شمارنده رسانه | Done | تصویر کل قاب را با cover پر کند و شمارنده چندعکس به‌صورت badge روی تصویر باشد |
| fallback رسانه گمشده | Done | فایل حذف‌شده پاسخ ۴۰۴ کنترل‌شده بدهد و به ۵۰۰ تبدیل نشود |
| check/build/test/QA | Done | check، build، bundle budget، ۵۵ تست workspace و QA تصویری سبز باشند |
| انتشار و smoke مقصد | Pending | جفت release آپلود، migration اجرا، API restart و حذف/تصویر در cPanel بررسی شود |

## Development Sprint 112 - Local Runtime and Idempotent Delete Hardening

| Task | Status | Acceptance Criteria |
|---|---|---|
| تشخیص API تکراری | Done | تنها یک listener روی پورت ۴۰۰۰ اجرا شود و اجرای نمونه دوم به‌عنوان خطای محیطی شناخته شود |
| حذف idempotent مالک | Done | دو DELETE متوالی برای محتوای متعلق به کاربر هر دو پاسخ موفق بدهند |
| قفل درخواست تکراری UI | Done | تا پایان درخواست، دکمه حذف غیرفعال و وضعیت در حال حذف نمایش داده شود |
| پاک‌سازی Service Worker توسعه | Done | registration و cacheهای `four-d-*` در DEV حذف شوند و F5 bundle کهنه اجرا نکند |
| اعتبارسنجی محلی | Done | check، build، bundle budget و ۵۵ تست workspace سبز باشند |
| انتشار و smoke مقصد | Pending | ZIPهای هم‌نسخه deploy، API restart و حذف واقعی روی cPanel بررسی شود |

## Development Sprint 113 - Bodyless Request and Delete Reliability

| Task | Status | Acceptance Criteria |
|---|---|---|
| هدر صحیح درخواست بدون body | Done | GET/DELETE بدون بدنه `Content-Type: application/json` ارسال نکنند |
| حذف idempotent و هم‌زمان | Done | حذف اول و تکرار آن برای مالک هر دو HTTP 200 باشند و رکورد در فهرست فعال دیده نشود |
| نگاشت خطای parser | Done | خطای 4xx پارسر Fastify به validation 4xx تبدیل شود، نه HTTP 500 |
| بازیابی UI پس از خطا | Done | درخواست تکراری قفل و وضعیت حذف پس از خطای شبکه با سرور reconcile شود |
| اعتبارسنجی محلی | Done | check، build، ۵۶ تست و smoke HTTP واقعی سبز باشند |
| انتشار و smoke مقصد | Pending | release جفت deploy، Node.js App restart و حذف یک آگهی تستی روی cPanel بررسی شود |

## Development Sprint 115 - Feed Truthfulness and Controlled Cleanup

| Task | Status | Acceptance Criteria |
|---|---|---|
| حذف ادغام demo با feed | Done | پاسخ معتبر API بدون افزودن سه آگهی نمونه نمایش داده شود |
| fallback صادقانه production | Done | در خرابی API، build production empty state و هشدار اتصال نشان دهد |
| log خطای feed | Done | خطای query با stack در log درخواست API ثبت شود |
| پاک‌سازی کنترل‌شده بازار | Done | حذف فقط با confirmation صریح، transaction و پاک‌سازی وابستگی‌ها اجرا شود |
| حفظ فایل‌های رسانه | Done | پاک‌سازی محتوای بازار فایل فیزیکی upload را حذف نکند |
| check/build/test محلی | Done | build و ۵۸ تست workspace موفق باشند |
| deploy و smoke مقصد | Pending | API به 200 برسد، backup گرفته شود و سپس پاک‌سازی/ثبت آگهی جدید بررسی شود |

## Development Sprint 116 - Hosted API Origin and Cache Hardening

| Task | Status | Acceptance Criteria |
|---|---|---|
| fallback آدرس API در production | Done | build production در نبود env به `https://api.4dbazar.ir` متصل شود و localhost استفاده نکند |
| جلوگیری از نمایش demo در production | Done | پس از feed خالی، کارت نمونه نمایش داده نشود و empty state دیده شود |
| invalidation Service Worker | Done | cache key از v8 به v9 تغییر کرده و bundle جدید قابل دریافت باشد |
| release cPanel | Done (local) | ZIP جفت و manifest نسخه `v0.1.34-2026-08-25` ساخته و hash شده‌اند |
| deploy و smoke مقصد | Pending | overwrite وب، restart API، health/ready/feed و ثبت آگهی آزمایشی روی cPanel تأیید شود |

## Development Sprint 117 - Comprehensive Test and Regression

| Task | Status | Acceptance Criteria |
|---|---|---|
| تست workspace | Done | check، build، bundle budget، ۵۵ تست API، ۳ تست shared و Visual QA سبز |
| تست موبایل | Done | typecheck، release preflight و build APK نسخه ۰.۱.۸ build ۱۲ سبز |
| تست Pixel Emulator | Done | اجرای APK، اسکرول بازار و selectorهای فرم بدون crash یا خطای runtime |
| hosted smoke | Done | هفت بررسی health/catalog/feed/captcha/CORS موفق |
| تست فیزیکی، admin و deploy مقصد | Pending | نیازمند دستگاه فیزیکی، حساب admin و دسترسی cPanel |

## Development Sprint 133 - Release Artifacts

| Task | Status | Acceptance Criteria |
|---|---|---|
| build جفت وب/API | Done | build کامل موفق باشد |
| ZIP وب و API | Done | بسته‌های نسخه‌دار ساخته شوند |
| manifest و checksum | Done | SHA-256 هر artifact ثبت شود |
| APK موبایل | Done | APK نسخه ۰.۱.۱۳ build ۱۷ موجود باشد |
| deploy و smoke مقصد | Pending | پس از آپلود و restart روی cPanel |

## Development Sprint 132 - Release Gate

| Task | Status | Acceptance Criteria |
|---|---|---|
| release preflight وب | Done | artifact و secret hygiene موفق باشد |
| mobile release preflight | Done | نسخه، شناسه‌ها و API عمومی معتبر باشند |
| bundle budget | Done | chunk و total budget پاس شوند |
| build و تست workspace | Done | build وب، ۵۸ تست API و ۳ تست shared سبز باشند |
| smoke مقصد cPanel با admin | Pending | بعد از deploy جفت API/وب اجرا شود |

## Development Sprint 131 - Admin Authorization Hardening

| Task | Status | Acceptance Criteria |
|---|---|---|
| تست دسترسی فهرست کاربران | Done | moderator پاسخ 403 بگیرد |
| تست دسترسی آگهی‌های کاربر | Done | moderator پاسخ 403 بگیرد |
| check، تست API و build وب | Done | همه سبز باشند |
| E2E با نشست admin روی cPanel | Pending | نیازمند محیط مقصد و نشست عملیاتی |

## Development Sprint 130 - Admin Responsive / Browser QA

| Task | Status | Acceptance Criteria |
|---|---|---|
| responsive smoke در عرض ۳۹۰ | Done | overflow افقی وجود نداشته باشد |
| بررسی navigation، جست‌وجو و فیلتر | Done | عناصر اصلی در DOM قابل مشاهده باشند |
| E2E پنل با نشست admin | Pending | نیازمند حساب admin و مقصد cPanel |

## Development Sprint 129 - Admin Copy / IA Polish

| Task | Status | Acceptance Criteria |
|---|---|---|
| عنوان روشن پنل | Done | مرکز بررسی و عملیات نمایش داده شود |
| وضعیت‌های فارسی | Done | وضعیت آگهی و غرفه قابل‌فهم باشند |
| اولویت گزارش‌ها | Done | priority خام انگلیسی نمایش داده نشود |
| check، تست API و build وب | Done | همه سبز باشند |

## Development Sprint 128 - Admin User Content Moderation

| Task | Status | Acceptance Criteria |
|---|---|---|
| تصمیم moderation در User Detail | Done | تأیید/رد به endpoint رسمی متصل باشد |
| محدودکردن کنترل به submitted | Done | برای وضعیت‌های دیگر دکمه تصمیم نمایش داده نشود |
| refresh بعد از تصمیم | Done | صف moderation و داده بازار تازه‌سازی شوند |
| check، تست API و build وب | Done | check، ۵۶ تست API و build وب موفق باشند |
| E2E با حساب admin روی cPanel | Pending | نیازمند محیط مقصد و حساب عملیاتی است |

## Development Sprint 127 - Admin User Content Detail

| Task | Status | Acceptance Criteria |
|---|---|---|
| اتصال آگهی کاربر به جزئیات کامل | Done | دکمه جزئیات از endpoint واقعی ادمین استفاده کند |
| نمایش وضعیت فارسی | Done | وضعیت‌های شناخته‌شده ترجمه شوند |
| check، تست API و build وب | Done | check، ۵۶ تست API و build وب موفق باشند |
| moderation مستقیم از User Detail و E2E مقصد | Pending | در فاز مستقل با حساب admin بررسی شود |

## Development Sprint 126 - Admin User Contents

| Task | Status | Acceptance Criteria |
|---|---|---|
| endpoint آگهی‌های کاربر | Done | فقط admin و با repository موجود اجرا شود |
| نمایش آگهی‌ها در User Detail | Done | عنوان، توضیح کوتاه و وضعیت دیده شود |
| حذف‌شده‌ها | Done | آگهی‌های حذف‌شده در فهرست نیایند |
| check، تست API و build وب | Done | check، ۵۶ تست API و build وب موفق باشند |
| جزئیات کامل و moderation از User Detail | Pending | با scope و قرارداد جداگانه بررسی شود |

## Development Sprint 125 - Admin User Detail

| Task | Status | Acceptance Criteria |
|---|---|---|
| جزئیات کاربر انتخاب‌شده | Done | اطلاعات واقعی حساب در پنل قابل مشاهده باشد |
| وضعیت احراز و تأیید شماره | Done | وضعیت‌ها با برچسب فارسی و خوانا نمایش داده شوند |
| عملیات موجود verification | Done | endpointهای واقعی `verified` و `profile_complete` حفظ شوند |
| check، تست API و build وب | Done | check، ۵۶ تست API و build وب موفق باشند |
| جزئیات آگهی‌های کاربر و E2E ادمین | Pending | در فاز مستقل بعدی با قرارداد واقعی اجرا شود |

## Development Sprint 124 - Admin / Support Audit

| Task | Status | Acceptance Criteria |
|---|---|---|
| audit مستند Admin/Support/User UX | Done | وضعیت فعلی، کمبودها، ریسک و scope فاز ثبت شده باشد |
| اطلاعات قابل‌فهم تیکت در پنل | Done | نام/شماره موجود کاربر، کد تیکت، وضعیت فارسی و زمان نمایش داده شود |
| حفظ دسترسی Support | Done | endpoint همچنان فقط برای moderator قابل دسترسی باشد |
| check، تست API و build وب | Done | check، ۵۶ تست API و build وب موفق باشند |
| User Detail و بازطراحی کامل Admin | Pending | پس از تکمیل audit محدود و با scope جداگانه اجرا شود |

## Development Sprint 118 - Mobile Filter, Navigation and Secure Contact

| Task | Status | Acceptance Criteria |
|---|---|---|
| فیلتر بازار موبایل | Done | پنل فیلتر پیش‌فرض جمع‌شده و صفحه را اشغال نمی‌کند |
| Bottom Navigation | Done | چهار آیتم ارتفاع و جایگاه متقارن دارند |
| تماس امن | Done | شناسه‌ی گفتگو از پاسخ یا fallback گفتگوها resolve می‌شود |
| release و emulator smoke | Done | APK نسخه ۰.۱.۹ build ۱۳ ساخته و بدون خطای runtime اجرا شد |

## Development Sprint 134 - Auth/Profile/Captcha Recovery

| Task | Status | Acceptance Criteria |
|---|---|---|
| تکمیل پروفایل مستقل از password | Done | نام، نام خانوادگی و شهر اصلی معیار profile completion باشند |
| eligibility ثبت آگهی | Done | تأیید موبایل و profile completion جداگانه enforce شوند |
| تفکیک خطاهای CAPTCHA | Done | required، invalid و expired در API/Web/Mobile قابل تشخیص باشند |
| تست و preflight محلی | Done | check، تست‌ها، build و release preflight سبز باشند |
| smoke cPanel و EAS واقعی | Pending | فقط پس از اجرای مقصد و احراز نتیجه ثبت شود |

## Development Sprint 135 - Storefront Feed Integration

| Task | Status | Acceptance Criteria |
|---|---|---|
| inclusion آگهی غرفه در public feed | Done | شرط `storefront_id IS NULL` حذف و approved/deleted/expired کنترل شود |
| projection آگهی غرفه | Done | metadata، وضعیت، context غرفه، تاریخ و view count برگردد |
| لینک Detail در وب و موبایل | Done | کارت غرفه به جزئیات کامل همان آگهی برود |
| build و regression محلی | Done | check، build، typecheck، تست‌ها و bundle سبز باشند |
| smoke واقعی cPanel و UX دستگاه | Pending | پس از deploy با غرفهٔ active و آگهی approved اجرا شود |

## Development Sprint 136 - Hosted Storefront Smoke

| Task | Status | Acceptance Criteria |
|---|---|---|
| health و readiness مقصد | Done | live/ready با HTTP 200 و database آماده باشند |
| public API smoke | Done | categories، cities، feed و captcha با shape صحیح پاسخ دهند |
| CORS production | Done | preflight وب با HTTP 204 و origin صحیح پاسخ دهد |
| fixture واقعی غرفه | Pending | feed مقصد حداقل یک آگهی approved متصل به storefront active داشته باشد |

## Development Sprint 137 - Standard Release Naming

| Task | Status | Acceptance Criteria |
|---|---|---|
| اصلاح default release version | Done | اجرای release بدون override، نسخهٔ جاری `0.1.36` را بسازد |
| نام‌گذاری Web/API/manifest | Done | الگوی `4d-{target}-v<semver>-<date>` یکسان باشد |
| build و release preflight | Done | build، preflight و bundle budget سبز باشند |
| APK موبایل جدید | Deferred | مستقل از cPanel و فقط در صورت نیاز با EAS release شود |

## Development Sprint 138 - Transport, Profile and Trust Hardening

| Task | Status | Acceptance Criteria |
|---|---|---|
| Transport responsive و action | Done | کنترل‌ها در mobile/tablet overflow نداشته باشند و search action واقعی باشد |
| Hero CTA و intent ورود | Done | ثبت آگهی و آگهی‌های نزدیک dead button نباشند |
| Navbar cleanup | Done | badge مبهم حساب فعال حذف شود |
| Profile account facts | Done | شماره mask‌شده، شهر، عضویت و وضعیت حساب نمایش داده شود |
| Trust model تفکیک‌شده | Done | phone/profile/identity/storefront جدا و server-sourced باشند |
| build و visual regression | Done | check، ۶۰ تست API، build، bundle و visual QA سبز باشند |

## Development Sprint 139 - Transport Card Overflow Fix

| Task | Status | Acceptance Criteria |
|---|---|---|
| حذف ارتفاع ثابت کارت حمل‌ونقل | Done | جستجوی بازشده در پایین کارت clip نشود |
| فیلترهای موبایل | Done | مبدأ، مقصد و نوع مسیر تک‌ستونه و width کامل باشند |
| regression و release | Done | check، build، visual QA، bundle و release استاندارد سبز باشند |

## Development Sprint 141 - Identity Status and Profile UX Fix

| Task | Status | Acceptance Criteria |
|---|---|---|
| حفظ تأیید هویت ادمین | Done | ذخیرهٔ پروفایل وضعیت verified را overwrite نکند |
| نمایش وضعیت واقعی در Profile | Done | `/me` و UI مقدار واقعی را نمایش دهند |
| جلوگیری از بازشدن خودکار فرم | Done | فرم فقط با اقدام صریح کاربر باز شود |
| ورود به درخواست بررسی دستی | Done | دکمهٔ واضح به پشتیبانی وصل باشد |
| آپلود امن مدارک | Pending | پس از تنظیم Object Storage خصوصی و migration مستقل |
| Sprint 142 | احراز هویت دستی با مدرک، صف ادمین و وضعیت پایدار | تکمیل شد | نیازمند اجرای migration در production و سیاست retention مدارک |
| Sprint 144 | مدل مستقل هویت و Trust، badgeهای Web/Mobile، نمایش ادمین و revocation | تکمیل محلی | نیازمند اجرای migrationهای 0028 تا 0030 روی production و smoke دستگاه واقعی |
# پیگیری ممیزی جاری — ۲۰۲۶-۱۱-۲۰

مرجع جاری اصلاحات، تست‌ها و موارد باز: [REMEDIATION_TRACKER](audit/REMEDIATION_TRACKER.md). محدودسازی هدرهای تست، هم‌زمانی OTP/refresh، مرز نمایش آگهی و allowlist اعلان پیاده شده‌اند. انتشار روی سرور ممنوع است. تحویل سورس بررسی‌شده با تأیید کاربر روی شاخه audit انجام می‌شود؛ پذیرش نهایی محصول هنوز باز است.

