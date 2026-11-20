# گزارش تکمیل Development Sprint 72

تاریخ: 2026-08-13

## خروجی

- `PUT /api/v1/me/contents/:contentId` برای ویرایش مالکانه
- `DELETE /api/v1/me/contents/:contentId` برای soft-delete مالکانه
- جلوگیری از دسترسی کاربر به آگهی مالک دیگر
- بازگشت آگهی ویرایش‌شده به وضعیت `submitted` برای بررسی مجدد
- نمایش عملیات حذف در «آگهی‌های من» موبایل با تایید کاربر
- refresh لیست بعد از حذف

## اعتبارسنجی

- `npm run check` موفق
- `npm run build` موفق
- تست API با ۴۰ تست موفق
- `npm run typecheck -w @four-d/mobile` موفق
- `npx expo export --platform android` موفق

## محدودیت

فرم ویرایش جزئیات آگهی هنوز در موبایل اضافه نشده و در sprint بعدی می‌آید. فعلاً کنترل حذف و نمایش وضعیت persisted فعال است.

## گام بعد

فرم ویرایش موبایل، انتخاب مجدد تصویر و سپس message thread کامل با ارسال پیام.
