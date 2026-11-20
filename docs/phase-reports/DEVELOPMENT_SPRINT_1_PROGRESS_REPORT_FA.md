# Progress Report - Development Sprint 1

## وضعیت

Development Sprint 1 شروع شده ولی هنوز کامل نشده است.

## انجام‌شده

- Kysely + pg به‌عنوان ابزار database access انتخاب شد.
- Docker Compose برای PostgreSQL اضافه شد.
- migration اولیه SQL برای region، city، category، users، sessions، market_contents، listings، status history و audit logs ایجاد شد.
- seed داده‌های 4D شامل region، چهار شهر، categoryهای P0 و user توسعه‌ای اضافه شد.
- DB client، migration runner و seed runner اضافه شد.
- API readiness به database check وصل شد.
- endpointهای cities/categories از database خوانده می‌شوند.
- create/read پایه برای Listing اضافه شد.
- راهنمای اجرای محلی در `docs/RUN_LOCAL_FA.md` اضافه شد.
- web shell از حالت صفحه ساده به UI کاربردی اولیه تبدیل شد: وضعیت API/DB، فیلتر شهر/دسته، فید آگهی‌های ثبت‌شده در session و فرم ثبت آگهی.
- API برای cities/categories در حالت نبود database fallback توسعه‌ای برمی‌گرداند تا UI بدون Docker هم قابل مشاهده باشد.

## Validation

موفق:

- `npm run check`
- `npm run build`
- `npm test`
- health API روی `http://127.0.0.1:4000/health/live`
- web shell روی `http://127.0.0.1:5173`

نیازمند اقدام محیطی:

- `docker compose up -d postgres` اجرا نشد چون Docker Desktop/daemon روشن نبود.
- migration/seed واقعی روی PostgreSQL باید بعد از روشن شدن Docker Desktop اجرا شود.

## کارهای باقی‌مانده

- اجرای واقعی migration/seed روی PostgreSQL
- auth/session واقعی به‌جای header stub
- audit log persistence در table `audit_logs`
- تکمیل content read/create integration tests با database واقعی
- اتصال feed واقعی به `market_contents`
- نمایش محتوای persisted بعد از refresh صفحه
