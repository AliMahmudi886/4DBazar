# گزارش تکمیل Development Sprint 34

## عنوان

Conversation Mute Preferences

## تاریخ

2026-08-12

## وضعیت

Done

## خروجی‌ها

- migration جدید `0010_conversation_preferences.sql` برای preference هر کاربر در هر گفتگو اضافه شد.
- endpoint `PUT /api/v1/conversations/:conversationId/preferences` برای mute/unmute گفتگو اضافه شد.
- API فقط به participant همان گفتگو اجازه تغییر preference می‌دهد.
- گفتگوهای mute شده در badge کل پیام جدید حساب نمی‌شوند.
- UI داخل drawer چت کنترل mute/unmute دارد.
- لیست گفتگوها برای گفتگوهای mute شده برچسب «بی‌صدا» نشان می‌دهد.
- تست validation برای مقدار mute نامعتبر اضافه شد.

## اعتبارسنجی

- `npm run check`
- `npm run build`
- `npm run db:migrate`
- `npm test`
- `npm run qa:visual`

همه موارد بالا با موفقیت اجرا شدند. Visual QA از Chrome نصب‌شده روی سیستم استفاده کرد.

## بدهی باقی‌مانده

- block کامل کاربر یا گفتگو
- mute زمان‌دار
- notification/push واقعی
- read receipt نمایشی کامل
- realtime کامل یا WebSocket
