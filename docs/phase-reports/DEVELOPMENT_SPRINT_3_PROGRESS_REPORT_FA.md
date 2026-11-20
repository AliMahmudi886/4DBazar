# Progress Report - Development Sprint 3

## وضعیت

Development Sprint 3 برای persistence تعامل‌های اعتمادمحور شروع شده و بخش اول آن تکمیل شده است.

## انجام‌شده

- migration دوم برای `contact_events`، `reports` و `moderation_cases` اضافه شد.
- typeهای Kysely برای جدول‌های جدید sync شدند.
- repository جدید trust برای ثبت contact intent، ثبت report و خواندن moderation queue ساخته شد.
- API `POST /api/v1/contact-intents` اضافه شد و به auth/mobile verification وصل است.
- API `POST /api/v1/reports` اضافه شد و reasonهای MVP را validate می‌کند.
- moderation queue پایه از `moderation_cases` خوانده می‌شود و در نبود DB fallback امن دارد.
- UI تماس و گزارش از حالت صرفاً local state به درخواست واقعی API وصل شد و fallback کاربرپسند حفظ شد.

## Validation

موفق:

- `npm run check`
- `npm run build`
- `npm test`
- live moderation queue smoke check روی `http://127.0.0.1:4000/api/v1/admin/moderation/cases`
- live web smoke check روی `http://127.0.0.1:5173`

## کارهای باقی‌مانده

- روشن کردن Docker Desktop
- اجرای `npm run docker:up`
- اجرای `npm run db:migrate`
- اجرای `npm run db:seed`
- smoke test واقعی ثبت آگهی، شروع تماس و ثبت گزارش روی PostgreSQL
- اتصال audit logger به `audit_logs`
