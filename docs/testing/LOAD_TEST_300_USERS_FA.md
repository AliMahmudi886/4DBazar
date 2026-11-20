# گزارش ممیزی و تست بار ۳۰۰ کاربر مجازی 4D

تاریخ گزارش: ۱۴۰۵/۰۵/۳۰
نسخه ابزار: `scripts/load-test-300.mjs`
وضعیت: **NOT READY / PASS WITH WARNINGS برای اجرای تست بار**

## خلاصه اجرایی

طرح تست و harness بدون وابستگی خارجی آماده شد و ramp-up read-heavy روی API محلی اجرا شد. API در طول تست crash نکرد و هیچ 5xx یا خطای شبکه‌ای ثبت نشد، اما rate limit از مراحل بالاتر فعال شد و تعداد زیادی پاسخ 429 تولید کرد. اجرای بار روی `https://4dbazar.ir` یا `https://api.4dbazar.ir` به‌دلیل ریسک آسیب به محیط واقعی عمداً ممنوع است.

## خروجی‌های آماده

- طرح کامل سناریوها و معیارها: `docs/testing/LOAD_TEST_PLAN_300_USERS_FA.md`
- ابزار اجرای محلی: `scripts/load-test-300.mjs`
- دستور npm: `npm run load:test:300`
- خروجی‌های عددی پس از اجرا: `docs/testing/results/load-*.json`

ابزار فقط مقصدهای `localhost`، `127.0.0.1`، `::1` و دامنه‌های `.test` را می‌پذیرد و مقصد production را رد می‌کند.

## محیط بررسی‌شده

- API: Node.js/TypeScript/Fastify در `apps/api`
- Web: React/Vite در `apps/web`
- Mobile: Expo/React Native با قرارداد API مشترک
- Persistence: PostgreSQL/Kysely
- Auth: OTP، password، captcha proof، bearer session و rate limit
- Media: local storage در محیط تست
- توزیع هدف: ۱۵۰ browse/search، ۶۰ buyer، ۵۰ seller، ۲۰ service/wanted، ۱۵ heavy، ۵ admin/moderator
- ramp-up: ۱۰، ۲۵، ۵۰، ۱۰۰، ۱۵۰، ۲۰۰، ۲۵۰ و ۳۰۰ کاربر

## وضعیت اجرای واقعی

| مورد | وضعیت | توضیح |
|---|---|---|
| typecheck ابزار | PASS | `node --check scripts/load-test-300.mjs` |
| check پروژه | PASS | `npm run check` |
| Docker/PostgreSQL | DEGRADED | Docker daemon به‌دلیل مجوز سیستم قابل بررسی کامل نبود؛ API محلی موجود بود |
| API تست محلی | PASS با محدودیت | health و read endpointها پاسخ دادند؛ تست write/auth اجرا نشد |
| ramp-up تا ۳۰۰ | PARTIAL PASS | هر ۸ مرحله اجرا شد؛ ۵۴۱۹ درخواست ثبت شد |
| stress/spike/soak | NOT RUN | پس از ramp-up پایه اجرا می‌شود |
| تست production | REFUSED | برای جلوگیری از فشار و تغییر داده واقعی |

### اجرای محلی بدون rate limit سراسری

برای تفکیک ظرفیت API از رفتار حفاظتی، API دوم روی `127.0.0.1:4001` با `NODE_ENV=test` و `LOAD_TEST_MODE=true` اجرا شد. این bypass فقط روی host محلی و خارج از production قابل فعال‌سازی است؛ در production حتی با تنظیم متغیر نیز فعال نمی‌شود.

| شاخص | مقدار |
|---|---:|
| Requests | ۵۴۱۹ |
| 2xx | ۵۴۱۹ |
| 4xx / 5xx / network | ۰ |
| P50 | ۶۰ms |
| P90 | ۲۶۰ms |
| P95 | ۵۰۷ms |
| P99 | ۷۱۶ms |

خروجی کامل: `docs/testing/results/load-2026-08-23T21-43-54.717Z.json`

## معیارهای نهایی

نتیجه اجرای read-heavy:

| شاخص | مقدار |
|---|---:|
| Requests | ۵۴۱۹ |
| 2xx | ۷۲۰ |
| 429 rate limit | ۴۶۹۹ |
| 5xx / network error | ۰ |
| P50 | ۴۳ms |
| P90 | ۶۶ms |
| P95 | ۷۶ms |
| P99 | ۱۴۷ms |

خروجی کامل: `docs/testing/results/load-2026-08-21T11-27-37.788Z.json`

معیار baseline تعریف‌شده در طرح:

- Read API: P95 کمتر از ۵۰۰ms
- Search: P95 کمتر از ۸۰۰ms
- Write API: P95 کمتر از ۱۰۰۰ms
- Chat send: P95 کمتر از ۵۰۰ms
- Error rate کمتر از ۱٪

## الزامات اجرای بعدی

1. Docker Desktop یا PostgreSQL تستی را روشن کنید؛ DB باید جدا از production باشد.
2. API را با `NODE_ENV=development`، `OTP_PROVIDER=stub` و `MEDIA_STORAGE_PROVIDER=local` روی `127.0.0.1:4000` اجرا کنید.
3. migration و seed را اجرا کنید.
4. برای تست ظرفیت بدون rate limit سراسری، API را با `LOAD_TEST_MODE=true` اجرا کنید؛ این حالت فقط برای localhost و محیط غیرproduction معتبر است.
5. در صورت نیاز، tokenهای test را در `LOAD_TEST_TOKENS` قرار دهید؛ secret یا token واقعی production ممنوع است.
6. ابتدا با `LOAD_TEST_USERS=10` و سپس مراحل پیش‌فرض اجرا کنید.

نمونه اجرای PowerShell:

```powershell
docker version
npm run docker:up
$env:NODE_ENV = "development"
$env:OTP_PROVIDER = "stub"
$env:MEDIA_STORAGE_PROVIDER = "local"
npm run db:migrate
npm run db:seed
npm run dev:api
```

در terminal جدا:

```powershell
$env:LOAD_TEST_BASE_URL = "http://127.0.0.1:4000"
$env:LOAD_TEST_USERS = "300"
npm run load:test:300
```

## نتیجه و تصمیم

**NOT READY / PASS WITH WARNINGS برای تست بار کامل.** read ramp-up تا ۳۰۰ در دو حالت انجام شد: حالت عادی با ۴۶۹۹ پاسخ 429، و حالت local-only بدون rate limit با ۰ خطا. API بدون 5xx پایدار ماند، اما P95 در حالت بدون محدودیت در مرحله نهایی از baseline خواندن عبور کرد. تست‌های authenticated buyer/seller/admin، write، upload، chat، DB pressure، stress/spike/soak و IDOR هنوز اجرا نشده‌اند و برای آن‌ها DB ایزوله و fixture token لازم است.

## کیفیت و gateهای مرتبط

- `npm test`: PASS؛ ۵۰ تست API و ۱ تست shared
- `npm run build`: PASS
- `npm run check`: PASS
- `npm run bundle:check`: FAIL؛ مجموع JS برابر ۵۵۵KB و بودجه ۵۴۷KB است
- `npm run qa:quality`: FAIL؛ اسکریپت Playwright با `browserContext.newPage` و context ناقص متوقف شد
