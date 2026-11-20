# گزارش تکمیل Development Sprint 33

## عنوان

Chat Safety Controls

## تاریخ

2026-08-12

## وضعیت

Done

## خروجی‌ها

- گزارش مستقیم پیام از داخل drawer چت اضافه شد.
- بعد از گزارش پیام، همان پیام در UI به حالت «گزارش شد» تغییر می‌کند.
- API برای `target_type=message` بررسی می‌کند که گزارش‌دهنده عضو گفتگوی همان پیام باشد.
- نوع هدف گزارش فقط از بین `content`، `user` و `message` پذیرفته می‌شود.
- پنل moderation برای گزارش پیام، preview متن پیام را نمایش می‌دهد.
- preview گفتگو در inbox تمیزتر شد و مسیر safety چت برای beta آماده‌تر شد.

## اعتبارسنجی

- `npm run check`
- `npm run build`
- `npm test`
- `npm run qa:visual`

## بدهی باقی‌مانده

- block/mute کاربر یا گفتگو
- notification/push واقعی
- read receipt نمایشی کامل
- realtime کامل یا WebSocket
- policy دقیق‌تر برای پیام‌های گزارش‌شده
