# Security & Trust پروژه 4D

## وضعیت سند

- Phase: Phase 9 - Security & Trust
- وضعیت: نسخه اول تکمیل شد
- تاریخ: 2026-08-11
- ورودی‌ها: System Architecture، Database & API Design، Domain Model، PRD MVP

## 1. هدف امنیت و اعتماد

هدف Phase 9 این است که MVP 4D با کمترین پیچیدگی لازم، در برابر سوءاستفاده‌های رایج بازار محلی قابل دفاع باشد و اعتماد کاربر را بدون وعده امنیت مطلق افزایش دهد.

اصل مهم:

> Trust signalها نشانه‌اند، نه تضمین.

4D نباید در MVP وانمود کند معامله‌ها را تضمین می‌کند؛ چون payment، escrow، KYC سنگین و logistics خارج از scope هستند.

## 2. Security Scope برای MVP

داخل scope:

- authentication با OTP و session امن
- authorization بر اساس owner، participant، moderator و admin
- mobile verification برای ایجاد محتوا
- rate limit برای OTP، create، report، message و search abuse
- moderation workflow برای محتوای عمومی
- report و block
- audit log برای عملیات حساس
- privacy شماره موبایل و داده‌های داخلی trust
- media validation پایه
- admin least privilege

خارج از scope MVP:

- KYC سنگین
- face recognition
- پرداخت امن و escrow
- fraud AI پیچیده
- recommendation یا risk scoring پیشرفته
- logistics verification

## 3. Threat Model

| سطح | تهدید | اثر | کنترل MVP |
|---|---|---|---|
| Auth | OTP spam یا brute force | هزینه، مزاحمت، takeover | rate limit، cooldown، token hash، session expiry |
| User | ساخت حساب‌های زیاد | spam و fraud | mobile verification، rate limit، moderation history |
| Content | آگهی جعلی یا ممنوع | کاهش اعتماد | pre-publication moderation، report، duplicate checks ساده |
| Content | duplicate/spam listing | افت کیفیت feed | automatic flag، rate limit create، moderation queue |
| Search | scrape یا query abuse | فشار سیستم و استخراج داده | rate limit، pagination cursor، عدم نمایش داده حساس |
| Contact | پیام مزاحم یا fraud | آسیب کاربر | context conversation، report/block، rate limit messages |
| Report | report abuse علیه رقبا | حذف ناعادلانه | report به‌تنهایی حذف نکند، review case، audit |
| Admin | سوءاستفاده moderator/admin | تغییر وضعیت یا دسترسی غیرمجاز | role محدود، audit، least privilege |
| Data | افشای شماره موبایل | privacy breach | عدم نمایش عمومی، masking، access محدود |
| Media | فایل مخرب یا نامناسب | امنیت/کیفیت | type/size validation، moderation، storage isolation |
| API | IDOR و دسترسی به محتوای دیگران | privacy و trust breach | authorization مرکزی و تست access control |

## 4. Authentication و Session

قواعد:

- شماره موبایل باید normalized و unique باشد.
- OTP request باید rate limit و cooldown داشته باشد.
- token خام در database ذخیره نشود؛ فقط hash ذخیره شود.
- session باید `expires_at` و `revoked_at` داشته باشد.
- logout باید session را revoke کند.
- admin/moderator بهتر است session کوتاه‌تر از user عادی داشته باشد.

حداقل rate limit پیشنهادی:

| عملیات | سیاست اولیه |
|---|---|
| OTP request | محدودیت بر اساس phone + IP |
| OTP verify | محدودیت تلاش ناموفق |
| create content | محدودیت روزانه/ساعتی برای کاربر جدید |
| message | محدودیت تعداد پیام شروعی |
| report | محدودیت برای جلوگیری از report abuse |

## 5. Authorization

قواعد مرکزی:

- owner می‌تواند محتوای خودش را ببیند، ویرایش کند یا حذف کند.
- کاربران عمومی فقط content با status `approved` و غیر expired/deleted را می‌بینند.
- participant فقط conversation خودش را می‌بیند.
- moderator فقط به moderation context لازم دسترسی دارد.
- admin به role management و audit وسیع‌تر دسترسی دارد.
- هیچ endpoint admin/moderator بدون audit action حساس انجام ندهد.

تست‌های اجباری آینده:

- user A نتواند محتوای draft/submitted user B را ببیند.
- user A نتواند conversation user B را بخواند.
- moderator بدون role نتواند decision ثبت کند.
- owner نتواند status را مستقیم approved کند.

## 6. Moderation Workflow

Workflow پایه:

```text
Content Submitted
→ Automatic Checks
→ ModerationCase
→ Moderator Review
→ Decision
→ Status Update
→ AuditLog
→ User-visible Status
```

تصمیم‌های مجاز:

- approve
- reject
- edit_required
- warning
- suspend
- ban
- escalate

قواعد:

- `reject` و `edit_required` باید reason داشته باشند.
- `ban` در MVP فقط برای admin یا moderator ارشد مجاز باشد.
- report کاربر مستقیم باعث حذف عمومی نشود.
- هر decision باید actor، target، reason، timestamp و audit log داشته باشد.
- محتوای rejected/suspended در feed/search عمومی نمایش داده نشود.

## 7. Automatic Checks سبک

MVP به fraud AI پیچیده نیاز ندارد. checkهای سبک:

- عنوان یا توضیح خیلی کوتاه
- link یا شماره تماس در متن، اگر policy محدود کند
- کلمات ممنوع
- duplicate احتمالی بر اساس title + user + city + category
- تعداد زیاد create در بازه کوتاه
- media type یا size نامعتبر
- report count غیرعادی

