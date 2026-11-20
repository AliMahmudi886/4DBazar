# Development Sprint 128 — Admin User Content Moderation

## نتیجه

در User Detail پنل ادمین، آگهی‌های دارای وضعیت `submitted` اکنون دکمه‌های تأیید و رد دارند. تصمیم‌ها به مسیر رسمی moderation متصل‌اند و پس از موفقیت، صف و داده بازار refresh می‌شوند.

## ایمنی

- فقط برای آگهی در انتظار بررسی دکمه تصمیم نمایش داده می‌شود.
- guard موجود `moderator` در API حفظ شده است.
- برای آگهی منتشرشده، ردشده یا بایگانی‌شده کنترل moderation نشان داده نمی‌شود.

## اعتبارسنجی

- `npm run check`: PASS
- `npm run test -w @four-d/api`: PASS — ۵۶ تست
- `npm run build -w @four-d/web`: PASS

## موارد باز

تست عملی با حساب admin روی cPanel و E2E کامل پنل هنوز نیازمند محیط مقصد است.
