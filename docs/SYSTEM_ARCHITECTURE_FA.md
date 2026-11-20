# System Architecture پروژه 4D

## وضعیت سند

- Phase: Phase 8 - System Architecture
- وضعیت: نسخه اول تکمیل شد
- تاریخ: 2026-08-11
- ورودی‌ها: Domain Model، Database & API Design، PRD MVP، UX Design

## 1. تصمیم معماری

معماری MVP:

> Modular Monolith با database مشترک PostgreSQL، ماژول‌های داخلی با boundary روشن، job worker سبک، object storage برای media و API واحد برای web/mobile/admin.

این تصمیم برای MVP 4D مناسب است چون:

- تیم و scope اولیه کوچک است.
- latency و عملیات deployment ساده‌تر می‌ماند.
- transactionهای marketplace، moderation و contact ساده‌تر کنترل می‌شوند.
- پیچیدگی microservice، Kubernetes و event streaming سنگین وارد MVP نمی‌شود.
- اگر رشد واقعی رخ دهد، ماژول‌ها از ابتدا مرزهای قابل جداسازی دارند.

## 2. Architecture Diagram

```text
Mobile App / Web App / Admin Panel
              |
              v
        API Gateway / Backend App
              |
   ┌──────────┼──────────────────────────────────┐
   |          |                                  |
Application Modules                     Cross-cutting
   |                                      |
   ├─ Identity                            ├─ Auth Middleware
   ├─ Users                               ├─ Validation
   ├─ Geography                           ├─ Rate Limiting
   ├─ Categories                          ├─ Audit Logging
   ├─ MarketContent                       ├─ Structured Logging
   ├─ Search                              ├─ Error Handling
   ├─ Favorites                           └─ Feature Flags
   ├─ Contact
   ├─ Moderation
   ├─ Trust
   ├─ Analytics
   └─ Administration
              |
              v
       PostgreSQL Database
              |
      ┌───────┴────────┐
      v                v
 Object Storage     Background Worker
 media files        expiry, analytics rollups,
                    media checks, notifications
```

## 3. Runtime Components

| Component | نقش | MVP |
|---|---|---|
| Backend API | API v1، business logic، auth، moderation، contact | Yes |
| Web App | تجربه web برای feed/search/create/profile/admin entry | Yes |
| Mobile App | هدف محصول؛ ممکن است در implementation با web/mobile strategy دقیق شود | Yes هدف |
| Admin Panel | queue و moderation و audit | Yes |
| PostgreSQL | database اصلی، search پایه، analytics raw events | Yes |
| Object Storage | ذخیره عکس‌ها | Yes |
| Background Worker | expiry، پردازش media، rollup analytics، notification آینده | Yes سبک |
| Cache | cache محدود برای category/city/feed hot paths | Optional MVP |
| External SMS Provider | OTP | Yes |
| Error Tracking | ثبت خطاهای runtime | Yes در foundation |

## 4. Module Responsibilities

| Module | مسئولیت اصلی | نباید انجام دهد |
|---|---|---|
| Identity | OTP، session، auth state | نگهداری profile محصولی |
| Users | profile، role view، user signals | تصمیم moderation |
| Geography | region و city | geo radius در MVP |
| Categories | category و attribute definitions | search execution |
| MarketContent | create/edit/status content و subtype rules | auth/session |
| Search | feed، query، filter، sort | تغییر content |
| Favorites | favorite add/remove/list | نمایش محتوای غیر approved |
| Contact | conversation، message، contact event، block | تماس بدون context |
| Moderation | reports، cases، decisions، queue | ساخت TrustScore ترکیبی |
| Trust | signalهای جدا، cache trust data | scoring قطعی و غیرشفاف |
| Analytics | raw events و rollupهای اولیه | تصمیم product خودکار |
| Administration | admin views، role management محدود | business logic پنهان |
| Audit | audit log عملیات حساس | جایگزین analytics |

## 5. Dependency Rules

### مجاز

- API layer می‌تواند application serviceهای moduleها را صدا بزند.
- moduleها می‌توانند از shared primitives، error contract و event publisher داخلی استفاده کنند.
- MarketContent می‌تواند Users، Geography، Categories و Media را reference کند.
- Search فقط read model/query روی MarketContent و taxonomy دارد.
- Moderation می‌تواند target reference به content/user/message داشته باشد.
- Analytics فقط event دریافت می‌کند و business transaction را کنترل نمی‌کند.

### ممنوع

- moduleها مستقیم tableهای داخلی module دیگر را mutate نکنند.
- UI به database مستقیم وصل نشود.
- background worker business rule متفاوت از backend نداشته باشد.
- Admin Panel bypass برای status change بدون audit log نداشته باشد.
- Search نباید source of truth محتوا باشد.
- Analytics نباید برای authorization یا moderation decision ضروری باشد.

## 6. Data Flowهای اصلی

### ثبت محتوا

```text
Client
→ API create listing/wanted/service
→ Auth + mobile verified check
→ Validation
→ MarketContent transaction
→ status=submitted
→ ModerationCase created
→ AnalyticsEvent ContentSubmitted
→ Response
```

### انتشار بعد از moderation

```text
Moderator/Admin Panel
→ Moderation decision approve
→ Authorization moderator
→ Moderation transaction
→ market_contents.status=approved
→ ContentStatusHistory
→ AuditLog
→ AnalyticsEvent ContentApproved
→ Search-visible immediately via DB query
```

### جستجو

```text
Client
→ /api/v1/search
→ Search module
→ PostgreSQL query on approved non-expired content
→ city/category/price filters
→ AnalyticsEvent SearchPerformed
→ Results
```

### شروع ارتباط