خروجی automatic checks فقط flag است؛ حذف قطعی بدون policy انسانی انجام نشود.

## 8. Trust Architecture

### Trust Signals عمومی MVP

| Signal | نمایش عمومی | توضیح |
|---|---|---|
| mobile_verified | بله | نشانه پایه اعتبار حساب |
| account_age | بله | عمر حساب |
| approved_content_count | بله یا محدود | سابقه فعالیت، بدون اغراق |
| response_rate | بعداً | نیازمند داده کافی |
| report_count | خیر | فقط داخلی |
| moderation_history | خیر | فقط داخلی |

### Trust داخلی

برای moderation و risk:

- تعداد reportهای معتبر
- content rejected count
- duplicate flags
- block history
- suspicious activity
- account velocity

قانون:

هیچ `TrustScore` عددی ترکیبی در MVP ساخته یا نمایش داده نمی‌شود.

## 9. Abuse Prevention

### Spam Content

- create rate limit
- pre-publication review
- duplicate flag
- محدودیت سخت‌تر برای کاربران جدید

### Fraud و محتوای مشکوک

- report reason `fraud_suspicion`
- moderation escalation
- نمایش متن ایمنی در contact flow
- عدم وعده تضمین معامله

### Report Abuse

- report rate limit
- duplicate report detection
- گزارش زیاد از یک user به تنهایی دلیل حذف نیست
- moderator باید report context ببیند

### Message Abuse

- شروع conversation فقط از content approved
- owner با content خودش conversation عادی شروع نکند
- block/report در conversation
- rate limit برای پیام‌های شروعی کاربران جدید

### OTP Abuse

- cooldown
- IP + phone rate limit
- ثبت تلاش ناموفق
- عدم افشای اینکه شماره وجود دارد یا نه

## 10. Admin Security

Roleها:

| Role | دسترسی |
|---|---|
| user | استفاده عادی |
| moderator | review queue، decision محدود، مشاهده context لازم |
| admin | role management، audit، عملیات حساس |

قواعد:

- least privilege
- عملیات role assignment فقط admin
- همه decisionهای moderation audit شوند
- admin نباید بتواند audit log را حذف کند
- moderator نباید به اطلاعات حساس غیرضروری مثل شماره کامل موبایل دسترسی عمومی داشته باشد
- عملیات ban/suspend باید reason و ideally confirmation داشته باشد

## 11. Privacy و Data Protection

قواعد:

- شماره موبایل عمومی نمایش داده نشود.
- phone number در logها mask شود.
- token و OTP خام هرگز log نشوند.
- metadata analytics نباید message body یا داده حساس غیرضروری را ذخیره کند.
- report description می‌تواند حساس باشد و فقط برای moderator نمایش داده شود.
- حذف کاربر و retention policy در future policy طراحی شود.

## 12. Logging و Audit Policy

Structured logs:

- request_id
- user_id در صورت auth
- module
- action
- status_code
- latency

نباید log شوند:

- OTP
- token
- password/secret
- شماره موبایل کامل
- متن کامل پیام‌ها مگر policy moderation خاص وجود داشته باشد

Audit log برای:

- role assignment
- moderation decision
- status change حساس
- user suspend/ban
- admin access به user context
- تغییر category/feature flag در آینده

## 13. Media Security

MVP:

- فقط image typeهای مجاز
- size limit
- storage key غیرقابل حدس
- signed upload/download یا public CDN فقط برای media approved
- media rejected عمومی نشود

Future:

- malware scanning
- image moderation automated
- perceptual hash برای duplicate/fraud

## 14. API Security Requirements

- validation server-side برای همه requestها
- authorization در service layer، نه فقط UI
- cursor pagination opaque باشد
- `Idempotency-Key` برای create/report/conversation/moderation decision
- CORS محدود به originهای مجاز
- security headers در web/admin
- admin endpoints زیر path مشخص و role-protected
- rate limit و request size limit

## 15. User Safety Copy

در contact/detail باید متن ایمنی کوتاه وجود داشته باشد:

- قبل از اطمینان، بیعانه یا اطلاعات حساس ندهید.
- معامله حضوری را در مکان امن انجام دهید.
- اگر موردی مشکوک بود، گزارش کنید.

این copy نباید تجربه را سنگین کند، اما برای trust محلی ضروری است.

## 16. Residual Risks

| ریسک | چرا باقی می‌ماند؟ | برنامه کاهش |
|---|---|---|
| fraud انسانی | بدون KYC/escrow حذف کامل ممکن نیست | report، moderation، safety copy، trust signals |
| moderation bottleneck | pre-publication review دستی است | automatic flags، queue metrics، policy refinement |
| false positive moderation | تصمیم انسانی خطاپذیر است | reason، edit_required، appeal آینده |
| account farming | mobile verification کافی نیست | rate limit، activity velocity، report history |
| message abuse | chat داخلی سطح حمله دارد | block/report/rate limit |

## 17. ورودی‌های Phase 10

Phase 10 باید این موارد را در foundation اجرایی لحاظ کند:

- auth middleware
- role/ownership authorization helper
- validation layer
- rate limit mechanism
- audit log infrastructure
- structured logging با masking
- security tests پایه
- secrets/config management
- migration برای security-related constraints
- seed roleهای admin/moderator با روش امن

## 18. Exit Criteria Phase 9

| معیار | وضعیت |
|---|---|
| Threat Model نوشته شده است | Done |
| Moderation Policy پایه تعریف شده است | Done |
| Abuse Prevention طراحی شده است | Done |
| Trust Architecture تعریف شده است | Done |
| Admin Security تعریف شده است | Done |
| Security Requirements پایه مشخص شده‌اند | Done |
