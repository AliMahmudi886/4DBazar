# Development Foundation پروژه 4D

## وضعیت سند

- Phase: Phase 10 - Development Foundation
- وضعیت: نسخه اول تکمیل شد
- تاریخ شروع: 2026-08-11

## تصمیم Stack نسخه اول

| لایه | انتخاب | دلیل |
|---|---|---|
| زبان اصلی | TypeScript | یکپارچگی backend/web، تست‌پذیری، پشتیبانی خوب agentها |
| Backend API | Node.js + Fastify | سبک، سریع، مناسب Modular Monolith و API contract |
| Web/Admin | Vite + React | scaffold سریع، RTL-friendly، مناسب shell اولیه |
| Shared Package | TypeScript package | اشتراک enumها، error contract و نوع‌های پایه |
| Database هدف | PostgreSQL | مطابق Phase 7 و Phase 8 |
| تست پایه | Node test runner + TypeScript build | کم‌وابستگی و مناسب foundation |

## ساختار Scaffold

```text
apps/
  api/
  web/
packages/
  shared/
```

## وضعیت فعلی

- monorepo با npm workspaces ایجاد شد.
- API skeleton با health، ready و endpoint شهرهای 4D ایجاد شد.
- web/admin shell فارسی و RTL ایجاد شد.
- shared package برای city/content/error contract پایه ایجاد شد.
- config validation، error contract و structured logging پایه در API شروع شد.
- CI workflow پایه ایجاد شد.
- auth، role authorization، mobile verification guard، rate limit سبک و audit logger skeleton ایجاد شد.
- migration foundation placeholder ایجاد شد.
- build، typecheck و test با موفقیت اجرا شدند.

## موارد deferred بعد از Phase 10

- اضافه کردن migrationهای واقعی
- انتخاب ORM/query builder
- اتصال واقعی PostgreSQL
- انتخاب SMS provider
- انتخاب object storage provider
- تولید OpenAPI executable spec
- تکمیل OpenAPI executable spec
