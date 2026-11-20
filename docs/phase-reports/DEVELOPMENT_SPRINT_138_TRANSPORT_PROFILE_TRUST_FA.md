# Development Sprint 138 — Transport, Profile and Trust Hardening

تاریخ: ۱۴۰۵/۰۶/۱۰

## تغییرات

- CTAهای Hero از anchor بی‌اثر به action واقعی تبدیل شدند: ثبت آگهی وارد flow ثبت می‌شود و در حالت anonymous intent تا بعد از ورود حفظ می‌شود؛ «آگهی‌های نزدیک» به feed اسکرول نرم دارد.
- badge مبهم «حساب فعال» از Navbar حذف شد.
- جستجوی پیشرفته حمل‌ونقل با کنترل‌های width-safe و responsive برای موبایل/تبلت تثبیت شد.
- `/api/v1/me` وضعیت account، زمان عضویت و وضعیت احراز هویت را server-side برمی‌گرداند.
- Profile شماره موبایل را mask‌شده و خوانا، شهر اصلی، وضعیت حساب و تاریخ عضویت را نمایش می‌دهد.
- Trust UI به «اعتماد و امنیت» تغییر کرد و mobile verification، profile completion، identity status و storefront status را جدا نمایش می‌دهد؛ احراز هویت واقعی فعلاً پیاده‌سازی نشده است.

## Verification

- `npm run check`: PASS
- API tests: ۶۰ از ۶۰ PASS
- Web build: PASS
- Bundle budget: PASS
- Visual QA در desktop/mobile market/admin/listing: PASS؛ overflow مشاهده نشد.
- Release cPanel: PASS؛ نسخهٔ استاندارد `v0.1.37-2026-09-01` ساخته شد.

## محدودیت

تست دستی با حساب واقعی، همهٔ ترکیب‌های trust و تست مقصد cPanel برای fixture غرفه در این increment انجام نشد. Identity verification واقعی وجود ندارد و به‌درستی با همین عنوان نمایش داده می‌شود.
