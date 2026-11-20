# گزارش تکمیل Development Sprint 32

## عنوان

Conversation Inbox and Unread Polish

## تاریخ

2026-08-12

## وضعیت

Done

## خروجی‌ها

- migration جدید `0009_conversation_reads.sql` برای نگهداری read state هر کاربر در هر گفتگو اضافه شد.
- API لیست گفتگوهای کاربر با `unread_count`، preview آخرین پیام، زمان آخرین پیام و فرستنده آخرین پیام غنی شد.
- باز کردن گفتگو در web باعث read شدن پیام‌های همان گفتگو برای کاربر می‌شود.
- ارسال پیام، preview و زمان آخرین پیام را در UI سریع به‌روزرسانی می‌کند.
- تب حساب و کارت گفتگو badge پیام جدید و حالت بصری برجسته دارند.
- نشست فعال web هر ۳۰ ثانیه داده‌های گفتگو و حساب را refresh می‌کند.

## اعتبارسنجی

- `npm run check`
- `npm run build`
- `npm test`
- `npm run db:migrate`
- `npm run qa:visual`

همه موارد بالا با موفقیت اجرا شدند. Visual QA از Chrome نصب‌شده روی سیستم استفاده کرد.

## بدهی باقی‌مانده

- notification/push واقعی
- read receipt نمایشی و دقیق‌تر
- block/report پیام
- realtime کامل یا WebSocket بعد از تثبیت beta
- object storage production برای رسانه‌ها