```text
Client
→ start conversation from content detail
→ Auth check
→ content approved check
→ owner != actor check
→ Conversation upsert/create
→ Message or ContactEvent
→ AnalyticsEvent ContactStarted
→ Response
```

## 7. Storage و Media

### Strategy

- فایل‌ها در object storage ذخیره می‌شوند.
- database فقط metadata و `storage_key` را نگه می‌دارد.
- upload مستقیم client به storage با signed URL ترجیح دارد.
- media قبل از نمایش عمومی باید حداقل status قابل کنترل داشته باشد.

### MVP Media Processing

- validate file type و size
- ساخت thumbnail در worker یا هنگام upload
- virus/malware scanning اگر provider یا runtime اجازه دهد، در base security بررسی شود
- حذف hard فایل فقط با policy مشخص؛ در MVP soft reference removal کافی است

## 8. Search Architecture

MVP:

- PostgreSQL query روی `market_contents`
- index روی status/city/category/created_at
- `search_text` normalized برای فارسی
- sort پیش‌فرض جدیدترین

Future:

- trigram/fuzzy search
- materialized search vector
- OpenSearch/Elasticsearch فقط وقتی query volume یا quality واقعاً نیاز ایجاد کند

## 9. Chat و Notification

### Chat/Contact

- `Conversation` و `Message` داخل database اصلی نگهداری می‌شوند.
- realtime در MVP الزامی نیست؛ polling یا refresh کافی است.
- اگر realtime لازم شد، WebSocket/SSE در فاز توسعه اضافه می‌شود.
- هر conversation باید content context داشته باشد.

### Notification

MVP:

- notification داخلی ساده یا status در UI
- SMS فقط برای OTP

Future:

- push notification
- پیامک برای رخدادهای خاص
- email در صورت نیاز

## 10. Caching

MVP بدون cache خارجی هم قابل شروع است.

cacheهای مجاز:

- in-memory cache کوتاه برای cities/categories
- HTTP cache برای taxonomy عمومی
- cache feed فقط بعد از مشاهده bottleneck

Redis در MVP الزامی نیست؛ اگر برای rate limit/session/job queue نیاز واقعی ایجاد شود در Phase 10 بررسی می‌شود.

## 11. Background Jobs

Jobهای MVP:

- expire کردن WantedListing و ServiceRequest
- analytics rollup ساده
- media thumbnail/check
- cleanup sessionهای منقضی
- notification آینده

قاعده:

Jobها باید idempotent باشند و audit/business history را خراب نکنند.

## 12. Observability

حداقل‌های معماری:

- structured logging با `request_id`, `user_id`, `module`, `action`
- error tracking
- health checks:
  - `/health/live`
  - `/health/ready`
- metrics:
  - request count/latency/error rate
  - DB query latency
  - moderation queue size
  - upload failure rate
  - job failures
- audit logs برای عملیات حساس

## 13. Feature Flags

Feature flagها باید از ابتدا در معماری قابل پشتیبانی باشند، حتی اگر implementation ساده باشد.

use caseهای اولیه:

- فعال‌سازی feature برای یک شهر
- beta برای user group
- فعال/غیرفعال کردن category
- فعال‌سازی Business Profile آینده
- فعال‌سازی monetization آینده

## 14. Deployment Strategy

### MVP پیشنهادی

- یک backend app deployable
- یک web/admin frontend deployable
- یک worker process
- یک PostgreSQL managed database
- object storage managed
- environment-based config

### Release مسیر

Internal
→ Alpha
→ Closed Beta
→ 4D Pilot
→ Public Regional Release

### Environments

| Environment | هدف |
|---|---|
| local | development |
| staging | تست integration و QA |
| production | کاربران واقعی |

## 15. Security Architecture سطح سیستم

جزئیات کامل در Phase 9 می‌آید، اما معماری باید این‌ها را پشتیبانی کند:

- auth middleware مرکزی
- authorization بر اساس role و ownership
- rate limit برای OTP، reports، messages، create content
- audit log immutable-style
- secret management خارج از کد
- validation یکپارچه requestها
- عدم نمایش شماره موبایل عمومی
- moderation برای محتوای public

## 16. Scalability Path

### بدون تغییر معماری

- افزایش منابع backend
- بهینه‌سازی indexها
- اضافه کردن cache محدود
- worker جداگانه
- read replica برای reporting آینده

### جداسازی احتمالی آینده

فقط اگر داده و فشار واقعی ایجاد شود:

- Search service
- Media processing service
- Notification service
- Analytics pipeline

Microservice برای MVP ممنوع است؛ جداسازی فقط با دلیل عملیاتی واقعی.

## 17. Technology Selection Guardrails

Phase 8 framework قطعی انتخاب نمی‌کند. انتخاب stack در Phase 10 باید با این معیارها انجام شود:

- developer productivity
- AI agent support
- امنیت و maintenance
- talent availability
- hosting cost
- فارسی/RTL ecosystem برای frontend
- testing ecosystem
- deployment complexity

گزینه‌های محتمل:

- Backend: Node.js/NestJS، Laravel، Django/FastAPI، یا گزینه مشابه
- Web/Admin: Next.js/React یا گزینه مشابه
- Mobile: Flutter یا React Native

انتخاب قطعی بدون تحلیل در Phase 10 مجاز نیست.

## 18. Exit Criteria Phase 8

| معیار | وضعیت |
|---|---|
| Architecture Diagram آماده است | Done |
| Moduleها و مسئولیت‌ها مشخص شده‌اند | Done |
| Dependency Rules تعریف شده‌اند | Done |
| Runtime components مشخص شده‌اند | Done |
| Storage و Media strategy مشخص شده است | Done |
| Search architecture مشخص شده است | Done |
| Chat/Notification architecture مشخص شده است | Done |
| Caching، Logging، Deployment و Observability مشخص شده‌اند | Done |
