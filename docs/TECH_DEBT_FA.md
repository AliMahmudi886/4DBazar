# Tech Debt Register پروژه 4D

در این سند علاوه بر بدهی فنی، بدهی محصولی و مستنداتی هم ثبت می‌شود؛ چون پروژه هنوز وارد کدنویسی نشده است.

| ID | نوع | شرح | علت | اثر | اولویت | وضعیت |
|---|---|---|---|---|---|---|
| TD-001 | Documentation | Phase 0 بر اساس repository خالی انجام شد و هنوز داده واقعی محصولی تولید نشده است | نقطه شروع پروژه | نیاز به تکمیل Phase 1 تا 9 قبل از کدنویسی | P0 | Open |
| TD-002 | Process | Git repository فعال نیست | درخواست صریح برای initialize وجود نداشت | نبود history و commitهای کوچک تا زمان فعال‌سازی Git | P1 | Open |
| TD-003 | Research | داده‌های محلی و competitor sources هنوز گردآوری نشده‌اند | Phase 2 هنوز شروع نشده | فرضیات cold start و category ممکن است تغییر کنند | P0 | Open |
| TD-004 | Research | Phase 2 فعلاً desk research است و داده میدانی ندارد | محدودیت دسترسی به کاربران محلی در این اجرا | تصمیم‌های launch نیازمند validation میدانی هستند | P0 | Open |
| TD-005 | UX | UX فعلاً information architecture و flow design است و wireframe تصویری ندارد | اولویت Phase 5 روی جریان‌های قابل تبدیل به domain بود | قبل از UI implementation باید wireframe/prototype تهیه شود | P1 | Open |
| TD-006 | Architecture | Search اولیه با PostgreSQL طراحی شد و engine جدا deferred شد | کاهش پیچیدگی MVP | در صورت افت کیفیت search یا رشد داده باید بازبینی شود | P2 | Open |
| TD-007 | API | OpenAPI executable spec هنوز تولید نشده است | Phase 7 طراحی مستنداتی بود، نه scaffold | قبل از implementation backend بهتر است تولید شود | P1 | Open |
| TD-008 | Architecture | frameworkها و providerهای اجرایی هنوز انتخاب نشده‌اند | Phase 8 عمداً معماری را از انتخاب stack جدا نگه داشت | در Phase 10 قبل از scaffold باید تصمیم‌گیری شوند | P0 | Open |
| TD-009 | Architecture | realtime chat و Redis از MVP حذف/ deferred شدند | ساده‌سازی MVP | اگر usage واقعی نیاز نشان دهد باید اضافه شوند | P2 | Open |
| TD-010 | Security | security tests و automation هنوز پیاده نشده‌اند | Phase 9 طراحی مستنداتی بود | در Phase 10 باید پایه تست امنیتی ایجاد شود | P0 | Open |
| TD-011 | Policy | retention، appeal و delete account policy کامل نیست | خارج از MVP فوری | قبل از public release باید تکمیل شود | P1 | Open |
| TD-012 | Backend | ارسال و verify واقعی SMS با Kavenegar پاس شد، OTP challenge در PostgreSQL ذخیره/مصرف می‌شود و phone-based rate limit/cleanup script اضافه شد | credential واقعی نباید در repository ثبت شود و cleanup هنوز scheduler خارجی ندارد | قبل از beta باید secret management production و زمان‌بندی cleanup در deploy تکمیل شود | P0 | In Progress |
| TD-022 | Backend | cleanup نشست‌های منقضی و revoked هنوز job ندارد | Sprint 9 فقط logout/revoke درخواست‌محور را ساخت | background job یا maintenance query برای پاکسازی نشست‌ها لازم است | P2 | Open |
| TD-013 | Backend | audit logger به `audit_logs` وصل شد، اما فعلاً best-effort است | نباید خطای audit عملیات کاربر را خراب کند | در production باید retry/alert strategy داشته باشد | P1 | In Progress |
| TD-014 | Backend | rate limit فعلاً in-memory است | Redis/cache خارجی deferred بود | قبل از production با strategy مناسب جایگزین شود | P1 | Open |
| TD-015 | DevOps | migration/seed روی PostgreSQL واقعی validate شد | Docker Desktop روشن شد و پورت پروژه به `55432` منتقل شد | نیاز به CI database job در آینده باقی است | P1 | In Progress |
| TD-016 | Frontend | visual QA خودکار، overflow detection، polish loading/empty state، CI workflow و vendor chunk split اولیه اضافه شد، اما baseline comparison و code-splitting عمیق route/admin هنوز ندارد | Sprintهای 11، 22 و 23 smoke screenshot، overflow detection، polish UX و CI را ساختند و Sprint 42 warning اندازه chunk را با manual chunks حذف کرد | در آینده snapshot/baseline diff و lazy loading عمیق‌تر برای admin/chat اضافه شود | P2 | In Progress |
| TD-023 | Tooling | Playwright browser bundled به دلیل محدودیت CDN نصب نشد، اما visual QA fallback به Chrome سیستم و preview داخلی دارد | CDN دانلود Chromium با 403 پاسخ داد | CI روی Windows با Chrome سیستم قابل اجراست؛ برای Linux/کانتینر باید browser cache یا mirror تنظیم شود | P2 | Accepted |
| TD-017 | Frontend | فید در نبود database هنوز fallback demo/local preview دارد | تجربه dev بدون DB باید قابل مشاهده بماند | با DB روشن، فید واقعی از seed/persisted خوانده می‌شود | P2 | Accepted |
| TD-018 | Product/API | contact intent و report روی PostgreSQL واقعی validate شدند | Sprint 4 smoke test واقعی انجام شد | نیاز بعدی UI/admin کامل‌تر برای moderation است | P1 | In Progress |
| TD-019 | Security | role moderator از DB/session واقعی خوانده می‌شود و header fallback در production غیرفعال است؛ fallback فقط برای dev/test باقی مانده | توسعه محلی و تست‌های سریع هنوز به fallback نیاز دارند | قبل از beta باید permission model و admin boundaries سخت‌تر شوند | P2 | Accepted |
| TD-020 | Product/Admin | route مستقیم `/admin`، visibility boundary و data boundary مبتنی بر نقش moderator اضافه شد، اما پنل ادمین هنوز داخل همان web bundle است | برای سرعت توسعه و validation محصولی | بعداً admin app/bundle جدا و audit detail دقیق‌تر لازم است | P2 | In Progress |
| TD-021 | Product/Admin | review detail آگهی هنوز compact است؛ تصویر آگهی نمایش داده می‌شود اما چک‌لیست policy و reason ساختاری ندارد | Sprint 8 چرخه اصلی را اولویت داد و Sprint 25 فقط media MVP را اضافه کرد | قبل از beta باید review detail کامل‌تر و policy reason ساختاری اضافه شود | P1 | Open |
| TD-024 | Media | عکس آگهی از Sprint 28 به فایل local و URL عمومی `/media/...` تبدیل می‌شود، اما هنوز object storage managed نیست | حذف base64 از رکورد آگهی قدم اول بود و provider production هنوز انتخاب نشده است | برای production باید object storage، resize server-side، moderation و lifecycle policy اضافه شود | P1 | Open |
| TD-025 | Security/UX | کپچای پازلی از Sprint 29 proof امضاشده سمت سرور دارد و در Sprint 31 از نظر UX polish شد، اما هنوز provider ضد bot managed نیست | baseline داخلی برای کاهش abuse مسیر OTP اضافه شد | قبل از public release باید provider ضد bot production-grade، IP/device reputation و observability اضافه شود | P1 | In Progress |
| TD-026 | Security/Auth | ورود با رمز با scrypt hash و rate limit تلاش ناموفق اضافه شد، اما reset password هنوز از مسیر SMS OTP و تغییر رمز در پروفایل انجام می‌شود | برای MVP ساده‌تر از recovery flow کامل است | قبل از انتشار عمومی باید policy رمز و reset flow مستقل اضافه شود | P1 | In Progress |
| TD-027 | Product/Chat | چت داخل برنامه اکنون read state، unread count، preview آخرین پیام، polling منظم، گزارش پیام، mute/block گفتگو، notification سبک وب، ذخیره subscription و ارسال best-effort Push دارد، اما read receipt نمایشی، block سراسری کاربر، realtime کامل و retry/analytics پیشرفته Push هنوز اضافه نشده‌اند | Sprint 32 مسیر سبک‌تر از WebSocket را برای MVP انتخاب کرد، Sprint 33 report پیام را به moderation وصل کرد، Sprint 34 mute گفتگو را اضافه کرد، Sprint 35 block در سطح گفتگو را اضافه کرد، Sprint 36 notification وب را ساخت، Sprint 37 ثبت Push subscription را اضافه کرد و Sprint 38 delivery سبک را فعال کرد | برای beta عمومی باید delivery به job queue جدا، retry/backoff، block سراسری کاربر، real-time/WebSocket و policy کامل گفتگو اضافه شود | P1 | In Progress |
| TD-028 | Mobile/Maintainability | `apps/mobile/App.tsx` بزرگ، دارای نسل‌های قدیمی component و `@ts-nocheck` است | توسعه سریع چند Sprint روی shell واحد انجام شده است | تغییرات آینده blast radius بالا و type safety ناقص دارند | P1 | Open |
| TD-029 | Mobile/Security | Expo SDK 53/Metro در audit کل monorepo ۲۲ هشدار transitive دارد و رفع خودکار نسخه breaking پیشنهاد می‌کند | نسخه فعلی با SDK و React Native سازگار و APK موجود بر پایه همین زنجیره ساخته شده است | پیش از انتشار عمومی باید migration کنترل‌شده Expo، rebuild و device QA Android/iOS انجام شود | P1 | Monitoring |

## قانون ثبت

هر shortcut، compromise یا تصمیم موقت باید با دلیل و برنامه بازپرداخت در این سند ثبت شود.
