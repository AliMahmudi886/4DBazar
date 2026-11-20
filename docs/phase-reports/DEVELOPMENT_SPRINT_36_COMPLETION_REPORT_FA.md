# گزارش تکمیل Development Sprint 36

## عنوان

Web Chat Notifications

## تاریخ

2026-08-12

## وضعیت

Done

## خروجی‌ها

- notification tray داخل برنامه برای پیام‌های جدید اضافه شد.
- Browser Notification opt-in برای اعلان اختیاری سیستم اضافه شد.
- افزایش unread نسبت به refresh قبلی تشخیص داده می‌شود.
- گفتگوهای mute شده، blocked یا گفتگوی باز فعلی اعلان جدید نمی‌سازند.
- با باز کردن گفتگو، اعلان همان گفتگو از tray پاک می‌شود.
- اعلان‌های سیستم فقط بعد از permission مرورگر و فقط برای پیام‌های unmuted/unblocked ساخته می‌شوند.

## اعتبارسنجی

- `npm run check`
- `npm run build`
- `npm test`
- `npm run qa:visual`

همه موارد بالا با موفقیت اجرا شدند. Visual QA از Chrome نصب‌شده روی سیستم استفاده کرد.

## بدهی باقی‌مانده

- push سروری واقعی با service worker subscription
- WebSocket یا realtime کامل
- notification در حالت بسته بودن کامل مرورگر
- تنظیمات پیشرفته notification برای هر گفتگو
- read receipt نمایشی کامل
